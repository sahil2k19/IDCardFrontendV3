
import { useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import QRCode from "qrcode.react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import EditParticipent from "../Edit/EditParticipent";
import * as XLSX from "xlsx";

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

    const printWindow = window.open('', '', '');
    printWindow.document.write(`
  <html>
    <head>
      <title>Print</title>
      <style>
        @page {
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
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
      <div class="print-container">
        ${content}
      </div>
    </body>
  </html>
`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
    <div className={`relative ${isPreview ? "" : "mb-20"} border border-gray-300 rounded-lg w-[430px]`}>
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
                <QRCode value={participantUrl} size={styles.qrCode.size} level="H" />
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
        <div ref={printRef} className="text-center hidden border rounded-lg shadow">
          <h1 className="text-xl font-semibold">{card.firstName}</h1>
          <h3 className="text-lg font-semibold">{card.designation}</h3>
          <h2 className="text-base font-semibold">{card.institute}</h2>
        </div>

       
      </div>

      {!isPreview && (
        <div>
          <div className="flex gap-4 mt-3 justify-center">
            <button
              onClick={toggleModal}
              className="border text-black p-3 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-pencil-square"
                viewBox="0 0 16 16"
              >
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                <path
                  fillRule="evenodd"
                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                />
              </svg>
            </button>
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
            <button
              onClick={() => handleDelete(card._id)}
              className="border text-black p-3 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-trash-fill"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
              </svg>
            </button>
            <button
              onClick={downloadImage}
              className="border text-black p-3 bg-gray-300 hover:bg-gray-400 rounded-full"
            >
              {isDownloading ? (
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-download"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                </svg>
              )}
            </button>
            <button
              onClick={downloadImageWithoutBackground}
              className="border text-black p-3 bg-gray-300 hover:bg-gray-500 font-semibold rounded"
            >
              {isDownloading ? (
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <div className="flex gap-2">
                  NoBg
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-download"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          <div className="mt-3 flex mb-4 gap-4 items-center justify-center">
            <button
              onClick={onCheckin}
              disabled={isCheckingIn || card.checkin}
              className={`flex items-center justify-between gap-2 text-white font-semibold py-2 px-4 rounded ${card.checkin
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              {isCheckingIn ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : card.checkin ? (
                <>Checked In</>
              ) : (
                <>Check In</>
              )}
            </button>

            {isPrinting && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="loader border-t-4 border-b-4 border-gray-200 rounded-full w-12 h-12 animate-spin"></div>
              </div>
            )}
            <button
              onClick={() => printIdCard(true)}
              className="bg-gray-300  flex items-center justify-between gap-2 text-nowrap text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded"
            >
              
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-printer"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
              </svg>
            </button>
            <button
              onClick={() => printIdCard(false)}
              className="bg-gray-300 flex items-center justify-between gap-2  text-nowrap text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded"
            >
               No Bg
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-printer"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
              </svg>
            </button>
             <button
            onClick={handlePrint}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Print_no_BG
          </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default IdCard