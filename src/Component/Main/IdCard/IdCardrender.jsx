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
import { Search, RefreshCw, Calendar, Users, Tag } from "lucide-react";
function IdCardrender({
  Dataid,
  fetchData,
  isLoading,
  eventName,
  fetchDesignations,
  eventId,
  eventData,
}) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenedit, setIsModalOpenedit] = useState(false);
  const [elementStyles, setElementStyles] = useState({
    profilePicture: { bottom: 160, size: 170 },
    name: { top: 200, left: 200, fontSize: 20, color: "black" },
    institute: { bottom: 130, left: 200, fontSize: 18, color: "black" },
    designation: { bottom: 107, left: 200, fontSize: 16, color: "black" },
    qrCode: { bottom: 15, left: 200 },
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
  // Add these state variables at the top of your component
  const [loadingZip, setLoadingZip] = useState(false);
  const [loadingZipNoBg, setLoadingZipNoBg] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
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
    setLoadingZip(true);
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
        setLoadingZip(false);
      });
    });
  };

  const downloadAllImagesWithoutBackgroundAsZip = () => {
    setLoadingZipNoBg(true);
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
              if (backgroundImage)
                backgroundImage.style.display = originalDisplay;
            });
        });
      });
    });
    Promise.all(images).then(() => {
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "id-cards-no-background.zip");
        setLoadingZipNoBg(false);
      });
    });
  };

  const downloadAllEntries = () => {
    setLoadingExcel(true);
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
    setLoadingExcel(false);
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
      <div className="w-full max-w-4xl mx-auto pt-3 relative">
        {/* Professional background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-blue-100 to-gray-50 rounded-2xl opacity-20 -m-4"></div>

        {/* Subtitle or Additional Info */}
        <div className="flex justify-center relative">
          <div className="flex text-2xl items-center space-x-4 text-slate-700 font-semibold relative group">
            {/* Left decorative line with professional gradient */}
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-blue-500 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

            {/* Main title with professional styling */}
            <span className="relative px-4 py-2 bg-gradient-to-r from-gray-200 via-slate-300 to-blue-100 rounded-lg shadow-sm border border-slate-200/50 group-hover:shadow-md group-hover:border-slate-300/60 transition-all duration-300">
              <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-blue-800 bg-clip-text text-transparent font-bold">
                {eventName}
              </span>
              <span className="text-slate-600 font-medium ml-2">All ID's</span>

              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-lg pointer-events-none"></div>
            </span>

            {/* Right decorative line with professional gradient */}
            <div className="w-12 h-px bg-gradient-to-l from-transparent via-slate-400 to-blue-500 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Professional accent dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse delay-0"></div>
          <div className="absolute top-6 right-1/4 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
        </div>

        {/* Subtle professional grid pattern */}
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51 65 85) 1px, transparent 0)`,
              backgroundSize: "16px 16px",
            }}
          ></div>
        </div>
      </div>

      {/* Search */}
      <div className="w-full max-w-4xl mx-auto py-3 relative">
        {/* Professional background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 rounded-2xl opacity-30 -m-2"></div>

        <div className="relative flex flex-col sm:flex-row gap-4 items-center justify-center">
          {/* Search Input Container */}
          <div className="relative w-full sm:w-auto flex-1 max-w-2xl">
            <div className="relative group">
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name, email, ID or designation…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-6 bg-gradient-to-r from-white via-slate-50 to-gray-50 border-2 border-slate-300 rounded-lg shadow-lg focus:shadow-xl focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 ease-out text-slate-900 placeholder-slate-500 font-medium hover:border-slate-400 hover:shadow-lg hover:from-slate-50 hover:to-white"
              />

              {/* Input Professional Glow Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>

              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-focus-within:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
            </div>

            {/* Search Results Count or Status */}
            {searchTerm && (
              <div className="absolute -bottom-6 left-4 text-xs  text-slate-600 font-medium   px-2 py-1 rounded-md shadow-sm">
                Searching for "{searchTerm}"
              </div>
            )}
          </div>

          {/* Professional Reload Button */}
          <div className="flex-shrink-0">
            <button
              className="group relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-800 to-gray-800 hover:from-slate-600 hover:via-slate-700 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-slate-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-slate-600/30 hover:border-slate-500/50 min-w-[140px]"
              onClick={fetchData}
            >
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
                <span className="text-sm font-medium">Reload</span>
              </div>

              {/* Professional Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              {/* Professional Ripple Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-active:opacity-100 transform -translate-x-full group-active:translate-x-full transition-all duration-300"></div>
            </button>
          </div>
        </div>

        {/* Professional subtle accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-8 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse delay-0"></div>
          <div className="absolute bottom-2 right-8 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
        </div>
      </div>
      {/* Download/Edit/Visibility */}
      <DownloadButtons
        loadingZip={loadingZip}
        loadingZipNoBg={loadingZipNoBg}
        loadingExcel={loadingExcel}
        downloadAllImagesAsZip={downloadAllImagesAsZip}
        downloadAllImagesWithoutBackgroundAsZip={
          downloadAllImagesWithoutBackgroundAsZip
        }
        downloadAllEntries={downloadAllEntries}
        toggleModalOpenedit={toggleModalOpenedit}
        toggleModalOpen={toggleModalOpen}
        eventData={eventData}
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
      <div className="flex flex-wrap justify-center gap-10 ">
        {reversedData.slice(0, 15).map((card, index) => (
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
