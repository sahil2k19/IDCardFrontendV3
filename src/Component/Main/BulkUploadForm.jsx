"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const BulkUploadForm = ({ backgroundImage, amenities }) => {
  const [file, setFile] = useState(null);
  const [templateBlob, setTemplateBlob] = useState(null);
  const [progress, setProgress] = useState({ total: 0, done: 0 });
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ success: 0, failed: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [bgImage, setBgImage] = useState("");
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventid");
  const eventName = searchParams.get("eventName");
  const [designations, setDesignations] = useState([]);
  
  // Generate an empty Excel template with headers only
  useEffect(() => {
    const wb = XLSX.utils.book_new();

    // Define your template headers
    const headers = [
      "email",
      "FirstName",
      "lastName",
      "Designation",
      "institute",
      "ProfilePicture",
    ];

    // Dummy data
    const data = [
      headers,
      [
        "shivamt2023@gmail.com",
        "John",
        "Doe",
        "Engineer",
        "Tech Institute",
        "https://example.com/images/john.jpg",
      ],
      [
        "shivamt2023+1@gmail.com",
        "Jane",
        "Smith",
        "Manager",
        "Business Academy",
        "https://example.com/images/jane.jpg",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    setTemplateBlob(blob);
  }, []);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/events`)
      .then(({ data }) => {
        const ev = data.find((d) => d._id === eventId);

        if (ev) {
          const img = ev.idcardimage || "";
          setBgImage(img);
          setDesignations([ev]);
          // setAmenities(ev.amenities || {});
        } else {
          toast.error("Event not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        toast.error("Failed to fetch events");
      });
  }, [eventId]);

  const downloadTemplate = () => {
    if (!templateBlob) return;
    const url = URL.createObjectURL(templateBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participant_template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetState();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      resetState();
    }
  };

  const resetState = () => {
    setProgress({ total: 0, done: 0 });
    setSummary({ success: 0, failed: 0 });
    setErrorMessage("");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select an Excel file.", "error");
      return;
    }
  
    if (!eventId) {
      showToast("Event ID is missing from URL.", "error");
      return;
    }
  
    setLoading(true);
    setErrorMessage("");
    let rows;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if (!rows.length) throw new Error("No data found in the sheet.");
    } catch (err) {
      setErrorMessage("Failed to read Excel file. Make sure it's a valid .xlsx.");
      setLoading(false);
      return;
    }
  
    setProgress({ total: rows.length, done: 0 });
    let success = 0,
      failed = 0;
  
    for (const row of rows) {
      try {
        const formData = new FormData();
        formData.append("participants", JSON.stringify([row]));
        formData.append("eventId", eventId);
        formData.append("eventName", eventName || "");
  
        const finalBackgroundImage = bgImage || backgroundImage || "";
        formData.append("backgroundImage", finalBackgroundImage);
  
        const amenitiesToSend = amenities ? JSON.stringify(amenities) : "{}";
        formData.append("amenities", amenitiesToSend);
  
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/participants/bulk-upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        success++;
      } catch (err) {
        console.error("Row upload failed:", row, err);
        failed++;
      }
      setProgress((p) => ({ total: p.total, done: p.done + 1 }));
    }
  
    setSummary({ success, failed });
    setLoading(false);
    if (failed) {
      showToast(`Bulk upload completed with ${failed} error(s).`, "error");
    } else {
      showToast("Bulk upload finished successfully!", "success");
    }
  };
  

  const showToast = (message, type) => {
    if (typeof toast !== "undefined") {
      if (type === "error") {
        toast.error(message);
      } else {
        toast.success(message);
      }
    } else {
      alert(message);
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return Math.round((progress.done / progress.total) * 100);
  };

  return (
    <div className="max-w-xl mx-auto my-8 bg-white p-8 rounded-xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-blue-600 mr-3"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 7H7V13H13V7Z" fill="currentColor" />
          <path d="M7 17H13V19H7V17Z" fill="currentColor" />
          <path d="M17 7H19V13H17V7Z" fill="currentColor" />
          <path d="M17 17H19V19H17V17Z" fill="currentColor" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 3H21V21H3V3ZM5 5V19H19V5H5Z"
            fill="currentColor"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">
          Bulk Upload Participants
        </h1>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-blue-700">
            Download the template first, fill it with participant data, then
            upload it back.
          </p>
        </div>
      </div>

      <button
        onClick={downloadTemplate}
        className="mb-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Download Excel Template
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <svg
            className="w-10 h-10 mx-auto text-gray-400 mb-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 16.2091 19.2091 18 17 18H7C4.79086 18 3 16.2091 3 14C3 11.7909 4.79086 10 7 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L12 16L10 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">Excel files only (.xlsx)</p>
        </div>

        {file && (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="w-6 h-6 text-green-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 truncate flex-1">
              {file.name}
            </span>
            <span className="text-xs text-gray-500 mr-2">
              {(file.size / 1024).toFixed(1)} KB
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start p-3 bg-red-50 rounded-lg border border-red-100">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            loading || !file
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Start Upload
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">
              Uploading participants...
            </p>
            <span className="text-sm font-medium text-blue-600">
              {getProgressPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-2.5 bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">
            {progress.done} of {progress.total} participants
          </p>
        </div>
      )}

      {!loading && (summary.success > 0 || summary.failed > 0) && (
        <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Upload Summary</h3>

          <div className="flex items-center text-green-700">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-medium">
              Success: {summary.success} participants
            </p>
          </div>

          {summary.failed > 0 && (
            <div className="flex items-center text-red-700">
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium">
                Failed: {summary.failed} participants
              </p>
            </div>
          )}

          {summary.failed > 0 && (
            <p className="text-sm text-gray-600 pt-2 border-t border-gray-200">
              Some participants could not be uploaded. Please check your data
              and try again.
            </p>
          )}

          {summary.failed === 0 && summary.success > 0 && (
            <div className="flex justify-center pt-2 border-t border-gray-200">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <svg
                  className="w-5 h-5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                All participants uploaded successfully!
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        Need help? Contact support for assistance with bulk uploads.
      </div>
    </div>
  );
};

export default BulkUploadForm;
