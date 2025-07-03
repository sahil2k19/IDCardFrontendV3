"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import RazorpayButton from "../Service/RazorpayButton";
import Swal from "sweetalert2";
import {
  CheckCircle,
  Loader2,
  User,
  Building,
  Mail,
  Phone,
  Briefcase,
  Camera,
  Upload,
  X,
} from "lucide-react";

export default function PublicCreateId() {
  const [q] = useSearchParams();
  const eventId = q.get("eventid");
  const eventName = q.get("eventName");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [institute, setInstitute] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [phone, setPhone] = useState("");
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [errors, setErrors] = useState({});
  const [showIdcardLink, setShowIdcardLink] = useState("");

  useEffect(() => {
    if (!eventId || !eventName) {
      toast.dismiss();
      toast.error("Missing event information in URL");
    }
  }, [eventId, eventName]);

  useEffect(() => {
    if (eventId) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/events`)
        .then((res) => {
          const found = res.data.find((e) => e._id === eventId);
          if (found) {
            setCategories(found.categories || []);
            const img = found.idcardimage || "";
            setBgImage(img);
          } else {
            toast.dismiss();
            toast.error("Event not found");
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error("Failed to load event data");
        });
    }
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isValid()) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("email", email);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("phone", phone);

      if (bgImage) formData.append("backgroundImage", bgImage);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setShowIdcardLink(data.link);
      toast.success(`ID created`);
      setFirstName("");
      setDesignation("");
      setInstitute("");
      setEmail("");
      setPhone("");
      setProfilePicture(null);

      Swal.fire({
        title: "Success!",
        text: "ID card generated successfully.",
        icon: "success",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        confirmButtonColor: "#4F46E5",
      });

      setShowThanksPage(true);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Please check your internet connection.",
        icon: "error",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        confirmButtonColor: "#EF4444",
      });
      setShowThanksPage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAfterPayment = async (e) => {
    toast.dismiss();
    setIsSubmitting(true);

    if (!isValid()) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("email", email);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("phone", phone);

      if (bgImage) formData.append("backgroundImage", bgImage);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setShowIdcardLink(data.link);
      toast.success(`ID created`);
      setFirstName("");
      setDesignation("");
      setInstitute("");
      setEmail("");
      setPhone("");
      setProfilePicture(null);

      Swal.fire({
        title: "Success!",
        text: "ID card generated successfully.",
        icon: "success",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        confirmButtonColor: "#4F46E5",
      });

      setShowThanksPage(true);
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to create ID");
      setShowThanksPage(false);
      Swal.fire({
        title: "Error",
        text: "Please check your internet connection.",
        icon: "error",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchEVentData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/${eventId}`
      );
      setEventData(response.data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  const isValid = (skipErrorSetting = false) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!firstName.trim()) newErrors.firstName = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email.trim()))
      newErrors.email = "Enter a valid email.";
    if (!phone.trim()) newErrors.phone = "Phone is required.";
    else if (!phoneRegex.test(phone.trim()))
      newErrors.phone = "Phone must be 10 digits.";

    if (!skipErrorSetting) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchEVentData();
  }, [eventId]);

  const LoaderOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-white/20"></div>
          </div>
          <p className="text-white font-medium">Creating your ID card...</p>
        </div>
      </div>
    </div>
  );

  const ThanksPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-lg text-center transform animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="mb-8">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Registration Successful!
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your ID for{" "}
              <span className="font-semibold text-indigo-600">{eventName}</span>{" "}
              has been created successfully.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 text-sm font-medium">
                You will receive a confirmation email shortly with your event
                details.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowThanksPage(false)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Register Another Person
              </button>
              <a
                href={showIdcardLink}
                className="w-full block py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl text-center"
              >
                View Your ID Card
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showThanksPage) return <ThanksPage />;

  const isFormFilled = () =>
    !!firstName.trim() &&
    !!designation.trim() &&
    !!institute.trim() &&
    !!email.trim() &&
    !!phone.trim();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
      setProfilePicture(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {isSubmitting && <LoaderOverlay />}

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Your ID Card
          </h1>
          <p className="text-gray-600 text-lg">
            for{" "}
            <span className="font-semibold text-indigo-600">{eventName}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Registration Form
            </h2>
            <p className="text-indigo-100 text-center mt-1">
              Fill in your details to generate your ID card
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      required
                      placeholder="Enter your full name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          firstName: undefined,
                        }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.firstName
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-indigo-500 bg-white hover:border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <X className="w-4 h-4" />
                      <span>{errors.firstName}</span>
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="Enter 10-digit phone number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-indigo-500 bg-white hover:border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <X className="w-4 h-4" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-indigo-500 bg-white hover:border-gray-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <X className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Professional Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Professional Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institute Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company/Institute
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      placeholder="Enter your organization"
                      value={institute}
                      onChange={(e) => {
                        setInstitute(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          institute: undefined,
                        }));
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white hover:border-gray-300 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Designation Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      placeholder="Enter your designation"
                      value={designation}
                      onChange={(e) => {
                        setDesignation(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          designation: undefined,
                        }));
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white hover:border-gray-300 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            {/* <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Profile Picture</h3>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                {profilePicture ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(profilePicture) || "/placeholder.svg"}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{profilePicture.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                          <Camera className="w-5 h-5 mr-2" />
                          Choose Photo
                        </span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Upload a profile picture (Max 2MB, JPG/PNG)</p>
                  </div>
                )}
              </div>
            </div> */}

            {/* Submit Button */}
            <div className="pt-6">
              {eventData?.isPaidEvent ? (
                <RazorpayButton
                  styleClass={`w-full px-6 py-4 text-lg font-semibold text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                    isFormFilled()
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  buttonText={`Pay ₹${eventData?.amount} and Create ID Card`}
                  amount={eventData?.amount}
                  onBeforePay={() => isValid()}
                  onSuccess={handleSubmitAfterPayment}
                  loading={isSubmitting}
                  user={{ email, phone, firstName, institute, designation }}
                />
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating ID Card...</span>
                    </span>
                  ) : (
                    "Create My ID Card"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Secure and fast ID card generation • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}
