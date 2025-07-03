"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { User, Building2, Briefcase, Upload, X, Loader2, UserCheck } from "lucide-react"

function EditParticipant({ toggleModal, id, eventId, fetchData, data }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [institute, setInstitute] = useState("")
  const [designation, setDesignation] = useState("")
  const [profilePicture, setProfilePicture] = useState(null)
  const [designations, setDesignations] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Fetch designations based on eventId
  const fetchDesignations = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`)
      const event = response.data.find((event) => event._id === eventId)
      if (event) {
        setDesignations(event.categories || [])
      } else {
        console.error("Event not found")
      }
    } catch (error) {
      console.error("Error fetching designations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize form fields with data from props
  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || "")
      setLastName(data.lastName || "")
      setInstitute(data.institute || "")
      setDesignation(data.designation || "")
      setProfilePicture(null)
    }
  }, [data])

  useEffect(() => {
    fetchDesignations()
  }, [eventId])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeProfilePicture = () => {
    setProfilePicture(null)
    setPreviewUrl(null)
    document.getElementById("profilePicture").value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsCreating(true)

    const formData = new FormData()
    formData.append("firstName", firstName)
    formData.append("lastName", lastName)
    formData.append("institute", institute)
    formData.append("designation", designation)

    if (profilePicture) {
      formData.append("profilePicture", profilePicture)
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/participants/participant/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toggleModal()
      fetchData()
    } catch (error) {
      console.error("Error updating participant:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modal Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Update Participant</h1>
                  <p className="text-indigo-100 text-sm mt-1">Modify participant information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleModal}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-gray-600">Loading designations...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-indigo-600" />
                      <span>First Name</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <User className="h-4 w-4 text-indigo-600" />
                      <span>Last Name</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Institute and Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                      <span>Institute</span>
                    </label>
                    <input
                      type="text"
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      placeholder="Enter institute name"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      <span>Designation</span>
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Select designation</option>
                      {designations.length === 0 ? (
                        <option value="" disabled>
                          No designations available
                        </option>
                      ) : (
                        designations.map((desig, index) => (
                          <option key={index} value={desig}>
                            {desig}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Upload className="h-4 w-4 text-indigo-600" />
                    <span>Profile Picture</span>
                  </label>

                  <div className="relative">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {!previewUrl ? (
                      <label
                        htmlFor="profilePicture"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 group"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                          <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                        </div>
                      </label>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="h-16 w-16 rounded-lg object-cover border-2 border-white shadow-sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">
                              {profilePicture?.name || "Profile picture"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {profilePicture?.size ? `${(profilePicture.size / 1024 / 1024).toFixed(2)} MB` : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleModal}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isCreating || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Update Participant</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
        }
      `}</style>
    </div>
  )
}

export default EditParticipant
