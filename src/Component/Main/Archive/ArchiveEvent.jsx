"use client";

import axios from "axios";
import {
  Calendar,
  MapPin,
  Archive,
  RotateCcw,
  Users,
  Search,
  Loader2,
  ImageIcon,
  ChevronLeft,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function ArchiveEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [animateCards, setAnimateCards] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/archiveevent`
      );
      setEvents(response.data);
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 300);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Set up intersection observer for scroll animations
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
    // Apply observer to cards after they're rendered
    const cards = document.querySelectorAll(".event-card");
    if (cards.length && observerRef.current) {
      cards.forEach((card) => {
        observerRef.current.observe(card);
      });
    }
  }, [events, animateCards]);

  const handleDelete = (id, eventName) => {
    Swal.fire({
      title: "Unarchive Event?",
      text: `This will restore "${eventName}" to your active events.`,
      icon: "question",
      iconColor: "#4f46e5",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, unarchive it!",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl shadow-2xl",
        confirmButton: "rounded-lg",
        cancelButton: "rounded-lg",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .patch(`${process.env.REACT_APP_API_URL}/api/events/archive/${id}`, {
            archive: false,
          })
          .then((res) => {
            Swal.fire({
              title: "Unarchived!",
              text: `"${eventName}" has been restored to active events.`,
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
            Swal.fire({
              title: "Error!",
              text: "Failed to unarchive event. Please try again.",
              icon: "error",
              confirmButtonColor: "#4f46e5",
              background: "#fff",
              customClass: {
                popup: "rounded-2xl shadow-2xl",
                confirmButton: "rounded-lg",
              },
            });
          });
      }
    });
  };

  const filteredEvents = events.filter((event) =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "oldest") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === "name") {
      return a.eventName.localeCompare(b.eventName);
    } else if (sortBy === "participants") {
      return b.participantCount - a.participantCount;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50">
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-white via-gray-50 to-slate-100 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
        <div className="flex h-16 mx-auto items-center justify-between px-4 lg:px-[80px]">
          {/* Logo Section */}
          <a
            className="group flex items-center gap-3 hover:scale-105 transition-all duration-300"
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

          {/* Back Button */}
          <a
            onClick={() => navigate(-1)}
            className="group flex items-center cursor-pointer space-x-2 bg-gradient-to-r from-gray-100 to-slate-200 hover:from-gray-200 hover:to-slate-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              Back to Events
            </span>
          </a>
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
          <div className="absolute bottom-2 left-2/3 w-1 h-1 bg-indigo-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-700/10 backdrop-blur-sm"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg mb-6">
              <Archive className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Archived Events
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Browse and manage your archived events. Restore events when you
              need them again.
            </p>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/5 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search archived events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-6 bg-gradient-to-r from-white via-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl shadow-sm focus:shadow-lg focus:from-indigo-50 focus:via-white focus:to-slate-50 focus:border-indigo-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="group flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-slate-200 hover:from-gray-200 hover:to-slate-300 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                Sort & Filter
              </span>
            </button>
          </div>

          {/* Filter Options */}
          {filterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                {[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "name", label: "Event Name" },
                  { value: "participants", label: "Participant Count" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      sortBy === option.value
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
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

        {/* Events Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Archive className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {filteredEvents.length} Archived Event
              {filteredEvents.length !== 1 ? "s" : ""}
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Loading archived events...
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch your data
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-slate-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Archive className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Archived Events
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchTerm
                ? `No events matching "${searchTerm}" found in your archives.`
                : "You don't have any archived events yet. When you archive events, they'll appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedEvents.map((event, index) => (
              <div
                key={event._id}
                className={`event-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${
                  animateCards ? "opacity-100" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Event Image */}
                <div className="relative h-64 overflow-hidden">
                  {event.photoUrl ? (
                    <img
                      src={event.photoUrl || "/placeholder.svg"}
                      alt={event.eventName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      width="600"
                      height="400"
                      style={{ aspectRatio: "600/400", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-gray-500 font-medium">
                        No Image Available
                      </span>
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-90">
                    {/* ID Card Count Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-2 bg-yellow-400/90 text-black px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                        <Users className="h-4 w-4" />
                        <span className="font-bold text-sm">
                          {event.participantCount} ID Cards
                        </span>
                      </div>
                    </div>

                    {/* Unarchive Button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleDelete(event._id, event.eventName)}
                        className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                      >
                        <div className="flex items-center space-x-2 relative z-10">
                          <RotateCcw className="h-4 w-4" />
                          <span className="text-sm">Unarchive</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      </button>
                    </div>

                    {/* Event Details */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                        {event.eventName}
                      </h3>

                      {/* Event Meta Info */}
                      <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
                        <div className="flex items-center space-x-1.5 text-white/90">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {formatDate(event.date)}
                          </span>
                        </div>

                        {event.address && (
                          <div className="flex items-center space-x-1.5 text-white/90">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium line-clamp-1">
                              {event.address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover Details */}
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <button
                          onClick={() =>
                            handleDelete(event._id, event.eventName)
                          }
                          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Restore Event</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      `}</style>
    </div>
  );
}

export default ArchiveEvent;
