"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Archive,
  RotateCcw,
  Loader2,
  User,
  ChevronLeft,
  Calendar,
} from "lucide-react";

function ArchiveIDCard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState(null);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventid = params.get("eventid");

    if (eventid) {
      setEventId(eventid);
      fetchData(eventid);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const fetchData = async (eventId) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/participants/participentarchive/${eventId}`;
      const response = await axios.get(url);
      console.log("Participants by EventId:", response.data);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching participants by eventId:", error);
      setData([]);
      setLoading(false);
    }
  };

  const handleArchive = (id) => {
    Swal.fire({
      title: "Unarchive ID Card?",
      text: "This will unarchive the ID Card.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
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
          .patch(
            `${process.env.REACT_APP_API_URL}/api/participants/unarchive/${id}`,
            {
              archive: false,
            }
          )
          .then((res) => {
            Swal.fire({
              title: "Unarchived!",
              text: "ID Card has been unarchived.",
              icon: "success",
              customClass: {
                popup: "rounded-2xl shadow-2xl",
                confirmButton: "rounded-lg",
              },
            });
            fetchData(eventId);
            console.log("Unarchived");
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const filteredData = data.filter((card) => card.archive);
  const reversedData = [...filteredData].reverse();

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
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Archive ID Cards</h1>
          </div>
          <p className="text-center text-gray-300 mt-4 text-lg">
            Manage your archived ID cards
          </p>
        </div>

        {/* Floating accent dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-pulse delay-0"></div>
          <div className="absolute top-16 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute bottom-8 left-2/3 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-25 animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-xl font-semibold text-gray-700">
              Loading archived cards...
            </p>
            <p className="text-gray-500 mt-2">
              Please wait while we fetch your data
            </p>
          </div>
        ) : reversedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-slate-400 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Archive className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Archived Cards
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              There are no archived ID cards to display. Archive some cards to
              see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {reversedData.map((card, index) => (
              <div
                key={`id-card-${index}`}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 hover:border-gray-300/70 transform hover:scale-105"
              >
                {/* Card Background */}
                <div
                  className="relative h-[400px] rounded-t-3xl overflow-hidden"
                  style={{
                    backgroundImage: `url(${card.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-white">
                    {/* Profile Picture */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                        <img
                          src={card.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Name */}
                    <h2 className="text-xl font-bold text-center mb-2 drop-shadow-lg">
                      {card.firstName} {card.lastName}
                    </h2>

                    {/* Institute */}
                    <p className="text-sm font-semibold text-center mb-2 text-white/90 drop-shadow-md">
                      {card.institute}
                    </p>

                    {/* Designation */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 mb-2">
                      <p className="text-sm font-bold text-center text-white">
                        {card.designation}
                      </p>
                    </div>

                    {/* Participant ID */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-xs font-bold text-center text-white">
                        ID: {card.participantId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50">
                  <button
                    onClick={() => handleArchive(card._id)}
                    className="group w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Unarchive</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                </div>

                {/* Card hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchiveIDCard;
