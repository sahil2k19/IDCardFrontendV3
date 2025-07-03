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
import { Search, RefreshCw,  Calendar, Users  } from "lucide-react"
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
     <div className="w-full max-w-4xl mx-auto pt-3">
    <div className="flex justify-center">
      <div className="relative group">
        {/* Main Header Container */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-8 py-2 rounded-2xl shadow-2xl border border-gray-700 hover:border-gray-500 transition-all duration-300 ease-out hover:shadow-3xl transform hover:scale-[1.02]">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-800 to-transparent opacity-20"></div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center space-x-4">
            {/* Calendar Icon */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-4 h-4 text-gray-900" />
            </div>

            {/* Title Text */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent leading-tight">
                <span className="block sm:inline">{eventName}</span>
                <span className="block sm:inline sm:ml-2 text-gray-300 font-semibold">All ID Cards</span>
              </h1>
            </div>

            {/* Users Icon */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="w-4 h-4 text-gray-900" />
            </div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-40 animate-pulse delay-300"></div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 scale-110"></div>
      </div>
    </div>

    {/* Subtitle or Additional Info */}
    <div className="flex justify-center mt-4">
      <div className="flex items-center space-x-2 text-gray-600 text-sm font-medium">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
        <span>Event Management System</span>
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
      </div>
    </div>
  </div>

      {/* Search */}
      <div className="w-full max-w-4xl mx-auto pt-3">
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {/* Search Input Container */}
      <div className="relative w-full sm:w-auto flex-1 max-w-2xl">
        <div className="relative group">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-300" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name, email, ID or designation…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-300 rounded-xl shadow-lg focus:shadow-2xl focus:from-gray-50 focus:to-white focus:border-gray-500 focus:outline-none transition-all duration-300 ease-out text-gray-900 placeholder-gray-500 font-medium hover:border-gray-400 hover:shadow-xl"
          />

          {/* Input Glow Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-900 to-black opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        </div>

        {/* Search Results Count or Status */}
        {searchTerm && (
          <div className="absolute -bottom-6 left-4 text-xs text-gray-500 font-medium">
            Searching for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Reload Button */}
      <div className="flex-shrink-0">
        <button
          className="group relative overflow-hidden bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border border-gray-700 hover:border-gray-500 min-w-[140px]"
          onClick={fetchData}
        >
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
            <span className="text-sm font-medium">Reload</span>
          </div>

          {/* Button Glow Effect */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-active:opacity-20 transform -translate-x-full group-active:translate-x-full transition-all duration-500"></div>
        </button>
      </div>
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
