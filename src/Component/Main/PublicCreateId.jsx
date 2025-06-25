import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import RazorpayButton from "../Service/RazorpayButton";
import Swal from "sweetalert2";
import { CheckCircle } from "lucide-react"
import { Loader2 } from "lucide-react";
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
  const [eventData, setEventData] = useState(null)
  const [phone, setPhone] = useState("")
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

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      // formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("email", email);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("phone", phone);
      // Append background image URL to payload
      if (bgImage) formData.append("backgroundImage", bgImage);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowIdcardLink(data.link);
      toast.success(`ID created`);
      setFirstName("");
      // setLastName("");
      setDesignation("");
      setInstitute("");
      setEmail("");
      setPhone("");
      setProfilePicture(null);
      Swal.fire("Success", "ID card generated successfully.", "success");
      setShowThanksPage(true);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error", "Please check your internet connection."

      );
      setShowThanksPage(false);
      // toast.error("Failed to create ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAfterPayment = async (e) => {
    toast.dismiss();
    // e.preventDefault();
    setIsSubmitting(true);
    if (!isValid) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      // formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("email", email);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
      formData.append("phone", phone);
      // Append background image URL to payload
      if (bgImage) formData.append("backgroundImage", bgImage);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/participants`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setShowIdcardLink(data.link);
      toast.success(`ID created`);
      setFirstName("");
      // setLastName("");
      setDesignation("");
      setInstitute("");
      setEmail("");
      setPhone("");
      setProfilePicture(null);
      Swal.fire("Success", "ID card generated successfully.", "success");
      setShowThanksPage(true);

    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to create ID");
      setShowThanksPage(false);
      Swal.fire(
        "Error", "Please check your internet connection."

      );
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
    // if (!designation.trim()) newErrors.designation = "Designation is required.";
    // if (!institute.trim()) newErrors.institute = "Institute is required.";

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email.trim()))
      newErrors.email = "Enter a valid email.";

    if (!phone.trim()) newErrors.phone = "Phone is required.";
    else if (!phoneRegex.test(phone.trim()))
      newErrors.phone = "Phone must be 10 digits.";

    // only write into state when you really want errors shown
    if (!skipErrorSetting) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchEVentData();
  }, [eventId]);


  const LoaderOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );

  const ThanksPage = () => {
    return (
      <>
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-lg text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2 text-green-600">Registration Successful!</h1>
              <p className="text-gray-600 text-lg">
                Your ID for <span className="font-semibold">{eventName}</span> has been created successfully.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  You will receive a confirmation email shortly with your event details.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowThanksPage(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Register Another Person
                </button>

                <a
                  href={showIdcardLink}
                  className="w-full block py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-center"
                >
                  View Your ID Card
                </a>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }


  if (showThanksPage) return <ThanksPage />
const isFormFilled = () =>
  !!firstName.trim() &&
  // !!designation.trim() &&
  // !!institute.trim() &&
  !!email.trim() &&
  !!phone.trim();


  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      {isSubmitting && <LoaderOverlay />}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {eventName} - Create Your ID
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            placeholder="Name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors(prev => ({ ...prev, firstName: undefined }));
            }}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.firstName && (
            <span className=" text-sm text-red-500">{errors.firstName}</span>
          )}
          {/* <input
            placeholder="Company/Institute"
            value={institute}
            onChange={(e) => {
              setInstitute(e.target.value);
              setErrors(prev => ({ ...prev, institute: undefined }));
            }}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.institute && (
            <span className=" text-sm text-red-500">{errors.institute}</span>
          )} */}
          {/* <div>
            <input
              required
              placeholder="Designation"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setErrors(prev => ({ ...prev, designation: undefined }));
              }}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.designation && (
              <span className=" text-sm text-red-500">{errors.designation}</span>
            )}
          </div> */}

          {/* Phone */}
          <input
            type="phone"
            required
            placeholder="Phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors(prev => ({ ...prev, phone: undefined }));
            }}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.phone && (
            <span className=" text-sm text-red-500">{errors.phone}</span>
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && (
            <span className=" text-sm text-red-500">{errors.email}</span>
          )}
          {/* <div>
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div> */}
          {/* <div className="mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create ID"}
            </button>
          </div> */}


          {
            eventData?.isPaidEvent ?
              <RazorpayButton
                styleClass={`w-full  px-4 py-3 text-sm font-medium text-white  disabled:cursor-not-allowed rounded-md ${isFormFilled() ? "bg-black hover:bg-gray-700 " : "bg-gray-400 cursor-not-allowed"}`}
                buttonText={`Pay ${eventData?.amount} Rs and Create`}
                amount={eventData?.amount}
                onBeforePay={() => isValid()} // New prop, returns true if valid and sets errors
                onSuccess={handleSubmitAfterPayment}
                  loading={isSubmitting}
                user={{email, phone, firstName , institute, designation}}
              />
              :
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create ID"}
              </button>
          }
        </form>
      </div>
    </div>
  );
}
