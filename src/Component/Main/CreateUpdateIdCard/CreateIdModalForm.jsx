import React from "react";
import RazorpayButton from "../../Service/RazorpayButton";
import { Loader2 } from "lucide-react";


import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
// import IdCardrender from "./IdCard/IdCardrender";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";
import Swal from "sweetalert2";
// import CreateIdModalForm from "./CreateUpdateIdCard/CreateIdModalForm";
// import WebcamCapture from "./WebcamCapture";

export default function CreateIdModalForm({
    toggleModal, 
    fetchData
}) {

    const location = useLocation();
    // console.log("(new URLSearchParams(location.search))", new URLSearchParams(location.search).get("eventid"));
    const [modal, setModal] = useState(false);
    const [linkmodal, setlinkmodal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [amenities, setamenities] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [copySuccess, setCopySuccess] = useState("");
    const [phone, setPhone] = useState("");
    useState("");
    const [errors, setErrors] = useState({});
    const [eventData, setEventData] = useState(null); // State to hold fetched event data

    // Ticket selection state
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");


    // Derive dropdown options
    const regionOptions = eventData?.regionPricings?.map(r => r.region) || [];
    const categoryOptions = selectedRegion
        ? eventData.regionPricings.find(r => r.region === selectedRegion)?.categories || []
        : [];



    const fetchEVentData = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/events/${eventId}`
            );
            console.log("Event Data:", response.data);
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

  




    const [isCreating, setIsCreating] = useState(false); // New state for loading spinner

    const handleSubmit = async (event) => {
        event.preventDefault();
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
            Swal.fire(
                "Error", "Please check your internet connection."

            );
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
            if (!selectedRegion) newErrors.ticketRegion = "Ticket Region is required.";
            if (!selectedCategory) newErrors.ticketCategory = "Ticket Category is required.";
        }

        // only write into state when you really want errors shown
        if (!skipErrorSetting) {
            setErrors(newErrors);
        }

        return Object.keys(newErrors).length === 0;
    };





    return (
       <div
  id="default-modal"
  tabIndex="-1"
  aria-hidden="true"
  className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/60 backdrop-blur-sm"
>
  <div className="relative w-full max-w-2xl p-4 mx-2 overflow-hidden">
    <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-semibold text-gray-900">
       Create <span className="font-bold "> {eventData?.eventName} </span>ID<span className="text-gray-600 text-sm ">{eventData?.isPaidEvent && " (Paid Event)"}</span>
        </h1>
        <button
          onClick={toggleModal}
          className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          {/* Institute & Designation */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/** Institute **/}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Institute
              </label>
              <input
                type="text"
                value={institute}
                onChange={e => setInstitute(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.institute && (
                <p className="mt-1 text-sm text-red-500">{errors.institute}</p>
              )}
            </div>
            {/** Designation **/}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
              )}
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setemail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Region & Category */}
          {eventData?.regionPricings?.length > 0 && (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Region
                </label>
                <select
                  
                  value={selectedRegion}
                  onChange={e => {
                    setSelectedRegion(e.target.value);
                    setSelectedCategory("");
                    fetchDesignations(eventData._id);
                  }}
                  className="w-full px-3 py-2 capitalize border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Region</option>
                  {regionOptions.map(r => (
                    <option className="capitalize" key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {errors.ticketRegion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ticketRegion}
                  </p>
                )}
              </div>

              {selectedRegion && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(c => (
                      <option key={c.name} value={c.name}>
                        {`${c.name} – ${
                          selectedRegion === "indian" ? "₹" : "$"
                        }${c.price}`}
                      </option>
                    ))}
                  </select>
                  {errors.ticketCategory && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.ticketCategory}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

        
        </form>
        
      </div>
        {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between p-3">
            <button
              type="button"
              onClick={toggleModal}
              className="w-full px-4 py-2 text-center border rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 sm:w-1/2"
            >
              Cancel
            </button>

            {eventData?.isPaidEvent ? (
              <RazorpayButton
                styleClass={`w-full px-4 py-3 text-sm font-medium text-white rounded-lg disabled:cursor-not-allowed ${
                  isFormFilled()
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-400"
                }`}
                onSuccess={createIdAfterPayment}
                buttonText={
                  selectedCategory
                    ? `Pay & Create (${
                        selectedRegion === "indian" ? "₹" : "$"
                      }${
                        eventData.regionPricings
                          .find(r => r.region === selectedRegion)
                          .categories.find(c => c.name === selectedCategory).price
                      })`
                    : "Select ticket first"
                }
                amount={
                  eventData.regionPricings.find(
                    r => r.region === selectedRegion
                  )?.categories.find(c => c.name === selectedCategory)?.price || 0
                }
                user={{ firstName, lastName, email, phone }}
                currency={selectedRegion === "indian" ? "INR" : "USD"}
                loading={isCreating}
                onBeforePay={() => isValid()}
              />
            ) : (
              <button
                // type="submit"
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full px-4 py-3 font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:w-1/2"
              >
                {isCreating ? <Loader2 className="animate-spin" /> : "Create"}
              </button>
            )}
          </div>
    </div>
  </div>
</div>
    );
}