"\"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  X,
  Calendar,
  Upload,
  Tag,
  Building,
  DollarSign,
  Ticket,
  Edit,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";

const EditEvents = ({ event, onClose, fetchEvents }) => {
  const [eventName, setEventName] = useState(event?.eventName || "");
  const [address, setAddress] = useState(event?.address || "");
  const [startDate, setStartDate] = useState(
    event?.startDate?.split("T")[0] || ""
  );
  const [endDate, setEndDate] = useState(event?.endDate?.split("T")[0] || "");
  const [photo, setPhoto] = useState(null);
  const [idcardimage, setIdcardimage] = useState(null);
  const [categories, setCategories] = useState(event?.categories || []);
  const [amenities, setAmenities] = useState(
    event?.amenities ? Object.keys(event.amenities) : []
  );
  const [isPaidEvent, setIsPaidEvent] = useState(event?.isPaidEvent || false);
  const [indianTicketCategories, setIndianTicketCategories] = useState(
    event?.regionPricings?.find((r) => r.region === "indian")?.categories || []
  );
  const [internationalTicketCategories, setInternationalTicketCategories] =
    useState(
      event?.regionPricings?.find((r) => r.region === "international")
        ?.categories || []
    );

  const [currentCategory, setCurrentCategory] = useState("");
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [currentIndianTicketName, setCurrentIndianTicketName] = useState("");
  const [currentIndianTicketPrice, setCurrentIndianTicketPrice] = useState("");
  const [currentInternationalTicketName, setCurrentInternationalTicketName] =
    useState("");
  const [currentInternationalTicketPrice, setCurrentInternationalTicketPrice] =
    useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [razorpayKey, setRazorpayKey] = useState(event?.razorpayKey || ""); // [setRazorpayKey]
  const [razorpaySecret, setRazorpaySecret] = useState(event?.razorpaySecret || ""); // [setRazorpaySecret]
  const addCategory = (e) => {
    e.preventDefault();
    if (currentCategory.trim()) {
      setCategories([...categories, currentCategory.trim()]);
      setCurrentCategory("");
    }
  };

  const addAmenity = (e) => {
    e.preventDefault();
    if (currentAmenity.trim()) {
      setAmenities([...amenities, currentAmenity.trim()]);
      setCurrentAmenity("");
    }
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const removeAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addIndianTicketCategory = (e) => {
    e.preventDefault();
    if (currentIndianTicketName.trim() && currentIndianTicketPrice) {
      setIndianTicketCategories([
        ...indianTicketCategories,
        {
          name: currentIndianTicketName.trim(),
          price: currentIndianTicketPrice,
        },
      ]);
      setCurrentIndianTicketName("");
      setCurrentIndianTicketPrice("");
    }
  };

  const removeIndianTicketCategory = (index) => {
    setIndianTicketCategories(
      indianTicketCategories.filter((_, i) => i !== index)
    );
  };

  const addInternationalTicketCategory = (e) => {
    e.preventDefault();
    if (
      currentInternationalTicketName.trim() &&
      currentInternationalTicketPrice
    ) {
      setInternationalTicketCategories([
        ...internationalTicketCategories,
        {
          name: currentInternationalTicketName.trim(),
          price: currentInternationalTicketPrice,
        },
      ]);
      setCurrentInternationalTicketName("");
      setCurrentInternationalTicketPrice("");
    }
  };

  const removeInternationalTicketCategory = (index) => {
    setInternationalTicketCategories(
      internationalTicketCategories.filter((_, i) => i !== index)
    );
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    if (files.length > 0) {
      if (id === "event-image") {
        setPhoto(files[0]);
      } else if (id === "idcard-image") {
        setIdcardimage(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("address", address);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      if (photo) formData.append("photo", photo);
      if (idcardimage) formData.append("idcardimage", idcardimage);
      formData.append("categories", JSON.stringify(categories));
      formData.append("isPaidEvent", JSON.stringify(isPaidEvent));
      formData.append("razorpaySecret", razorpaySecret);
      formData.append("razorpayKey", razorpayKey);
      const regionPricings = [];
      if (indianTicketCategories.length) {
        regionPricings.push({
          region: "indian",
          categories: indianTicketCategories,
        });
      }
      if (internationalTicketCategories.length) {
        regionPricings.push({
          region: "international",
          categories: internationalTicketCategories,
        });
      }
      formData.append("regionPricings", JSON.stringify(regionPricings));

      const amenitiesObject = amenities.reduce((acc, amenity) => {
        acc[amenity] = false;
        return acc;
      }, {});
      formData.append("amenities", JSON.stringify(amenitiesObject));
      // console.log('regionPricings', regionPricings);
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/events/edit/${event._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // console.log("formdata", formData);
      console.log("Event updated:", response.data);
      toast.success("Event updated successfully!");
      fetchEvents();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden">
        <div className="relative bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-3xl shadow-2xl border border-gray-200/50">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-6 rounded-t-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Edit Event</h1>
                  <p className="text-white/90 text-sm mt-1">
                    Update your event details and preferences
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-4 left-12 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-16 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-6 left-20 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-700"></div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label
                        htmlFor="eventName"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                        placeholder="Enter Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="group">
                      <label
                        htmlFor="address"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full h-12 px-4 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                        placeholder="Enter Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Categories and Amenities */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-200/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-green-600" />
                      <span>Categories</span>
                    </h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="text"
                        value={currentCategory}
                        onChange={(e) => setCurrentCategory(e.target.value)}
                        className="flex-1 h-10 px-4 bg-white border-2 border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                        placeholder="Add Category"
                      />
                      <button
                        onClick={addCategory}
                        className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200/60 shadow-sm"
                        >
                          <span className="text-gray-700 font-medium">
                            {category}
                          </span>
                          <button
                            onClick={() => removeCategory(index)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 rounded-2xl p-6 border border-purple-200/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                      <Building className="w-5 h-5 text-purple-600" />
                      <span>Amenities</span>
                    </h3>
                    <div className="flex items-center space-x-3 mb-4">
                      <input
                        type="text"
                        value={currentAmenity}
                        onChange={(e) => setCurrentAmenity(e.target.value)}
                        className="flex-1 h-10 px-4 bg-white border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                        placeholder="Add Amenity"
                      />
                      <button
                        onClick={addAmenity}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200/60 shadow-sm"
                        >
                          <span className="text-gray-700 font-medium">
                            {amenity}
                          </span>
                          <button
                            onClick={() => removeAmenity(index)}
                            className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 border border-orange-200/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span>Event Dates</span>
                  </h3>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="group">
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="w-full h-12 px-4 bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="group">
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="w-full h-12 px-4 bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 rounded-2xl p-6 border border-pink-200/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-pink-600" />
                    <span>Images</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group">
                      <label
                        htmlFor="event-image"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Event Image
                      </label>
                      <input
                        type="file"
                        id="event-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full h-12 px-4 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                      />
                    </div>
                    <div className="group">
                      <label
                        htmlFor="idcard-image"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        ID Card Background
                      </label>
                      <input
                        type="file"
                        id="idcard-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full h-12 px-4 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-cyan-200/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-cyan-600" />
                    <span>Event Pricing</span>
                  </h3>
                  <div className="flex items-center space-x-6 mb-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="false"
                        checked={!isPaidEvent}
                        onChange={() => setIsPaidEvent(false)}
                        className="h-5 w-5 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium">
                        Free Event
                      </span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="true"
                        checked={isPaidEvent}
                        onChange={() => setIsPaidEvent(true)}
                        className="h-5 w-5 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium">
                        Paid Event
                      </span>
                    </label>
                  </div>

                  {isPaidEvent && (
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

                      {/* Razorpay API Keys */}
                      <div className="bg-white rounded-xl p-4 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-green-600" />
                          <span>Razorpay API Keys</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-2">
                            <label
                              htmlFor="razorpay-key"
                              className="text-sm font-semibold text-gray-700"
                            >
                              API Key
                            </label>
                            <input
                              type="text"
                              id="razorpay-key"
                              placeholder="Enter API Key"
                              value={razorpayKey}
                              onChange={(e) => setRazorpayKey(e.target.value)}
                              className="w-full h-12 px-4 bg-white border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <label
                              htmlFor="razorpay-secret"
                              className="text-sm font-semibold text-gray-700"
                            >
                              API Secret
                            </label>
                            <input
                              type="text"
                              id="razorpay-secret"
                              placeholder="Enter API Secret"
                              value={razorpaySecret}
                              onChange={(e) => setRazorpaySecret(e.target.value)}
                              className="w-full h-12 px-4 bg-white border-2 border-cyan-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Indian Pricing */}
                      <div className="bg-white rounded-xl p-4 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                          <Ticket className="w-4 h-4 text-green-600" />
                          <span>Indian Pricing (₹)</span>
                        </h4>
                        <div className="flex space-x-2 mb-3">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={currentIndianTicketName}
                            onChange={(e) =>
                              setCurrentIndianTicketName(e.target.value)
                            }
                            className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={currentIndianTicketPrice}
                            onChange={(e) =>
                              setCurrentIndianTicketPrice(e.target.value)
                            }
                            className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <button
                            onClick={addIndianTicketCategory}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-300"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {indianTicketCategories.map((tc, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-200/60"
                            >
                              <span className="text-gray-700 font-medium">
                                {tc.name} – ₹{tc.price}
                              </span>
                              <button
                                onClick={() => removeIndianTicketCategory(i)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-all duration-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* International Pricing */}
                      <div className="bg-white rounded-xl p-4 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                          <Ticket className="w-4 h-4 text-blue-600" />
                          <span>International Pricing ($)</span>
                        </h4>
                        <div className="flex space-x-2 mb-3">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={currentInternationalTicketName}
                            onChange={(e) =>
                              setCurrentInternationalTicketName(e.target.value)
                            }
                            className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Price ($)"
                            value={currentInternationalTicketPrice}
                            onChange={(e) =>
                              setCurrentInternationalTicketPrice(e.target.value)
                            }
                            className="flex-1 h-10 px-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={addInternationalTicketCategory}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-300"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {internationalTicketCategories.map((tc, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-blue-50 p-2 rounded-lg border border-blue-200/60"
                            >
                              <span className="text-gray-700 font-medium">
                                {tc.name} – ${tc.price}
                              </span>
                              <button
                                onClick={() =>
                                  removeInternationalTicketCategory(i)
                                }
                                className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-all duration-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-8 py-6 border-t border-gray-200/50 rounded-b-3xl">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-300 hover:to-slate-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-gray-400/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1"
              >
                <div className="flex items-center justify-center space-x-2 relative z-10">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>

              <button
                type="submit"
                onClick={handleSubmit}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isUpdating}
              >
                <div className="flex items-center justify-center space-x-2 relative z-10">
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Event</span>
                    </>
                  )}
                </div>
                {!isUpdating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                )}
              </button>
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
    </div>
  );
};

export default EditEvents;
