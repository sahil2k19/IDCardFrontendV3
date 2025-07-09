"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import IdCardrender from "./IdCard/IdCardrender";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-hot-toast";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";
import RazorpayButton from "../Service/RazorpayButton";
import Swal from "sweetalert2";
import {
  Building,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { Calendar, Link, Plus, Users, Archive, Shield } from "lucide-react";
import { Globe, Copy, X, Sparkles, Check } from "lucide-react";
import RegistrationModal from "./components/RegistrationModal";
function CreateId() {
  const location = useLocation();
  // console.log("(new URLSearchParams(location.search))", new URLSearchParams(location.search).get("eventid"));
  const [modal, setModal] = useState(false);
  const [linkmodal, setlinkmodal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [designation, setDesignation] = useState("");
  const [idCard, setIdCard] = useState([]);
  const [designations, setDesignations] = useState([]); // State to hold fetched designations
  const [Dataid, setDataid] = useState("");
  const [params, setparams] = useState(new URLSearchParams(location.search));
  const [eventId, setEventId] = useState(params.get("eventid"));
  const [eventName, setEventName] = useState("");
  const [institute, setInstitute] = useState("");
  const [email, setemail] = useState("");
  const [selectedIdCardType, setSelectedIdCardType] = useState("vertical");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [amenities, setamenities] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [phone, setPhone] = useState("");
  const [generatedSecureLink, setGeneratedSecureLink] = useState("");
  const [generatedPublicCreateLink, setGeneratedPublicCreateLink] =
    useState("");
  const [errors, setErrors] = useState({});
  const [eventData, setEventData] = useState(null); // State to hold fetched event data

  // Ticket selection state
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [copiedSecure, setCopiedSecure] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  // Derive dropdown options
  const regionOptions = eventData?.regionPricings?.map((r) => r.region) || [];
  const categoryOptions = selectedRegion
    ? eventData.regionPricings.find((r) => r.region === selectedRegion)
        ?.categories || []
    : [];

  const handleGenerateSecureLink = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants/generate-secure-token`,
        {
          eventId,
          eventName,
        }
      );
      const secureToken = data.token;
      setGeneratedSecureLink(
        `${window.location.origin}/form-url?eventid=${eventId}&eventName=${eventName}&token=${secureToken}`
      );
    } catch (error) {
      console.error("Error generating secure link:", error);
    }
  };


  const LoaderOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );

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
  useEffect(() => {
    fetchEVentData();
  }, [eventId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventid");
    const name = params.get("eventName");
    setparams(params);
    setEventId(id);
    setEventName(name);

    fetchData();
  }, [location]);

  const fetchData = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/event/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data); // Log fetched participants
      setDataid(response.data); // Update state with fetched data
      setLoading(false);
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setDataid([]); // Clear state or handle error case
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  const [isCreating, setIsCreating] = useState(false); // New state for loading spinner

  const handleSubmit = async (event) => {
    event.preventDefault();
     if(!isValid()) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return ;
    }
    console.log("isvalide", isValid());
    setIsCreating(true);
   

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      // formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("idCardType", selectedIdCardType);
      formData.append("institute", institute);
      formData.append("eventId", eventId);
      formData.append("phone", phone);
      formData.append("eventName", eventName);
      formData.append("email", email);
      // formData.append("tag", "Invited");

      formData.append("ticketRegion", selectedRegion);
      formData.append("ticketCategory", selectedCategory);

      const amenitiesObject = typeof amenities === "object" ? amenities : {};
      formData.append("amenities", JSON.stringify(amenitiesObject));

      if (backgroundImage) {
        formData.append("backgroundImage", backgroundImage);
      }
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const token = new URLSearchParams(window.location.search).get("token");

      // Invalidate token only if form submission succeeded
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/participants/invalidate-token`,
          { token }
        );
      }

      setIdCard([...idCard, response.data]);
      fetchData(eventId);
      toggleModal();
      // toast.success("ID card created successfully!");
      Swal.fire("Success", "ID card generated successfully.", "success");

      if (token) {
        navigate(`/id-created?eventid=${eventId}&eventName=${eventName}`);
      }
    } catch (error) {
      console.error("Error creating participant:", error);
      // toast.error("Failed to create participant");
      Swal.fire("Error", "Please check your internet connection.");
    } finally {
      setIsCreating(false);
    }
  };

  const createIdAfterPayment = async () => {
    // event.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      // formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("idCardType", selectedIdCardType);
      formData.append("institute", institute);
      formData.append("eventId", eventId);
      formData.append("phone", phone);
      formData.append("eventName", eventName);
      formData.append("email", email);
      // formData.append("tag", "Invited");

      const amenitiesObject = typeof amenities === "object" ? amenities : {};
      formData.append("amenities", JSON.stringify(amenitiesObject));

      if (backgroundImage) {
        formData.append("backgroundImage", backgroundImage);
      }
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const token = new URLSearchParams(window.location.search).get("token");

      // Invalidate token only if form submission succeeded
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/participants/invalidate-token`,
          { token }
        );
      }

      setIdCard([...idCard, response.data]);
      fetchData(eventId);
      toggleModal();
      Swal.fire("Success", "ID card generated successfully.", "success");

      if (token) {
        navigate(`/id-created?eventid=${eventId}&eventName=${eventName}`);
      }
    } catch (error) {
      console.error("Error creating participant:", error);
      toast.error("Failed to create participant");
    } finally {
      setIsCreating(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (index) => {
    setIsLoading(true);
    const idCardElement = document.getElementById(`id-card-${index}`);
    const downloadButton = document.getElementById(`download-button-${index}`);

    if (!idCardElement || !downloadButton) {
      console.error("Element not found");
      return;
    }

    downloadButton.style.display = "none";

    try {
      const dataUrl = await toPng(idCardElement, { quality: 1, pixelRatio: 4 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "id-card.png";
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      setIsLoading(false);
      downloadButton.style.display = "block";
    }
  };

  const handleDownloadAll = async (data) => {
    setIsLoading(true);
    const zip = new JSZip();

    for (let index = 0; index < data.length; index++) {
      const card = data[index];
      const idCardElement = document.getElementById(`id-card-${index}`);

      if (!idCardElement) {
        console.error("Element not found", index);
        continue;
      }

      try {
        const dataUrl = await toPng(idCardElement, {
          quality: 1,
          pixelRatio: 4,
        });
        const base64Data = dataUrl.split("base64,")[1];
        zip.file(`id-card-${index + 1}.png`, base64Data, { base64: true });
      } catch (error) {
        console.error("Error generating PNG:", error, index);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "id-cards.zip");
      setIsLoading(false);
    });
  };

  const handleDownloadWithoutBackground = async (index) => {
    setIsLoading(true);
    const idCardElement = document.getElementById(`id-card-${index}`);
    const downloadButton = document.getElementById(`download-button-${index}`);

    if (!idCardElement || !downloadButton) {
      console.error("Element not found");
      setIsLoading(false);
      return;
    }

    const originalBackground = idCardElement.style.backgroundImage;
    idCardElement.style.backgroundImage = "none"; // Remove background image

    downloadButton.style.display = "none";

    try {
      const dataUrl = await toPng(idCardElement, { quality: 1, pixelRatio: 4 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "id-card-without-bg.png";
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      idCardElement.style.backgroundImage = originalBackground; // Restore background image
      downloadButton.style.display = "block";
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setBackgroundImage(designations[0]?.idcardimage);
  }, [designations]);

  useEffect(() => {
    // Assuming `designations` is an array and you are filtering for a specific event
    const eventDesignations = designations.find((d) => d._id === eventId);
    if (eventDesignations) {
      setamenities(eventDesignations.amenities || {});
    }
  }, [designations, eventId]);

  console.log("backgroundImage", backgroundImage);
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, idCard.participantId, {
        format: "CODE128",
        displayValue: true,
        height: 60, // Adjust the height here as needed
      });
    }
  }, [idCard.participantId]);

  // Function to fetch designations from API
  const fetchDesignations = async (eventId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events`
      );
      const filteredDesignations = response.data.filter(
        (categories) => categories._id === eventId
      );
      setDesignations(filteredDesignations);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  console.log("categories", designations);

  const navigate = useNavigate();

  const toggleModal = () => {
    setModal(!modal);
    fetchDesignations(eventId);
  };

  const toggleLinkModal = () => {
    setlinkmodal(!linkmodal);
  };

  const handleNavigate = () => {
    navigate(`/bulk-create-id?eventid=${eventId}&eventName=${eventName}`);
  };

  const handleNavigatearchive = () => {
    navigate(`/archive-id-card?eventid=${eventId}&eventName=${eventName}`);
  };




  // Check if the form is being accessed with a token
  const [isSecureForm, setIsSecureForm] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (token) {
      setIsSecureForm(true);
      // Verify token is valid
      const verifyToken = async () => {
        try {
          await axios.get(
            `${process.env.REACT_APP_API_URL}/api/participants/verify-token`,
            {
              headers: { Authorization: token },
            }
          );
        } catch (error) {
          // If token is invalid, redirect to an error page
          navigate("/token-expired");
        }
      };
      verifyToken();
    }
  }, [location, navigate]);

  const isFormFilled = () =>
    !!firstName.trim() &&
    !!designation.trim() &&
    !!institute.trim() &&
    !!email.trim() &&
    !!phone.trim();

  const isValid = (skipErrorSetting = false) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!firstName.trim()) newErrors.firstName = "Name is required.";
    if (!designation.trim()) newErrors.designation = "Designation is required.";
    if (!institute.trim()) newErrors.institute = "Institute is required.";

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email.trim()))
      newErrors.email = "Enter a valid email.";

    if (!phone.trim()) newErrors.phone = "Phone is required.";
    else if (!phoneRegex.test(phone.trim()))
      newErrors.phone = "Phone must be 10 digits.";

    if (eventData?.isPaidEvent) {
      if (!selectedRegion)
        newErrors.ticketRegion = "Ticket Region is required.";
      if (!selectedCategory)
        newErrors.ticketCategory = "Ticket Category is required.";
    }

    // only write into state when you really want errors shown
    if (!skipErrorSetting) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };
  const handleCopySecure = () => {
    if (generatedSecureLink) {
      navigator.clipboard
        .writeText(generatedSecureLink)
        .then(() => {
          toast.success("Secure link copied");
          setCopiedSecure(true);
          setTimeout(() => setCopiedSecure(false), 2000);
        })
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  const handleCopyPublic = () => {
    if (generatedPublicCreateLink) {
      navigator.clipboard
        .writeText(generatedPublicCreateLink)
        .then(() => {
          toast.success("Public Create link copied");
          setCopiedPublic(true);
          setTimeout(() => setCopiedPublic(false), 2000);
        })
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  // only render this component if linkmodal is a boolean and true
  // if (typeof linkmodal !== "boolean" || !linkmodal) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white via-gray-50 to-slate-100 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
        <div className="flex h-16 mx-auto items-center justify-between px-4 lg:px-[80px]">
          {/* Logo Section */}
          <div className="hidden lg:block">
            <a
              className="group flex items-center gap-3 hover:scale-105 transition-all duration-300"
              href="/event"
              rel="ugc"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
                  Event ID Card Generator
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Professional ID Management
                </span>
              </div>
            </a>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden">
            <a href="/event" rel="ugc" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm">ID Generator</span>
            </a>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap lg:flex-nowrap lg:gap-3 gap-2 justify-end">
            {!isSecureForm && (
              <>
                {/* Embed Form Button */}
                <button
                  onClick={() => toggleLinkModal()}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-500 hover:to-gray-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-slate-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Link className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">Embed Form</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>

                {/* Create ID Button */}
                <button
                  onClick={toggleModal}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">Create ID</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>

                {/* Bulk Create Button */}
                <button
                  onClick={handleNavigate}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">Bulk Create</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>

                {/* Archive Button */}
                <button
                  onClick={handleNavigatearchive}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-purple-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Archive className="w-4 h-4" />
                  <span className="text-sm whitespace-nowrap">Archive</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              </>
            )}

            {/* Secure Form Indicator */}
            {isSecureForm && (
              <div className="group bg-gradient-to-r from-emerald-100 via-green-50 to-teal-100 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-sm whitespace-nowrap">
                  Secure Form - Create your ID card
                </span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        {/* Floating accent dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse delay-0"></div>
          <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-2 left-2/3 w-1 h-1 bg-emerald-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
        </div>
      </header>

      {linkmodal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-200/50">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <Link className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Embed Form Links
                    </h2>
                    <p className="text-white/90 text-sm mt-1">
                      Generate and share your form links
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleLinkModal}
                  className="group w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-4 left-12 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-16 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-6 left-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-700"></div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Secure Token-Based Link */}
                <div className="group relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Secure Link
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">
                            One-time use
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Generate a secure, one-time use link that expires after an
                      ID card is created. Perfect for controlled access.
                    </p>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerateSecureLink}
                      className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
                    >
                      <div className="flex items-center justify-center space-x-2 relative z-10">
                        <Shield className="w-4 h-4" />
                        <span>Generate Secure Link</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {/* Generated Link Section */}
                    {generatedSecureLink && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={generatedSecureLink}
                            className="w-full p-3 bg-white border-2 border-blue-200 rounded-xl text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <Shield className="w-3 h-3 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleCopySecure}
                          className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <div className="flex items-center justify-center space-x-2 relative z-10">
                            {copiedSecure ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Secure Link</span>
                              </>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Public Create-ID Link */}
                <div className="group relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Public Create Form
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-purple-500" />
                          <span className="text-xs text-purple-600 font-medium">
                            Open access
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Create a public form link that anyone can use to generate
                      an ID card.
                    </p>

                    {/* Generate Button */}
                    <button
                      onClick={() =>
                        setGeneratedPublicCreateLink(
                          `${
                            window.location.origin
                          }/public-create-id?eventid=${eventId}&eventName=${encodeURIComponent(
                            eventName
                          )}`
                        )
                      }
                      className="group w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-purple-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4"
                    >
                      <div className="flex items-center justify-center space-x-2 relative z-10">
                        <Globe className="w-4 h-4" />
                        <span>Generate Public Link</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    {/* Generated Link Section */}
                    {generatedPublicCreateLink && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={generatedPublicCreateLink}
                            className="w-full p-3 bg-white border-2 border-purple-200 rounded-xl text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Globe className="w-3 h-3 text-purple-600" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleCopyPublic}
                          className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <div className="flex items-center justify-center space-x-2 relative z-10">
                            {copiedPublic ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Public Link</span>
                              </>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-8 py-4 border-t border-gray-200/50">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Links are generated instantly and ready to share</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <>
        
       <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/60 backdrop-blur-md p-4">
       <RegistrationModal fetchData={fetchData} toggleModal={toggleModal} eventId={eventId} isModal={true} eventData={eventData} />
       </div>

        </>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <span className="loader"></span>
        </div>
      ) : (
        <div className="">
          {!isSecureForm && (
            <IdCardrender
              fetchData={fetchData}
              isLoading={isLoading}
              Dataid={Dataid}
              eventName={eventName}
              handleDownload={handleDownload}
              handleDownloadAll={handleDownloadAll}
              handleDownloadWithoutBackground={handleDownloadWithoutBackground}
              fetchDesignations={fetchDesignations}
              eventId={eventId}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default CreateId;
