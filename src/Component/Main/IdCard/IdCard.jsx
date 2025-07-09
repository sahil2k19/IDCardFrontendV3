import { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import QRCode from "qrcode.react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import EditParticipent from "../Edit/EditParticipent";
import * as XLSX from "xlsx";
import {
  Edit,
  Trash2,
  Download,
  FileImage,
  UserCheck,
  Printer,
  FileText,
  Loader2,
} from "lucide-react";
const IdCard = ({
  card,
  index,
  fetchData,
  isLoading,
  fetchDesignations,
  elementStyles,
  eventId,
  reversedData,
  globalVisibility,
  isPreview = false,
  checkedInParticipants = {},
  handleCheckin,
}) => {
  const [modal, setModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const idCardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          @page {
            size: 50mm 50mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            width: 50mm;
            height: 50mm;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
          }
          h1, h2, h3 {
            display: block;
            margin: 0;
            line-height: 1.4;
          }
          .print-container {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div style="tetx-align: center;" class="print-container">
          ${content}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close(); // This triggers the DOM to load

    // Wait for print window to finish rendering before calling print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handlePrint2 = () => {
    if (printRef.current) {
      printScaled(printRef.current);
    }
  };

  function printScaled(node) {
    const html = `
    <html>
      <head>
        <style>
          /* remove all margins and make our container fill the page */
          @page { size: auto; margin: 0; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }

          /* this wrapper will stretch your content to the full printable area */
          #print-wrapper {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div style="text-align: center;" id="print-wrapper">
          ${node.outerHTML}
        </div>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
          window.onafterprint = () => window.close();
        </script>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return alert("Please allow pop-ups for printing.");
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function printAsSVG(node) {
    // Serialize your node’s HTML
    const html = node.outerHTML;

    // Build an SVG that fills the page and embeds your HTML via foreignObject
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="100%" height="100%"
         preserveAspectRatio="none">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml"
             style="box-sizing: border-box;
                    width:100%; height:100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;">
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;

    // Wrap it in an HTML page that forces no margins and auto-prints
    const page = `
    <html>
      <head>
        <style>
          @page { margin: 0; size: auto; }
          html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; }
        </style>
      </head>
      <body  style="text-align: center; font-family: Arial, sans-serif;">
        ${svg}
        <script>
          window.onload = () => { window.print(); };
          window.onafterprint = () => { window.close(); };
        </script>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return alert("Please enable pop-ups to print.");
    }
    printWindow.document.open();
    printWindow.document.write(page);
    printWindow.document.close();
  }

  const handlePrintSVG = () => {
    if (printRef.current) {
      printAsSVG(printRef.current);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    fetchDesignations(eventId);
  };

  const defaultElementStyles = {
    profilePicture: { left: 215, bottom: 160, size: 170 },
    name: { left: 215, top: 200, fontSize: 20, color: "black" },
    institute: { left: 215, bottom: 130, fontSize: 18, color: "black" },
    designation: { left: 215, bottom: 107, fontSize: 16, color: "black" },
    qrCode: { left: 215, bottom: 15 }, // Add size if you want: size: 100
    participantId: { left: 215, bottom: 1, fontSize: 12, color: "black" },
  };

  const styles = elementStyles || defaultElementStyles;
  const handleDelete = (id) => {
    Swal.fire({
      title: "Archive ID Cards?",
      text: "This will archive the ID Cards and can be reverted later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(
            process.env.REACT_APP_API_URL + `/api/participants/archive/${id}`,
            {
              archive: true,
            }
          )
          .then((res) => {
            Swal.fire("Archived!", "ID Cards has been archived.", "success");
            fetchData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const onCheckin = async () => {
    if (isCheckingIn || checkedInParticipants[card._id]) return;

    setIsCheckingIn(true);
    try {
      await handleCheckin(card._id);
    } finally {
      setIsCheckingIn(false);
    }
  };

  // const participantUrl =
  //   card && card._id
  //     ? `https://idcard.insideoutprojects.in/approve/${card._id}` // For Approve
  //     : "#";
  const participantUrl =
    card && card._id
      ? `http://idcard.insideoutprojects.in/checkin/${card._id}` // For Checkin
      : "#";
  //   console.log("card", card);
  const downloadImage = () => {
    const element = idCardRef.current;
    if (!element) return;

    setIsDownloading(true);

    toPng(element, {
      cacheBust: true,
      backgroundColor: null,
      quality: 1,
      pixelRatio: 3,
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `id-card-${index}.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Could not download the image", error);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  };

  const downloadImageWithoutBackground = () => {
    const element = idCardRef.current;
    if (!element) return;
    const originalBackgroundImage = element.querySelector("img").style.display;
    element.querySelector("img").style.display = "none";

    setIsDownloading(true);

    toPng(element, {
      cacheBust: true,
      backgroundColor: null,
      quality: 1,
      pixelRatio: 3,
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `id-card-${index}-no-background.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Could not download the image", error);
      })
      .finally(() => {
        element.querySelector("img").style.display = originalBackgroundImage;
        setIsDownloading(false);
      });
  };
  if (!card) {
    return <div>Loading...</div>;
  }
  // Renamed state

  const printIdCard = (withBackground = true) => {
    const element = idCardRef.current;
    if (!element) return;

    const backgroundImage = element.querySelector("img");
    const originalDisplay = backgroundImage
      ? backgroundImage.style.display
      : null;

    if (!withBackground && backgroundImage) {
      backgroundImage.style.display = "none";
    }

    setIsPrinting(true); // Start printing when the process begins

    toPng(element, {
      cacheBust: true,
      backgroundColor: null,
      quality: 1,
      pixelRatio: 3,
    })
      .then((dataUrl) => {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Print ID Card</title>
              <style>
                @page {
                  margin: 0;
                  size: auto;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                }
                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" />
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      })
      .catch((error) => {
        console.error("Could not print the image", error);
      })
      .finally(() => {
        setIsPrinting(false); // Stop printing after the process completes
        if (backgroundImage) {
          backgroundImage.style.display = originalDisplay;
        }
      });
  };

  // Handle case when Dataid is not an array or is empty

  return (
    <div
      className={`relative ${
        isPreview ? "" : "mb-20"
      } border border-gray-300 rounded-lg w-[430px] `}
    >
      <div
        ref={idCardRef}
        id={`id-card-${index}`}
        className="relative rounded-[1px] h-[610px] w-[430px]"
      >
        <div className="relative z-10 h-full text-white">
          <div className="absolute inset-0">
            {card.backgroundImage && (
              <img
                src={card.backgroundImage || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="relative h-full flex flex-col justify-between p-4 items-center">
            {globalVisibility.profilePicture && card.profilePicture && (
              <div
                style={{
                  bottom: styles.profilePicture.bottom ?? undefined,
                  top: styles.profilePicture.top ?? undefined,
                  left: styles.profilePicture.left ?? undefined,
                  right: styles.profilePicture.right ?? undefined,
                }}
                className="absolute bottom-[160px] left-[50%] transform -translate-x-1/2"
              >
                <img
                  style={{
                    objectFit: "cover",
                    width: `${styles.profilePicture.size}px`,
                    height: `${styles.profilePicture.size}px`,
                  }}
                  src={card.profilePicture || "/placeholder.svg"}
                  alt="Profile"
                  className="w-[170px] h-[170px] rounded-[2px]"
                />
              </div>
            )}

            {globalVisibility.name && card.firstName && (
              <p
                style={{
                  top: styles.name.top ?? undefined,
                  bottom: styles.name.bottom ?? undefined,
                  left: styles.name.left ?? undefined,
                  right: styles.name.right ?? undefined,
                  fontSize: `${styles.name.fontSize}px`,
                  color: styles.name.color,
                }}
                className="absolute bottom-[130px] w-[420px] whitespace-nowrap overflow-hidden text-lg transform -translate-x-1/2 font-bold text-center text-white mt-1 px-10 truncate"
              >
                {card.firstName}
              </p>
            )}

            {globalVisibility.institute && card.institute && (
              <p
                style={{
                  top: styles.institute.top ?? undefined,
                  bottom: styles.institute.bottom ?? undefined,
                  left: styles.institute.left ?? undefined,
                  right: styles.institute.right ?? undefined,
                  fontSize: `${styles.institute.fontSize}px`,
                  color: styles.institute.color,
                }}
                className="absolute bottom-[130px] w-[420px] whitespace-nowrap overflow-hidden text-lg transform -translate-x-1/2 font-semibold text-center text-white mt-1 px-10 truncate"
                dangerouslySetInnerHTML={{
                  __html: card.institute.toUpperCase(),
                }}
              ></p>
            )}
            {globalVisibility.designation && card.designation && (
              <p
                style={{
                  top: styles.designation.top ?? undefined,
                  bottom: styles.designation.bottom ?? undefined,
                  left: styles.designation.left ?? undefined,
                  right: styles.designation.right ?? undefined,
                  fontSize: `${styles.designation.fontSize}px`,
                  color: styles.designation.color,
                }}
                className="absolute bottom-[107px]  transform -translate-x-1/2 text-md font-bold text-center text-black"
              >
                {card.designation}
              </p>
            )}
            {globalVisibility.qrCode && (
              <div
                style={{
                  top: styles.qrCode.top ?? undefined,
                  bottom: styles.qrCode.bottom ?? undefined,
                  left: styles.qrCode.left ?? undefined,
                  right: styles.qrCode.right ?? undefined,
                }}
                className="absolute bottom-[15px]  transform -translate-x-1/2"
              >
                <QRCode
                  value={participantUrl}
                  size={styles.qrCode.size}
                  level="H"
                />
              </div>
            )}

            {globalVisibility.participantId && card.participantId && (
              <div
                style={{
                  top: styles.participantId.top ?? undefined,
                  bottom: styles.participantId.bottom ?? undefined,
                  left: styles.participantId.left ?? undefined,
                  right: styles.participantId.right ?? undefined,
                  fontSize: `${styles.participantId.fontSize}px`,
                  color: styles.participantId.color,
                }}
                className="absolute bottom-[1px]  transform -translate-x-1/2 text-xs font-bold text-center text-black"
              >
                {card.participantId}
              </div>
            )}
            <div className="text-black font-bold bg-green-100 px-2 mt-[565px] ml-[343px]">
              {card.tag}
            </div>
          </div>
        </div>
      </div>

      <div className="">
        {/* Content to Print */}
        <div
          ref={printRef}
          className="text-center hidden border rounded-lg shadow"
        >
          <h1 style={{ fontSize: `15px` }} className="text-xl font-semibold">
            {card.firstName}
          </h1>
          {/* <p style={{fontSize: `12px`}} className="text-lg font-semibold">{card.designation}</p> */}
          <p
            style={{ fontSize: `12px`, fontWeight: "500" }}
            className="text-base font-semibold"
          >
            {card.institute}
          </p>
        </div>
      </div>
      {/* <button onClick={handlePrint2} className="mt-4 btn">
        Print
      </button>

          <button onClick={handlePrintSVG} className="mt-4 btn">
        Print as SVG
      </button> */}

      {!isPreview && (
        <div className="my-2 space-y-3">
          {/* First Row - Icon Buttons */}
          <div className="flex gap-2 justify-center">
            {/* Edit Button */}
            <button
              onClick={toggleModal}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Edit className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(card._id)}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <button
              onClick={downloadImage}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Download Without Background Button */}
            <button
              onClick={downloadImageWithoutBackground}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileImage className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Second Row - Text Buttons */}
          <div className="flex gap-2 justify-center">
            {/* Check-in Button */}
            <button
              onClick={onCheckin}
              disabled={isCheckingIn || card.checkin}
              className={`px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium text-sm whitespace-nowrap ${
                card.checkin
                  ? "bg-gradient-to-br from-emerald-500 to-teal-700 text-white cursor-not-allowed"
                  : "bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white"
              }`}
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : card.checkin ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Checked In</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Check In</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={() => printIdCard(true)}
              className="px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center font-medium text-sm whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Print No Background Button */}
            <button
              onClick={() => printIdCard(false)}
              className="px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium text-sm whitespace-nowrap"
            >
              <span>No Bg</span>
              <Printer className="w-4 h-4" />
            </button>

            {/* Print SVG Button */}
            <button
              onClick={handlePrintSVG}
              className="px-4 py-2 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium text-sm whitespace-nowrap"
            >
              <span>Print SVG</span>
              <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* Modal */}
          {modal && (
            <EditParticipent
              fetchData={fetchData}
              eventId={eventId}
              fetchDesignations={fetchDesignations}
              toggleModal={toggleModal}
              id={card._id}
              data={card}
            />
          )}

          {/* Loading Overlay */}
          {isPrinting && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-700 font-semibold">
                  Preparing print...
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdCard;
