"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Loader2,
  CloudUpload,
  FileCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";

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
      setErrorMessage(
        "Failed to read Excel file. Make sure it's a valid .xlsx."
      );
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="w-full max-w-4xl mb-3 mx-auto pt-3 relative">
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
                  Bulk Upload Participants
                </span>

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

        {/* Main Content Card */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Info Section */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-200/50">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  How it works
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Download the template first, fill it with participant data,
                  then upload it back. Make sure to follow the exact format
                  provided in the template.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Download Template Button */}
            <button
              onClick={downloadTemplate}
              className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-8"
            >
              <div className="flex items-center justify-center space-x-3 relative z-10">
                <Download className="w-5 h-5" />
                <span>Download Excel Template</span>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* File Upload Area */}
              <div
                className={`group relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      <span className="text-blue-600">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      Excel files only (.xlsx)
                    </p>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Selected File Display */}
              {file && (
                <div className="group bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 rounded-2xl border border-green-200/60 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 p-4 rounded-2xl border border-red-200/60 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className={`group w-full relative overflow-hidden py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 ${
                  loading || !file
                    ? "bg-gradient-to-r from-gray-300 to-slate-400 text-gray-600 cursor-not-allowed transform-none"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white"
                }`}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Start Upload</span>
                      <TrendingUp className="w-5 h-5" />
                    </>
                  )}
                </div>
                {!loading && !!file && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                )}
              </button>
            </form>

            {/* Progress Section */}
            {loading && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50 animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <p className="font-semibold text-gray-800">
                        Uploading participants...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-600 text-lg">
                        {getProgressPercentage()}%
                      </span>
                    </div>
                  </div>

                  <div className="relative w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${getProgressPercentage()}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse"></div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    {progress.done} of {progress.total} participants processed
                  </p>
                </div>
              </div>
            )}

            {/* Summary Section */}
            {!loading && (summary.success > 0 || summary.failed > 0) && (
              <div className="mt-8 bg-gradient-to-br from-white via-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200/60 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Upload Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Success Count */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/60">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-green-600 font-medium">
                            Successful
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {summary.success}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Failed Count */}
                    {summary.failed > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-xl border border-red-200/60">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-red-600 font-medium">
                              Failed
                            </p>
                            <p className="text-2xl font-bold text-red-700">
                              {summary.failed}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Success Message */}
                  {summary.failed === 0 && summary.success > 0 && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-xl border border-green-200/60 text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          All participants uploaded successfully!
                        </span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {summary.failed > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200/60">
                      <p className="text-sm text-yellow-700 text-center">
                        Some participants could not be uploaded. Please check
                        your data and try again.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-8 py-4 border-t border-gray-200/50">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>
                Need help? Contact support for assistance with bulk uploads.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadForm;
