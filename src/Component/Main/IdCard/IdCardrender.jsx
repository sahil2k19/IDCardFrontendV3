import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import EditParticipent from "../Edit/EditParticipent";
import IdCard from "./IdCard";
import EditControls from "./EditControls";
import VisibilityModal from "./VisibilityModal";
import DownloadButtons from "./DownloadButtons";
import SearchBar from "./SearchBar";
import { RefreshCw } from "lucide-react";
function IdCardrender({
  Dataid,
  fetchData,
  isLoading,
  eventName,
  fetchDesignations,
  eventId,
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenedit, setIsModalOpenedit] = useState(false);
  const [elementStyles, setElementStyles] = useState({
    profilePicture: { bottom: 160, size: 170 },
    name: { top: 200, left: 200, fontSize: 20, color: "black" },
    institute: { bottom: 130, left: 200, fontSize: 18, color: "black" },
    designation: { bottom: 107, left: 200, fontSize: 16, color: "black" },
    qrCode: { bottom: 15, left: 200, },
    participantId: { bottom: 1, fontSize: 12, left: 200, color: "black" },
  });
  const [globalVisibility, setGlobalVisibility] = useState({
    name: true,
    profilePicture: true,
    institute: true,
    designation: true,
    qrCode: true,
    participantId: true,
  });
  const [previewCard, setPreviewCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkedInParticipants, setCheckedInParticipants] = useState({});

  useEffect(() => {
    fetchDesignSettings();
    fetchCheckinStatus();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchCheckinStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/participants/checkins/${eventId}`
      );
      if (response.data) {
        const checkinMap = {};
        response.data.forEach((item) => {
          checkinMap[item.participantId] = true;
        });
        setCheckedInParticipants(checkinMap);
      }
    } catch (error) {
      console.error("Error fetching check-in statuses:", error);
    }
  };

  const fetchDesignSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/participants/design/${eventId}`
      );
      if (response.data && response.data.elementStyles) {
        setElementStyles(response.data.elementStyles);
      }
      if (response.data && response.data.visibility) {
        setGlobalVisibility(response.data.visibility);
      }
    } catch (error) {
      console.error("Error fetching design settings:", error);
    }
  };

  const saveDesignSettings = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants/design/${eventId}`,
        {
          elementStyles,
          visibility: globalVisibility,
        }
      );
      Swal.fire("Success", "Design settings saved successfully", "success");
    } catch (error) {
      console.error("Error saving design settings:", error);
      Swal.fire("Error", "Failed to save design settings", "error");
    }
  };

  const handleCheckin = async (participantId) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/participants/participant/${participantId}/checkin`
      );
      Swal.fire({
        title: "Success!",
        text: "Participant checked in successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setCheckedInParticipants((prev) => ({
        ...prev,
        [participantId]: true,
      }));
      return data;
    } catch (err) {
      console.error("Check-in error:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to check in participant",
        icon: "error",
      });
    }
  };

  // Toggle modals
  const toggleModalOpen = () => setIsModalOpen((prev) => !prev);
  const toggleModalOpenedit = () => {
    if (!isModalOpenedit && Dataid.length > 0) {
      setPreviewCard(Dataid[0]);
    }
    setIsModalOpenedit((prev) => !prev);
  };

  // Visibility toggle
  const toggleGlobalVisibility = (field) => {
    setGlobalVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Update style for an element
  const updateElementStyle = (element, property, value) => {
    setElementStyles((prev) => ({
      ...prev,
      [element]: { ...prev[element], [property]: value },
    }));
    if (previewCard) setPreviewCard({ ...previewCard });
  };

  // Download helpers
  const filteredData = Array.isArray(Dataid)
    ? [...Dataid].reverse().filter((card) => {
      const term = searchTerm.toLowerCase();
      return (
        `${card.firstName} ${card.lastName}`.toLowerCase().includes(term) ||
        card.email?.toLowerCase().includes(term) ||
        card.participantId?.toLowerCase().includes(term) ||
        card.designation?.toLowerCase().includes(term)
      );
    })
    : [];
  const reversedData = filteredData;

  const downloadAllImagesAsZip = () => {
    setLoading(true);
    const zip = new JSZip();
    const images = reversedData.map((_, index) => {
      return new Promise((resolve) => {
        const element = document.getElementById(`id-card-${index}`);
        import("html-to-image").then(({ toPng }) => {
          toPng(element, { cacheBust: true, quality: 1, pixelRatio: 3 }).then(
            (dataUrl) => {
              zip.file(`id-card-${index}.png`, dataUrl.split(",")[1], {
                base64: true,
              });
              resolve();
            }
          );
        });
      });
    });
    Promise.all(images).then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "id-cards.zip");
        setLoading(false);
      });
    });
  };

  const downloadAllImagesWithoutBackgroundAsZip = () => {
    setLoading(true);
    const zip = new JSZip();
    const images = reversedData.map((_, index) => {
      return new Promise((resolve) => {
        const element = document.getElementById(`id-card-${index}`);
        const backgroundImage = element.querySelector("img");
        const originalDisplay = backgroundImage
          ? backgroundImage.style.display
          : null;
        if (backgroundImage) backgroundImage.style.display = "none";
        import("html-to-image").then(({ toPng }) => {
          toPng(element, {
            cacheBust: true,
            backgroundColor: null,
            quality: 1,
            pixelRatio: 3,
          })
            .then((dataUrl) => {
              zip.file(
                `id-card-${index}-no-background.png`,
                dataUrl.split(",")[1],
                { base64: true }
              );
              resolve();
            })
            .catch(() => resolve())
            .finally(() => {
              if (backgroundImage) backgroundImage.style.display = originalDisplay;
            });
        });
      });
    });
    Promise.all(images).then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "id-cards-no-background.zip");
        setLoading(false);
      });
    });
  };

  const downloadAllEntries = () => {
    setLoading(true);
    const formattedData = reversedData.map((card, index) => ({
      "S.No": index + 1,
      EventName: card.eventName,
      EventID: card.eventId,
      FirstName: card.firstName,
      LastName: card.lastName,
      Designation: card.designation,
      Institute: card.institute,
      PhoneNumber: card.phone,
      ParticipantID: card.participantId,
      email: card.email,
      ProfilePicture: card.profilePicture,
      Amenities: JSON.stringify(card.amenities),
      CreatedAt: new Date(card.createdAt).toLocaleString(),
      UpdatedAt: new Date(card.updatedAt).toLocaleString(),
      CheckedIn: checkedInParticipants[card._id] ? "true" : "false",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(wb, ws, "ID Cards");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${eventName}_ID_Cards.xlsx`);
    setLoading(false);
  };

  if (!Array.isArray(Dataid) || Dataid.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg font-bold text-center">
          No ID cards found for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10">
      <div className="flex justify-center ">
        <h1 className="text-2xl border text-center px-5  p-1 rounded-md pb-2 bg-gray-200 mb-6 font-bold">
          {eventName} All ID Cards
        </h1>
      </div>
     
      {/* Search */}
    <div className="flex gap-6 justify-center ">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />  <div className="flex items-center justify-center">
        <button className="ml-4  flex text-white py-3 px-3 font-semibold text-lg gap-3  rounded-lg   bg-blue-700 hover:bg-blue-800  text-center" onClick={fetchData} ><RefreshCw />Reload</button>

      </div>
    </div>
      {/* Download/Edit/Visibility */}
      <DownloadButtons
        loading={loading}
        downloadAllImagesAsZip={downloadAllImagesAsZip}
        downloadAllImagesWithoutBackgroundAsZip={
          downloadAllImagesWithoutBackgroundAsZip
        }
        downloadAllEntries={downloadAllEntries}
        toggleModalOpenedit={toggleModalOpenedit}
        toggleModalOpen={toggleModalOpen}
      />
      {/* Edit All Modal */}
      {isModalOpenedit && (
        <EditControls
          previewCard={previewCard}
          elementStyles={elementStyles}
          setElementStyles={setElementStyles}
          setPreviewCard={setPreviewCard}
          globalVisibility={globalVisibility}
          saveDesignSettings={saveDesignSettings}
          toggleModalOpenedit={toggleModalOpenedit}
          reversedData={reversedData}
          fetchData={fetchData}
          isLoading={isLoading}
          fetchDesignations={fetchDesignations}
          eventId={eventId}
          checkedInParticipants={checkedInParticipants}
          handleCheckin={handleCheckin}
        />
      )}
      {/* Visibility Modal */}
      {isModalOpen && (
        <VisibilityModal
          globalVisibility={globalVisibility}
          toggleGlobalVisibility={toggleGlobalVisibility}
          saveDesignSettings={saveDesignSettings}
          toggleModalOpen={toggleModalOpen}
        />
      )}
      {/* Cards */}
      <div className="flex flex-wrap justify-center gap-10">
        {reversedData.map((card, index) => (
          <IdCard
            key={index}
            card={card}
            fetchData={fetchData}
            index={index}
            isLoading={isLoading}
            fetchDesignations={fetchDesignations}
            eventId={eventId}
            reversedData={reversedData}
            globalVisibility={globalVisibility}
            elementStyles={elementStyles}
            checkedInParticipants={checkedInParticipants}
            handleCheckin={handleCheckin}
          />
        ))}
      </div>
    </div>
  );
}

export default IdCardrender;
