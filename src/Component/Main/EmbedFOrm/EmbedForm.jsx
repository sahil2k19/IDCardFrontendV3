// src/components/EmbedForm.jsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Webcam from "react-webcam";

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
          const img =  ev.idcardimage || "";
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
      <div className="border border-gray-200 p-4 bg-white rounded-lg shadow-sm text-center">
        {capturing ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              className="rounded-lg mb-3"
            />
            <button
              onClick={capture}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Capture Photo
            </button>
          </>
        ) : (
          <button
            onClick={() => setCapturing(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Camera
          </button>
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="p-8 bg-white shadow-lg rounded-xl max-w-md w-full text-center">
          <div className="mb-6 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Form Access Expired
          </h2>
          <p className="text-gray-600 mb-6">
            This form has expired. You are allowed to generate your ID card only
            once.
          </p>
          <p className="text-gray-600">
            To request access again, please contact the event organizer.
          </p>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 py-5 px-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              Create Your ID Card
            </h1>
            {eventName && (
              <p className="mt-1 text-blue-100 text-sm">Event: {eventName}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Your University/Organization"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your role</option>
                  {designations[0]?.categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="w-full sm:w-auto cursor-pointer">
                    <div className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center">
                      <span className="text-sm font-medium text-gray-700">
                        Upload Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setProfilePicture)}
                        className="hidden"
                      />
                    </div>
                  </label>
                  <div className="text-sm text-gray-500">or</div>
                  <WebcamCapture onCapture={setProfilePicture} />
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: JPG, PNG (Max 2MB)
                </p>
              </div>

              {profilePicture && (
                <div className="mt-3 flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="preview"
                      className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                    />
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {profilePicture.name || "Camera Capture"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Creating ID...
                  </span>
                ) : (
                  "Generate My ID Card"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
