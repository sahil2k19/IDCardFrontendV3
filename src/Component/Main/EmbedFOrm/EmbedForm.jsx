"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import Webcam from "react-webcam";
import { Camera, Upload, User, Mail, Building, Award, ImageIcon, X, Sparkles, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function EmbedForm() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const eventId = params.get("eventid");
  const eventName = params.get("eventName");
  const token = params.get("token");

  // Detect if this is the public-create-id route
  const isPublicForm = location.pathname.includes("public-create-id");

  const [designations, setDesignations] = useState([]);
  const [amenities, setAmenities] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [institute, setInstitute] = useState("");
  const [idCardType, setIdCardType] = useState("vertical");
  const [isCreating, setIsCreating] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(isPublicForm);
  const [bgImage, setBgImage] = useState("");

  // Load design settings for this event
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/events`)
      .then(({ data }) => {
        const ev = data.find((d) => d._id === eventId);
        if (ev) {
          const img = ev.idcardimage || "";
          setBgImage(img);
          setDesignations([ev]);
          setAmenities(ev.amenities || {});
        } else {
          toast.error("Event not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        toast.error("Failed to fetch events");
      });
  }, [eventId]);

  // Only verify token on secure form
  useEffect(() => {
    if (!isPublicForm && token) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/participants/verify-token`, {
          headers: { Authorization: token },
        })
        .then((res) => {
          if (res.status === 200) setIsTokenValid(true);
          else {
            toast.dismiss();
            setIsTokenValid(false);
            toast.error(
              "Invalid or expired token. Please request a new form URL."
            );
          }
        })
        .catch(() => {
          toast.dismiss();
          setIsTokenValid(false);
          toast.error(
            "Invalid or expired token. Please request a new form URL."
          );
        });
    }
  }, [isPublicForm, token]);

  // Webcam helper
  const WebcamCapture = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [capturing, setCapturing] = useState(false);

    const capture = useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i);
      onCapture(new Blob([ab], { type: mimeString }));
      setCapturing(false);
    }, [webcamRef, onCapture]);

    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 border-2 border-gray-200/60 hover:border-blue-300/60 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
        {capturing ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                className="rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
            <button
              onClick={capture}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-green-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Perfect Shot</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Capture</h3>
            <p className="text-sm text-gray-600 mb-4">Take a professional photo instantly</p>
            <button
              onClick={() => setCapturing(true)}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
            >
              <Camera className="w-5 h-5" />
              <span>Open Camera</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle file & webcam
  const handleFileChange = (e, setter) => setter(e.target.files[0]);
  const handleRemovePicture = () => setProfilePicture(null);

  // If secure form and invalid token, show message
  if (!isPublicForm && !isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-rose-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl max-w-md w-full p-8 text-center border border-white/20">
          {/* Error Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <AlertTriangle className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent mb-4">
            Access Expired
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <p className="text-lg font-medium">
              This form has expired or is no longer valid.
            </p>
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200/50">
              <p className="text-sm">
                You are allowed to generate your ID card only once for security purposes.
              </p>
            </div>
            <p className="text-sm">
              To request access again, please contact the event organizer for a new invitation link.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute bottom-6 left-6 w-1 h-1 bg-rose-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
        </div>
      </div>
    );
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("idCardType", idCardType);
      formData.append("tag", "Invited");
      formData.append("amenities", JSON.stringify(amenities));

      if (bgImage) formData.append("backgroundImage", bgImage);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      toast.success("ID card created successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Failed to create ID card. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-200/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">
          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-8 px-8 text-center overflow-hidden">
            {/* Floating accent dots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-pulse delay-0"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse delay-2000"></div>
              <div className="absolute bottom-8 right-8 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-500"></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Your ID Card
              </h1>
              {eventName && (
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">{eventName}</span>
                </div>
              )}
            </div>

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-2000"></div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institute/Organization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    placeholder="Your University/Organization"
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Designation/Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">Select your role</option>
                    {designations[0]?.categories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Award className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Profile Picture</h3>
                <span className="text-red-500 text-sm font-medium">*Required</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Upload */}
                <div className="group">
                  <label className="cursor-pointer block">
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-8 text-center transition-all duration-300 group-hover:shadow-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Photo</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose a professional photo from your device
                      </p>
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300">
                        <Upload className="w-4 h-4" />
                        <span>Browse Files</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setProfilePicture)}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>

                {/* Webcam Capture */}
                <WebcamCapture onCapture={setProfilePicture} />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                <p className="text-sm text-gray-600 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Accepted formats: JPG, PNG, WEBP (Max 5MB) • Recommended: 400x400px</span>
                </p>
              </div>

              {/* Preview */}
              {profilePicture && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(profilePicture) || "/placeholder.svg"}
                          alt="Preview"
                          className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg"
                        />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Photo Selected</h4>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {profilePicture.name || "Camera Capture"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePicture}
                      className="group p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isCreating}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Creating Your ID Card...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <Sparkles className="h-6 w-6" />
                    <span className="text-lg">Generate My Professional ID Card</span>
                  </span>
                )}
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
