
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import JsBarcode from "jsbarcode";
import RazorpayButton from "../../Service/RazorpayButton";
import Swal from "sweetalert2";
import {
    CheckCircle,
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


const RegistrationModal = ({ toggleModal, isModal, fetchData}) => {


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
  const [showThanksPage, setShowThanksPage] = useState(false);
  const [showIdcardLink, setShowIdcardLink] = useState("");

    const [errors, setErrors] = useState({});
    const [eventData, setEventData] = useState(null); // State to hold fetched event data

    // Ticket selection state
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");


    // Derive dropdown options
    const regionOptions = eventData?.regionPricings?.map((r) => r.region) || [];
    const categoryOptions = selectedRegion
        ? eventData?.regionPricings.find((r) => r.region === selectedRegion)
            ?.categories || []
        : [];



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

        // fetchData();
    }, [location]);

    // const fetchData = async () => {
    //     try {
    //         const url = `${process.env.REACT_APP_API_URL}/api/participants/event/${eventId}`;
    //         const response = await axios.get(url);
    //         console.log("Participants by EventId:", response.data); // Log fetched participants
    //         setDataid(response.data); // Update state with fetched data
    //         setLoading(false);
    //     } catch (error) {
    //         console.error("Error fetching participants by eventId:", error);
    //         setDataid([]); // Clear state or handle error case
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchData();
    // }, []);




    const [isCreating, setIsCreating] = useState(false); // New state for loading spinner

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isValid()) {
            toast.dismiss();
            toast.error("Please fill all the fields");
            return;
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

            if (eventData?.idcardimage) {
                // formData.append("backgroundImage", backgroundImage);
                formData.append("backgroundImage", eventData?.idcardimage);
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
            if(eventData?.whatsappApiKey){
                handleSend(response.data);
            }
            // fetchData(eventId);


            const token = new URLSearchParams(window.location.search).get("token");

            // Invalidate token only if form submission succeeded
            if (token) {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/participants/invalidate-token`,
                    { token }
                );
            }

            setIdCard([...idCard, response.data]);
            if (isModal) {
                toggleModal();
                fetchData();
            } else {
                setShowThanksPage(true);
            }
            
            setShowIdcardLink(response.data.link);

            // toast.success("ID card created successfully!");
            Swal.fire("Success", "ID card generated successfully.", "success");

            if (token) {
                navigate(`/id-created?eventid=${eventId}&eventName=${eventName}`);
            }
        } catch (error) {
            console.error("Error creating participant:", error);
            // toast.error("Failed to create participant");
            Swal.fire("Error", "Please check your internet connection.");
            if (!isModal) {
                setShowThanksPage(false);
            }
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

            if (eventData?.idcardimage) {
                // formData.append("backgroundImage", backgroundImage);
                formData.append("backgroundImage", eventData?.idcardimage);
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
             if(eventData?.whatsappApiKey){
                handleSend(response.data);
            }

            const token = new URLSearchParams(window.location.search).get("token");

            // Invalidate token only if form submission succeeded
            if (token) {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/participants/invalidate-token`,
                    { token }
                );
            }

            setIdCard([...idCard, response.data]);
            // fetchData(eventId);
            if (isModal) {
                fetchData();
                toggleModal();
            }
            else {
                setShowThanksPage(true);
            }
            Swal.fire("Success", "ID card generated successfully.", "success");
            setShowIdcardLink(response.data.link);
            if (token) {
                navigate(`/id-created?eventid=${eventId}&eventName=${eventName}`);
            }
        } catch (error) {
            console.error("Error creating participant:", error);
            toast.error("Failed to create participant");
            if (!isModal) {
                setShowThanksPage(false);
            }
        } finally {
            setIsCreating(false);
        }
    };


    
  const handleSend = async (data) => {
    console.log("sending whatsapp message");
    const payload = {
      apiKey: eventData?.whatsappApiKey,
      campaignName: "MYU-25-Test",
      destination: phone,
      userName: "Mysuru Yoga Utsava ",
      templateParams: [`${firstName}`, `${data?.link}`],
      source: "new-landing-page form",
      media: {
        url: "https://whatsapp-media-library.s3.ap-south-1.amazonaws.com/FILE/6353da2e153a147b991dd812/4079142_dummy.pdf",
        filename: "sample_media"
      },
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {},
      paramsFallbackValue: {
        FirstName: "user"
      }
    };

    try {
      const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log("Message Sent:", result);
    } catch (error) {
      console.error("Error sending message:", error);
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
        // !!designation.trim() &&
        // !!institute.trim() &&
        // !!email.trim() &&
        !!phone.trim();

    const isValid = (skipErrorSetting = false) => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!firstName.trim()) newErrors.firstName = "Name is required.";
        // if (!designation.trim()) newErrors.designation = "Designation is required.";
        // if (!institute.trim()) newErrors.institute = "Institute is required.";

        if (email.trim() && !emailRegex.test(email.trim()))
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


    const RegistrationFormContent = {
        "modal": {
            "header": `Create ID`,
            "subHeader": `Fill in your details to generate your ID card`
        },
        "noModal": {
            "header": `Registration Form`,
            "subHeader": `Fill in your details to generate your ID card`
        }
    }

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


    return (
        <>


            <div className="relative w-full max-w-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-t-3xl shadow-2xl border border-gray-200/50">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r  from-blue-600 via-purple-600 to-indigo-700 px-8 py-6 rounded-t-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 rounded-t-3xl via-purple-600/10 to-indigo-700/10 backdrop-blur-sm"></div>
                        <div className="relative z-10 flex items-center rounded-t-3xl justify-between">
                            <div className="flex items-center space-x-4">

                                <div className="">
                                    <h2 className="text-2xl font-bold text-white text-center">
                                        Registration Form
                                    </h2>
                                    <p className="text-indigo-100 text-center mt-1">
                                        Fill in your details to generate your ID card
                                    </p>
                                </div>
                            </div>
                            {isModal && <button
                                type="button"
                                onClick={toggleModal}
                                className="group w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-105"
                            >
                                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                            </button>}
                        </div>

                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-4 left-12 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                            <div className="absolute top-8 right-16 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-300"></div>
                            <div className="absolute bottom-6 left-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-700"></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className={`overflow-y-auto custom-scrollbar ${isModal ? "max-h-[70vh] " : ""}`}>
                        <div className="p-8">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {isCreating && <LoaderOverlay />}
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Personal Information
                                    </h3>
                                </div>
                                {/* Name Field */}
                                <div className="group">
                                    <label
                                        htmlFor="startname"
                                        className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3"
                                    >
                                        <User className="w-4 h-4 text-blue-600" />
                                        <span>Full Name</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium hover:border-gray-300 hover:shadow-md"
                                            id="startname"
                                            placeholder="Enter your full name"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                    {errors.firstName && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            <span>{errors.firstName}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Institute and Designation Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Institute Field */}
                                    <div className="group">
                                        <label
                                            htmlFor="institute"
                                            className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3"
                                        >
                                            <Building className="w-4 h-4 text-purple-600" />
                                            <span>Institute</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-purple-50 focus:via-white focus:to-slate-50 focus:border-purple-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium hover:border-gray-300 hover:shadow-md"
                                                id="institute"
                                                placeholder="Company/Institute"
                                                value={institute}
                                                onChange={(e) => setInstitute(e.target.value)}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.institute && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.institute}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Designation Field */}
                                    <div className="group">
                                        <label
                                            htmlFor="designation"
                                            className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3"
                                        >
                                            <Tag className="w-4 h-4 text-indigo-600" />
                                            <span>Designation</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-indigo-50 focus:via-white focus:to-slate-50 focus:border-indigo-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium hover:border-gray-300 hover:shadow-md"
                                                id="designation"
                                                placeholder="Your designation"
                                                value={designation}
                                                onChange={(e) => setDesignation(e.target.value)}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/5 to-blue-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.designation && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.designation}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Phone Field */}
                                    <div className="group">
                                        <label
                                            htmlFor="phone"
                                            className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3"
                                        >
                                            <Phone className="w-4 h-4 text-green-600" />
                                            <span>Phone Number</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-green-50 focus:via-white focus:to-slate-50 focus:border-green-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium hover:border-gray-300 hover:shadow-md"
                                                id="phone"
                                                placeholder="Enter your phone number"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600/5 to-emerald-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.phone}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="group">
                                        <label
                                            htmlFor="email"
                                            className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3"
                                        >
                                            <Mail className="w-4 h-4 text-orange-600" />
                                            <span>Email Address</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-orange-50 focus:via-white focus:to-slate-50 focus:border-orange-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 font-medium hover:border-gray-300 hover:shadow-md"
                                                id="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setemail(e.target.value)}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-600/5 to-red-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.email}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>


                                {/* Region Selection */}
                                {(eventData?.regionPricings.length > 0 && eventData?.isPaidEvent) && (
                                    <div className="group">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <Building className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Select Region & Event Type
                                            </h3>
                                        </div>
                                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                                            <MapPin className="w-4 h-4 text-teal-600" />
                                            <span>Region</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedRegion}
                                                onChange={(e) => {
                                                    setSelectedRegion(e.target.value);
                                                    setSelectedCategory("");
                                                }}
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-teal-50 focus:via-white focus:to-slate-50 focus:border-teal-500 focus:outline-none transition-all duration-300 text-gray-800 font-medium hover:border-gray-300 hover:shadow-md appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="">Select Region</option>
                                                {regionOptions.map((region) => (
                                                    <option key={region} value={region}>
                                                        {region.charAt(0).toUpperCase() +
                                                            region.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg
                                                    className="w-4 h-4 text-gray-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600/5 to-cyan-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.ticketRegion && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.ticketRegion}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Category Selection */}
                                {selectedRegion && (
                                    <div className="group animate-in slide-in-from-top-2 duration-300">
                                        <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-3">
                                            <Tag className="w-4 h-4 text-pink-600" />
                                            <span>Category</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) =>
                                                    setSelectedCategory(e.target.value)
                                                }
                                                className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-pink-50 focus:via-white focus:to-slate-50 focus:border-pink-500 focus:outline-none transition-all duration-300 text-gray-800 font-medium hover:border-gray-300 hover:shadow-md appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categoryOptions.map(({ name, price }) => (
                                                    <option key={name} value={name}>
                                                        {`${name} – ${selectedRegion === "indian" ? "₹" : "$"
                                                            }${price}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg
                                                    className="w-4 h-4 text-gray-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-600/5 to-rose-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                        {errors.ticketCategory && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                                <span>{errors.ticketCategory}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-8 py-6 border-t border-gray-200/50 rounded-b-3xl">
                        <div className="flex gap-4">
                            {/* Cancel Button */}
                            {isModal && <button
                                type="button"
                                onClick={toggleModal}
                                className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-300 hover:to-slate-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-gray-400/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1"
                            >
                                <div className="flex items-center justify-center space-x-2 relative z-10">
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </button>}

                            {/* Create/Pay Button */}
                            {eventData?.isPaidEvent ? (
                                <div className="flex-1">
                                    <RazorpayButton
                                        RazorPaySecret={eventData?.razorpaySecret}
                                        RazorpayApiKey={eventData?.razorpayKey}
                                        styleClass={`group relative overflow-hidden w-full py-3 px-6 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 ${isFormFilled()
                                            ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white"
                                            : "bg-gradient-to-r from-gray-300 to-slate-400 text-gray-600 cursor-not-allowed"
                                            }`}
                                        onSuccess={createIdAfterPayment}
                                        buttonText={
                                            selectedCategory
                                                ? `Pay (${selectedRegion === "indian" ? "₹" : "$"
                                                }${eventData?.regionPricings
                                                    .find((r) => r.region === selectedRegion)
                                                    .categories.find(
                                                        (c) => c.name === selectedCategory
                                                    ).price
                                                }) & Create `
                                                : "Select ticket first"
                                        }
                                        amount={
                                            eventData?.regionPricings
                                                .find((r) => r.region === selectedRegion)
                                                ?.categories.find(
                                                    (c) => c.name === selectedCategory
                                                )?.price || 0
                                        }
                                        user={{
                                            firstName,
                                            email,
                                            phone,
                                        }}
                                        currency={selectedRegion === "indian" ? "INR" : "USD"}
                                        loading={isCreating}
                                        onBeforePay={() => isValid()}
                                    />
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    disabled={isCreating}
                                >
                                    <div className="flex items-center justify-center space-x-2 relative z-10">
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                <span>Create ID</span>
                                            </>
                                        )}
                                    </div>
                                    {!isCreating && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(229, 231, 235, 0.5);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #2563eb, #7c3aed);
            }
          `}</style>
        </>
    )
}

export default RegistrationModal