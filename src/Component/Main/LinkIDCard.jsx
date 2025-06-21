"use client";

import { useState, useEffect, useRef } from "react";

import axios from "axios";
import QRCode from "qrcode.react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";

// Enhanced responsive default style settings
const defaultElementStyles = {
  profilePicture: {
    bottom: "35%",
    size: "clamp(120px, 70%, 200px)",
  },
  name: {
    top: "35%",
    fontSize: "clamp(18px, 4.5vw, 25px)",
    color: "black",
  },
  institute: {
    bottom: "50%",
    fontSize: "clamp(14px, 3.5vw, 18px)",
    color: "black",
  },
  designation: {
    bottom: "55%",
    fontSize: "clamp(12px, 3vw, 13px)",
    color: "black",
  },
  qrCode: {
    bottom: "23%",
    size: 100, // Base size, will be adjusted dynamically
  },
  participantId: {
    bottom: "1%",
    fontSize: "clamp(12px, 3vw, 16px)",
    color: "black",
  },
};

// Placeholder image for when profile images fail to load
const PLACEHOLDER_PROFILE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='100' fill='%23e2e8f0'/%3E%3Ccircle cx='100' cy='85' r='40' fill='%23a0aec0'/%3E%3Cpath d='M160 155c0-33.1-26.9-60-60-60s-60 26.9-60 60' fill='%23a0aec0'/%3E%3C/svg%3E";

export default function LinkIDCard() {
  const params = useParams();
  const eventId = params?.eventId;
  const participantId = params?.participantId;
  const [defaultStyles, setDefaultStyles] = useState(defaultElementStyles);
  const [participant, setParticipant] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState(defaultStyles.qrCode.size);
  const [error, setError] = useState("");
  const idCardRef = useRef(null);
  const qrCodeRef = useRef(null);

  // Resize observer for dynamic QR code sizing
  useEffect(() => {
    if (!idCardRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Adjust QR code size based on container width (10% of container width)
      setQrCodeSize(Math.max(60, Math.min(width * 0.15, 80)));
    });

    observer.observe(idCardRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch participant data
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/participants/get-participant/${eventId}/${participantId}`
      )
      .then((res) => {
        setParticipant(res.data);
        setBackgroundImage(
          res.data.backgroundImage || res.data.background || ""
        );
      })
      .catch((err) => console.error("Error fetching participant:", err));

      fetchCardDesgin();
  }, [eventId, participantId]);

  const downloadImage = () => {
    const element = idCardRef.current;
    if (!element) return;

    setIsDownloading(true);
    setError("");

    // Use a filter to avoid CORS issues with external fonts
    const filter = (node) => {
      // Skip any nodes with external resources that might cause CORS issues
      if (
        node.tagName === "LINK" &&
        node.getAttribute("rel") === "stylesheet" &&
        node.getAttribute("href")?.includes("fonts.googleapis.com")
      ) {
        return false;
      }
      return true;
    };

    toPng(element, {
      cacheBust: true,
      backgroundColor: null,
      quality: 1,
      pixelRatio: 3,
      filter,
      skipFonts: true, // Skip embedding fonts to avoid CORS issues
    })
      .then((dataUrl) => {
        // Create a blob from the data URL
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeType = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeType });
        const url = URL.createObjectURL(blob);

        // Create a link and trigger download
        const link = document.createElement("a");
        link.href = url;
        link.download = `id-card-${participantId || "download"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
      })
      .catch((err) => {
        console.error("Could not download the image", err);
        setError("Failed to generate image. Please try again.");
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const fetchCardDesgin = ()=>{
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/participants/design/${eventId}`)
      .then((res) => {
        if (res.data && res.data.elementStyles) {
          setDefaultStyles(res.data.elementStyles);
        }
        // if (res.data && res.data.visibility) {
        //   setGlobalVisibility(res.data.visibility);
        // }
      })
  }

  if (!participant)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 text-center">Loading...</div>
      </div>
    );

  const participantUrl = `http://idcard.insideoutprojects.in/checkin/${
    participant._id || participant.id
  }`;

  return (
    <div className="flex flex-col  items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      {/* ID Card Container */}
      <div
        ref={idCardRef}
        className="relative h-[610px] w-[430px] aspect-[430/610] bg-white rounded-sm overflow-hidden shadow-lg"
      >
        {/* Background Image */}
        {backgroundImage && (
          <img
            src={backgroundImage || "/placeholder.svg?height=610&width=430"}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Profile Picture */}
        {participant.profilePicture && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex justify-center"
            style={{ bottom: defaultStyles.profilePicture.bottom }}
          >
            <img
              src={participant.profilePicture || PLACEHOLDER_PROFILE}
              alt="Profile"
              className="rounded-sm object-cover"
              style={{
                width: defaultStyles.profilePicture.size,
                height: defaultStyles.profilePicture.size,
              }}
              onError={(e) => {
                e.target.src = PLACEHOLDER_PROFILE;
              }}
            />
          </div>
        )}

        {/* Name */}
        <h2
          className="absolute bottom-[130px] w-[420px] whitespace-nowrap overflow-hidden text-lg transform -translate-x-1/2 font-bold text-center text-white mt-1 px-10 truncate"
          style={{
            top: defaultStyles.name.top,
            fontSize: defaultStyles.name.fontSize,
            color: defaultStyles.name.color,
            left: defaultStyles.name.left,
          }}
        >
          {participant.firstName} {participant.lastName}
        </h2>

        {/* Institute */}
        {participant.institute && (
          <p
            className="absolute left-0 right-0 text-center px-4 font-semibold"
            style={{
              bottom: defaultStyles.institute.bottom,
              fontSize: defaultStyles.institute.fontSize,
              color: defaultStyles.institute.color,
            }}
          >
            {participant.institute.toUpperCase()}
          </p>
        )}

        {/* Designation */}
        {participant.designation && (
          <p
            className="absolute left-1/2 -translate-x-1/2 text-center font-bold"
            style={{
              bottom: defaultStyles.designation.bottom,
              fontSize: defaultStyles.designation.fontSize,
              color: defaultStyles.designation.color,
            }}
          >
            {participant.designation}
          </p>
        )}

        {/* QR Code */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: defaultStyles.qrCode.bottom }}
        >
          <div ref={qrCodeRef} className="bg-white p-1 rounded-sm">
            <QRCode
              value={participantUrl}
              size={qrCodeSize}
              level="H"
              className="w-full h-auto"
              renderAs="svg"
            />
          </div>
        </div>

        {/* Participant ID */}
        {participant.participantId && (
          <div
            className="absolute left-1/2 -translate-x-1/2 text-center font-bold"
            style={{
              bottom: defaultStyles.participantId.bottom,
              fontSize: defaultStyles.participantId.fontSize,
              color: defaultStyles.participantId.color,
            }}
          >
            {participant.participantId}
          </div>
        )}

        {/* Tag */}
        {participant.tag && (
          <div className="absolute bottom-[2.5%] right-[3.5%] bg-green-100 px-2 py-1 text-sm font-bold rounded">
            {participant.tag}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 text-red-500 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={downloadImage}
        disabled={isDownloading}
        className="mt-6 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-black rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            <span>Download ID Card</span>
          </>
        )}
      </button>
    </div>
  );
}
