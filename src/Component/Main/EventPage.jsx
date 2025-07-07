"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import EditEvents from "./Edit/EditEvents";
import {
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Search,
  Loader2,
  Filter,
  Grid3X3,
  List,
  Sparkles,
  TrendingUp,
  Clock,
  X,
  Upload,
  Tag,
  Building,
  DollarSign,
  Ticket,
} from "lucide-react";
import { Calendar, Plus, ChevronDown, Archive, LogOut } from "lucide-react";

function EventPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [Dataid, setDataid] = useState("");

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const [showEditModal, setActiveEventId] = useState(null);
  const toggleEditModal = (eventId) => {
    setActiveEventId(eventId);
  };

  const [inputs, setInputs] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const observerRef = useRef(null);

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
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const removeAmenity = (index) => {
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities);
  };

  const [eventName, setEventName] = useState("");
  const [address, setAddress] = useState("");
  const [endDate, setendDate] = useState("");
  const [startDate, setDate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [idcardimage, setIdcardimage] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventID] = useState("");
  const [amount, setAmount] = useState(0);
  const [isPaidEvent, setisPaidEvent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Ticket pricing states
  const [indianTicketCategories, setIndianTicketCategories] = useState([]);
  const [currentIndianTicketName, setCurrentIndianTicketName] = useState("");
  const [currentIndianTicketPrice, setCurrentIndianTicketPrice] = useState("");
  const [internationalTicketCategories, setInternationalTicketCategories] =
    useState([]);
  const [currentInternationalTicketName, setCurrentInternationalTicketName] =
    useState("");
  const [currentInternationalTicketPrice, setCurrentInternationalTicketPrice] =
    useState("");

  // Ticket handlers
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

  const removeIndianTicketCategory = (index) =>
    setIndianTicketCategories(
      indianTicketCategories.filter((_, i) => i !== index)
    );

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

  const removeInternationalTicketCategory = (index) =>
    setInternationalTicketCategories(
      internationalTicketCategories.filter((_, i) => i !== index)
    );

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("address", address);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("photo", photo);
      formData.append("idcardimage", idcardimage);
      formData.append("categories", JSON.stringify(categories));
      formData.append("isPaidEvent", JSON.stringify(isPaidEvent));

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

      for (const [key, value] of formData.entries())
        console.log(`${key}:`, value);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/events`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Event created:", response.data);
      toggleModal();
      fetchEvents();
      toast.success("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileChange = (e) => {
    const { id, files } = e.target;
    console.log(`Files selected for ${id}:`, files[0]?.size, "bytes");
    if (files.length > 0) {
      if (id === "event-image") {
        setPhoto(files[0]);
      } else if (id === "idcard-image") {
        setIdcardimage(files[0]);
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API_URL + `/api/events`
      );
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  // console.log("Events", events);

  const fetchData = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/event/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data);
      setDataid(response.data);
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setDataid([]);
    }
  };

  useEffect(() => {
    setTimeout(() => setAnimateCards(true), 300);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".event-card");
    if (cards.length && observerRef.current) {
      cards.forEach((card) => {
        observerRef.current.observe(card);
      });
    }
  }, [events, animateCards]);

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.startDate) - new Date(a.startDate);
    } else if (sortBy === "oldest") {
      return new Date(a.startDate) - new Date(b.startDate);
    } else if (sortBy === "name") {
      return a.eventName.localeCompare(b.eventName);
    } else if (sortBy === "participants") {
      return b.participantCount - a.participantCount;
    }
    return 0;
  });

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { day: "numeric", month: "short", year: "numeric" };

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString(undefined, options);
    }

    return `${start.toLocaleDateString(
      undefined,
      options
    )} - ${end.toLocaleDateString(undefined, options)}`;
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: "upcoming", color: "blue", label: "Upcoming" };
    } else if (now >= start && now <= end) {
      return { status: "ongoing", color: "green", label: "Ongoing" };
    } else {
      return { status: "completed", color: "gray", label: "Completed" };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTaskView = (groupId, groupName) => {
    setEventID(groupId);
    navigate(`/create-id?eventid=${groupId}&eventName=${groupName}`);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState({
    name: "Admin",
    imgSrc:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  });

  const options = [
    {
      name: "Wade Cooper",
      imgSrc:
        "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Archive Event?",
      text: "This will archive the event and it won't be deleted permanently.",
      icon: "warning",
      iconColor: "#4f46e5",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, archive it!",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        confirmButton: "rounded-lg",
        cancelButton: "rounded-lg",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(process.env.REACT_APP_API_URL + `/api/events/archive/${id}`, {
            archive: true,
          })
          .then((res) => {
            Swal.fire({
              title: "Archived!",
              text: "Event has been archived.",
              icon: "success",
              iconColor: "#10b981",
              confirmButtonColor: "#4f46e5",
              background: "#fff",
              customClass: {
                popup: "rounded-2xl shadow-2xl",
                confirmButton: "rounded-lg",
              },
            });
            fetchEvents();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white via-gray-50 to-slate-100 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
        <div className="flex h-16 mx-auto items-center justify-between px-4 lg:px-[80px]">
          <a
            className="group flex items-center gap-3 hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/")}
            rel="ugc"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold hidden cursor-pointer lg:block text-lg bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent">
              Event ID Card Generator App
            </span>
          </a>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleModal}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm whitespace-nowrap">Create Event</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            <div className="relative">
              <button
                type="button"
                className="group relative w-full cursor-pointer rounded-xl bg-gradient-to-r from-white via-gray-50 to-slate-50 h-10 py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-lg hover:shadow-xl border border-gray-200/60 hover:border-gray-300/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 min-w-[180px]"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={handleToggle}
              >
                <span className="flex items-center">
                  <div className="relative">
                    <img
                      src="/profilePhoto/profile.jpg"
                      alt="Profile"
                      className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="ml-3 block truncate font-medium text-gray-800">
                    {selectedOption.name}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-3">
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {isOpen && (
                <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none border border-gray-200/50 backdrop-blur-md">
                  <li
                    className="group relative select-none py-3 px-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 border-b border-gray-100"
                    role="option"
                    onClick={() => navigate("/archive-event")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                          <Archive className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                          Archive Events
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                    </div>
                  </li>

                  <li
                    className="group relative select-none py-3 px-4 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 cursor-pointer transition-all duration-200"
                    role="option"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                          <LogOut className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 group-hover:text-red-700">
                          Logout
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse delay-0"></div>
          <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-2 left-2/3 w-1 h-1 bg-indigo-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
        </div>
      </header>

      {/* Create Event Modal */}
      {showModal && (
        <EditEvents event={null} newEvent={true} onClose={() => setShowModal(false)} fetchEvents={fetchEvents} />
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50">
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-4">
            <EditEvents
              event={events.find((event) => event._id === showEditModal)}
              onClose={() => setActiveEventId(null)}
              fetchEvents={fetchEvents}
            />
          </div>
        )}
        <div className="container mx-auto px-4 py-8">
          {/* Search and Controls Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-10">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="relative w-full lg:w-auto lg:flex-1 max-w-md">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-12 pr-6 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-blue-50 focus:via-white focus:to-slate-50 focus:border-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="group flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-slate-200 hover:from-gray-200 hover:to-slate-300 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Filter className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter
                  </span>
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Sort by:
                  </span>
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "name", label: "Event Name" },
                    { value: "participants", label: "Participants" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        sortBy === option.value
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Events Count and Stats */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {filteredEvents.length} Event
                  {filteredEvents.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-gray-600">
                  {events.reduce(
                    (sum, event) => sum + event.participantCount,
                    0
                  )}{" "}
                  total participants
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Active events dashboard</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Loading your events...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch your data
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-slate-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm
                  ? `No events matching "${searchTerm}" found.`
                  : "You haven't created any events yet. Create your first event to get started!"}
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}
            >
              {sortedEvents.map((event, index) => {
                const eventStatus = getEventStatus(
                  event.startDate,
                  event.endDate
                );

                return (
                  <div
                    key={event._id}
                    className={`event-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] bg-white ${
                      animateCards ? "opacity-100" : "opacity-0 translate-y-8"
                    } ${viewMode === "list" ? "flex" : ""}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Event Image */}
                    <div
                      className={`relative overflow-hidden ${
                        viewMode === "list" ? "w-80 h-48" : "h-64"
                      }`}
                    >
                      <img
                        src={
                          event.photoUrl ||
                          "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={event.eventName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        width="600"
                        height="400"
                        style={{ aspectRatio: "600/400", objectFit: "cover" }}
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-90">
                        {/* Status Badge */}

                        {/* Participant Count */}
                        <div className="absolute top-4 right-4 z-20">
                          <div className="flex items-center space-x-2 bg-orange-500/90 text-white px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                            <Users className="h-4 w-4" />
                            <span className="font-bold text-sm">
                              {event.participantCount}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons - Fixed z-index issue */}
                        <div className="absolute top-16 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 space-y-2 z-30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEditModal(event._id);
                            }}
                            className="group w-8 h-8 bg-blue-500/90 hover:bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event._id);
                            }}
                            className="group w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskView(event._id, event.eventName);
                            }}
                            className="group w-8 h-8 bg-green-500/90 hover:bg-green-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Event Details - Fixed z-index to not overlap buttons */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                            {event.eventName}
                          </h3>

                          {/* Event Meta Info - Reduced right padding to avoid button overlap */}
                          <div className="space-y-2 mb-4 pr-16">
                            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 max-w-fit">
                              <Calendar className="h-4 w-4 text-white flex-shrink-0" />
                              <span className="text-sm font-medium text-white">
                                {formatDateRange(
                                  event.startDate,
                                  event.endDate
                                )}
                              </span>
                            </div>

                            {event.address && (
                              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 max-w-fit">
                                <MapPin className="h-4 w-4 text-white flex-shrink-0" />
                                <span className="text-sm font-medium text-white truncate">
                                  {event.address}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pr-16">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskView(event._id, event.eventName);
                              }}
                              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* List View Content */}
                    {viewMode === "list" && (
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {event.eventName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateRange(
                                    event.startDate,
                                    event.endDate
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {event.participantCount} participants
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleEditModal(event._id)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-300"
                            >
                              <Edit className="h-3 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleTaskView(event._id, event.eventName)
                              }
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all duration-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {event.address && (
                          <div className="flex items-center space-x-2 text-gray-600 mb-4">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{event.address}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              handleTaskView(event._id, event.eventName)
                            }
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-300"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Edit Modal */}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Animation Styles */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .event-card {
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .event-card.animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
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
    </div>
  );
}

export default EventPage;
