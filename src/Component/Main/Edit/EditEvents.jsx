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
  MessageCircle,
} from "lucide-react";

const EditEvents = ({ event, onClose, fetchEvents, newEvent = false }) => {
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

  const [coupons, setCoupons] = useState(event?.coupons || []);
  const [currentCouponName, setCurrentCouponName] = useState("")
  const [currentCouponType, setCurrentCouponType] = useState("fixed")
  const [currentCouponValue, setCurrentCouponValue] = useState("")
  const [whatsappApiKey, setWhatsappApiKey] = useState(event?.whatsappApiKey || "");

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
    let apiURL = ``;
    let method = ""
    if (newEvent) {
      apiURL = `${process.env.REACT_APP_API_URL}/api/events`;
      method = "post"
    }
    else {
      apiURL = `${process.env.REACT_APP_API_URL}/api/events/edit/${event._id}`;
      method = "patch"
    }
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
      formData.append("whatsappApiKey", whatsappApiKey);
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
      const cleanedCoupons = coupons
  .filter(c => c && c.name && c.type && c.value)  // Remove empty/invalid
  .map(c => ({ ...c, value: Number(c.value) }));  // Ensure value is number

formData.append("coupons", JSON.stringify(cleanedCoupons));
      // console.log("coupon", coupons);
      const amenitiesObject = amenities.reduce((acc, amenity) => {
        acc[amenity] = false;
        return acc;
      }, {});
      formData.append("amenities", JSON.stringify(amenitiesObject));
      // console.log('regionPricings', regionPricings);
      const response = await axios[method](
        apiURL,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // console.log("formdata", formData);
      console.log("Event updated:", response.data);
      toast.success(`Event ${newEvent ? "created" : "updated"} successfully`);
      fetchEvents();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(`Error ${newEvent ? "creating" : "updating"} event`);
    } finally {
      setIsUpdating(false);
    }
  };


  const addCoupon = () => {
    if (currentCouponName.trim() && currentCouponValue.trim()) {
      setCoupons([
        ...coupons,
        {
          name: currentCouponName.trim().toUpperCase(),
          type: currentCouponType,
          value: currentCouponValue.trim(),
        },
      ])
      setCurrentCouponName("")
      setCurrentCouponValue("")
    }
    console.log(coupons)
  }

  const removeCoupon = (index) => {
    setCoupons(
      coupons.filter((_, i) => i !== index)
    )
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black/60 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="relative bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-2xl shadow-2xl border border-gray-200/50">
          {/* Compact Modal Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-6 py-4 rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-700/10 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{`${newEvent ? "Create" : "Edit"} Event`}</h1>
                  <p className="text-white/90 text-xs mt-0.5">
                    {` ${newEvent ? "Add" : "Edit"} your event details here.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="group w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Compact Modal Content */}
          <div className="max-h-[65vh] overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="eventName" className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Name
                      </label>
                      <input
                        type="text"
                        id="eventName"
                        className="w-full h-10 px-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-lg shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm"
                        placeholder="Enter Event Name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full h-10 px-3 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-lg shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm"
                        placeholder="Enter Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Categories and Amenities */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border border-green-200/50">
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>Categories</span>
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={currentCategory}
                        onChange={(e) => setCurrentCategory(e.target.value)}
                        className="flex-1 h-8 px-3 bg-white border-2 border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-sm"
                        placeholder="Add Category"
                      />
                      <button
                        onClick={addCategory}
                        className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold py-1.5 px-3 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-2 rounded-md border border-green-200/60 shadow-sm"
                        >
                          <span className="text-gray-700 font-medium text-sm">{category}</span>
                          <button
                            onClick={() => removeCategory(index)}
                            className="p-0.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-sm transition-all duration-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 rounded-xl p-4 border border-purple-200/50">
                    <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                      <Building className="w-4 h-4 text-purple-600" />
                      <span>Amenities</span>
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={currentAmenity}
                        onChange={(e) => setCurrentAmenity(e.target.value)}
                        className="flex-1 h-8 px-3 bg-white border-2 border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-sm"
                        placeholder="Add Amenity"
                      />
                      <button
                        onClick={addAmenity}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-semibold py-1.5 px-3 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-2 rounded-md border border-purple-200/60 shadow-sm"
                        >
                          <span className="text-gray-700 font-medium text-sm">{amenity}</span>
                          <button
                            onClick={() => removeAmenity(index)}
                            className="p-0.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-sm transition-all duration-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 rounded-xl p-4 border border-orange-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>Event Dates</span>
                  </h3>
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="startDate" className="block text-xs font-semibold text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="w-full h-10 px-3 bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="endDate" className="block text-xs font-semibold text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="w-full h-10 px-3 bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 rounded-xl p-4 border border-pink-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-pink-600" />
                    <span>Images</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="event-image" className="block text-xs font-semibold text-gray-700 mb-1">
                        Event Image
                      </label>
                      <input
                        type="file"
                        id="event-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full h-10 px-3 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 text-sm"
                      />
                    </div>
                    <div className="group">
                      <label htmlFor="idcard-image" className="block text-xs font-semibold text-gray-700 mb-1">
                        ID Card Background
                      </label>
                      <input
                        type="file"
                        id="idcard-image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full h-10 px-3 bg-white border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 text-sm"
                      />
                    </div>
                  </div>
                </div>
                {/* Whatsapp Integration */}
              
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-4 border border-green-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0 0 48 48">
                      <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
                    </svg>
                    <span>Whatsapp Integration</span>
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <label htmlFor="whatsapp-api-key" className="block text-xs font-semibold text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="text"
                      id="whatsapp-api-key"
                      value={whatsappApiKey}
                      onChange={(e) => setWhatsappApiKey(e.target.value)}
                      className="flex-1 h-8 px-3 bg-white border-2 border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-sm"
                      placeholder="Enter your Whatsapp API Key"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-xl p-4 border border-cyan-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-cyan-600" />
                    <span>Event Pricing</span>
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="false"
                        checked={!isPaidEvent}
                        onChange={() => setIsPaidEvent(false)}
                        className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium text-sm">Free Event</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="true"
                        checked={isPaidEvent}
                        onChange={() => setIsPaidEvent(true)}
                        className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                      />
                      <span className="ml-2 text-gray-800 font-medium text-sm">Paid Event</span>
                    </label>
                  </div>
                  {isPaidEvent && (
                    <div className="space-y-4">
                      {/* Razorpay API Keys */}
                      <div className="bg-white rounded-lg p-3 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2 text-sm">
                          <Sparkles className="w-3 h-3 text-green-600" />
                          <span>Razorpay API Keys</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1">
                            <label htmlFor="razorpay-key" className="text-xs font-semibold text-gray-700">
                              API Key
                            </label>
                            <input
                              type="text"
                              id="razorpay-key"
                              placeholder="Enter API Key"
                              value={razorpayKey}
                              onChange={(e) => setRazorpayKey(e.target.value)}
                              className="w-full h-9 px-3 bg-white border-2 border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-sm"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label htmlFor="razorpay-secret" className="text-xs font-semibold text-gray-700">
                              API Secret
                            </label>
                            <input
                              type="text"
                              id="razorpay-secret"
                              placeholder="Enter API Secret"
                              value={razorpaySecret}
                              onChange={(e) => setRazorpaySecret(e.target.value)}
                              className="w-full h-9 px-3 bg-white border-2 border-cyan-200 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Indian Pricing */}
                      <div className="bg-white rounded-lg p-3 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2 text-sm">
                          <Ticket className="w-3 h-3 text-green-600" />
                          <span>Indian Pricing (₹)</span>
                        </h4>
                        <div className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={currentIndianTicketName}
                            onChange={(e) => setCurrentIndianTicketName(e.target.value)}
                            className="flex-1 h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={currentIndianTicketPrice}
                            onChange={(e) => setCurrentIndianTicketPrice(e.target.value)}
                            className="flex-1 h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                          <button
                            onClick={addIndianTicketCategory}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:from-green-400 hover:to-emerald-500 transition-all duration-300 text-sm"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-20 overflow-y-auto">
                          {indianTicketCategories.map((tc, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-green-50 p-2 rounded-md border border-green-200/60"
                            >
                              <span className="text-gray-700 font-medium text-sm">
                                {tc.name} – ₹{tc.price}
                              </span>
                              <button
                                onClick={() => removeIndianTicketCategory(i)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded-sm transition-all duration-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* International Pricing */}
                      <div className="bg-white rounded-lg p-3 border border-cyan-200/60 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2 text-sm">
                          <Ticket className="w-3 h-3 text-blue-600" />
                          <span>International Pricing ($)</span>
                        </h4>
                        <div className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            placeholder="Category Name"
                            value={currentInternationalTicketName}
                            onChange={(e) => setCurrentInternationalTicketName(e.target.value)}
                            className="flex-1 h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Price ($)"
                            value={currentInternationalTicketPrice}
                            onChange={(e) => setCurrentInternationalTicketPrice(e.target.value)}
                            className="flex-1 h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                          <button
                            onClick={addInternationalTicketCategory}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 text-sm"
                          >
                            Add
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-20 overflow-y-auto">
                          {internationalTicketCategories.map((tc, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-blue-50 p-2 rounded-md border border-blue-200/60"
                            >
                              <span className="text-gray-700 font-medium text-sm">
                                {tc.name} – ${tc.price}
                              </span>
                              <button
                                onClick={() => removeInternationalTicketCategory(i)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded-sm transition-all duration-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isPaidEvent && <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-4 border border-yellow-200/50">
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-yellow-600" />
                    <span>Coupon Codes</span>
                  </h3>
                  <div className="bg-white rounded-lg p-3 border border-yellow-200/60 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold text-gray-700">Coupon Name</label>
                        <input
                          type="text"
                          placeholder="e.g., LUCKY10"
                          value={currentCouponName}
                          onChange={(e) => setCurrentCouponName(e.target.value)}
                          className="h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-sm uppercase"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold text-gray-700">Type</label>
                        <select
                          value={currentCouponType}
                          onChange={(e) => setCurrentCouponType(e.target.value)}
                          className="h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-sm"
                        >
                          <option value="fixed">Fixed (₹)</option>
                          <option value="percentage">Percentage (%)</option>
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs font-semibold text-gray-700">
                          Value {currentCouponType === "fixed" ? "(₹)" : "(%)"}
                        </label>
                        <input
                          type="number"
                          placeholder={currentCouponType === "fixed" ? "100" : "10"}
                          value={currentCouponValue}
                          onChange={(e) => setCurrentCouponValue(e.target.value)}
                          className="h-8 px-2 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-sm"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={addCoupon}
                          className="h-8 px-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-md hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 text-sm font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {coupons.map((coupon, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-yellow-50 p-2 rounded-md border border-yellow-200/60"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-700 font-bold text-sm bg-yellow-100 px-2 py-1 rounded">
                              {coupon.name}
                            </span>
                            <span className="text-gray-600 text-sm">
                              {coupon.type === "fixed" ? `₹${coupon.value} off` : `${coupon.value}% off`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCoupon(i)}
                            className="p-0.5 text-red-600 hover:bg-red-100 rounded-sm transition-all duration-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {coupons.length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-2">No coupon codes added yet</div>
                      )}
                    </div>
                  </div>
                </div>}
              </form>
            </div>
          </div>

          {/* Compact Modal Footer */}
          <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-slate-500 hover:from-gray-300 hover:to-slate-400 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-gray-400/20 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1"
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
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                      <span>{newEvent ? "Create" : "Update"}</span>
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
          width: 4px;
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
