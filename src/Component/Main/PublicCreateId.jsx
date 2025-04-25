import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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

  useEffect(() => {
    if (!eventId || !eventName) {
      toast.error("Missing event information in URL");
    }
  }, [eventId, eventName]);

  useEffect(() => {
    if (eventId) {
      axios
        .get("http://localhost:5000/api/events")
        .then((res) => {
          const found = res.data.find((e) => e._id === eventId);
          if (found) {
            setCategories(found.categories || []);
            const img =  found.idcardimage || "";
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
      formData.append("lastName", lastName);
      formData.append("designation", designation);
      formData.append("institute", institute);
      formData.append("email", email);
      formData.append("eventId", eventId);
      formData.append("eventName", eventName);
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
      setLastName("");
      setDesignation("");
      setInstitute("");
      setEmail("");
      setProfilePicture(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ID");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-80 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {eventName} - Create Your ID
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            required
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="block mb-1 font-medium">Designation</label>
            <select
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Designation</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <input
            placeholder="Institute"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create ID"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
