import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import RazorpayButton from "../Service/RazorpayButton";
import Swal from "sweetalert2";
import { CheckCircle } from "lucide-react"
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
  useEffect(() => {
    if (!eventId || !eventName) {
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
            toast.error("Event not found");
          }
        })
        .catch(() => {
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
    // e.preventDefault();
    setIsSubmitting(true);
    if (!isValid) {
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

  const isValid = () => {
    if (!firstName.trim()) return false;
    // if (!lastName.trim()) return false;
    if (!designation.trim()) return false;
    if (!institute.trim()) return false;
    if (!email.trim()) return false;
    if (!phone.trim()) return false;
    // if (!profilePicture) return false;
    return true;
  };

  useEffect(() => {
    fetchEVentData();
  }, [eventId]);



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

                <button
                  onClick={() => setShowThanksPage(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }


  if(showThanksPage) return <ThanksPage />

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {eventName} - Create Your ID
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            placeholder=" Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Company/Institute"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <input
              required
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <input
            type="phone"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
              <RazorpayButton isValid={isValid()} styleClass={`  w-full  px-4 py-3 text-sm font-medium text-white  rounded-md ${isValid() ? "bg-black" : "bg-gray-400 cursor-not-allowed"}  `} onSuccess={handleSubmitAfterPayment} buttonText={`${eventData?.isPaidEvent ? `Pay ${eventData?.amount} Rs and Create` : "Create"}`} amount={eventData?.amount} />
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
