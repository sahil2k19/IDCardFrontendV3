import { useState } from "react"
import {
  Edit,
  Eye,
  Download,
  FileImage,
  FileSpreadsheet,
  Loader2,
  X,
  ChevronDown,
  Ticket,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react"
import axios from "axios"
import { useEffect } from "react"
const DownloadButtons = ({
  loadingZip,
  loadingZipNoBg,
  loadingExcel,
  downloadAllImagesAsZip,
  downloadAllImagesWithoutBackgroundAsZip,
  downloadAllEntries,
  toggleModalOpenedit,
  toggleModalOpen,
  eventData,
  participants,
}) => {

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [coupons, setCoupons] = useState(eventData?.coupons || [])
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [newCoupon, setNewCoupon] = useState({ name: "", type: "fixed", value: 0, scope: "indian" })
  const [couponUsageMap, setCouponUsageMap] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      // Replace with your actual API endpoint
      const cleanedCoupons = coupons
        .filter((c) => c && c.name && c.type && c.value) // Remove empty/invalid
        .map((c) => ({ ...c, value: Number(c.value) })) // Ensure value is number
      formData.append("regionPricings", JSON.stringify(eventData?.regionPricings))
      formData.append("coupons", JSON.stringify(cleanedCoupons))
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/events/edit/${eventData._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      setIsCouponModalOpen(false)
    } catch (error) {
      console.error("Error saving coupons:", error)
      alert("Error saving coupons")
    }
  }

  function getCouponUsageMap() {
    const couponUsageMap = {};

    participants.forEach(p => {
      const code = p.useCouponCode;
      if (code) {
        couponUsageMap[code] = (couponUsageMap[code] || 0) + 1;
      }
    });

    return couponUsageMap;
  }

  useEffect(() => {
    setCouponUsageMap(getCouponUsageMap());
  }, [participants])

  return (
    <div className="w-full max-w-6xl mx-auto p-6 relative">
      {/* Professional background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 rounded-2xl opacity-40"></div>

      <div className="relative flex flex-wrap gap-4 justify-center">
        {/* Edit All ID Cards Button */}
        <button
          className="group h-13 relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-800 to-gray-800 hover:from-slate-600 hover:via-slate-700 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-slate-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-slate-600/30 hover:border-slate-500/50"
          onClick={toggleModalOpenedit}
        >
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Edit className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
            <span className="text-sm font-medium">Edit All ID Cards</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>

        {/* Show & Hide Button */}
        <button
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-blue-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-blue-500/30 hover:border-blue-400/50"
          onClick={toggleModalOpen}
        >
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Eye className="w-5 h-5 group-hover:scale-105 transition-transform duration-300" />
            <span className="text-sm font-medium">Show & Hide</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>


        <button
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-500 hover:via-green-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-emerald-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-emerald-500/30 hover:border-emerald-400/50"
          onClick={() => setIsDownloadModalOpen(true)}
        >
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
            <span className="text-sm font-medium">Download Options</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>

        {/* Coupon Code Button */}
        {eventData?.isPaidEvent && <button
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-700 to-rose-700 hover:from-purple-500 hover:via-pink-600 hover:to-rose-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-purple-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-purple-500/30 hover:border-purple-400/50"
          onClick={() => setIsCouponModalOpen(true)}
        >
          <div className="flex items-center justify-center space-x-2 relative z-10">
            <Ticket className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
            <span className="text-sm font-medium">Coupon Code</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        </button>}

      </div>

      {/* Professional subtle accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute top-6 left-6 w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse delay-0"></div>
        <div className="absolute top-4 right-8 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-8 left-16 w-1 h-1 bg-emerald-400 rounded-full opacity-15 animate-pulse delay-2000"></div>
        <div className="absolute bottom-6 right-12 w-0.5 h-0.5 bg-indigo-400 rounded-full opacity-25 animate-pulse delay-3000"></div>
      </div>

      {/* Professional grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(51 65 85) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>


      {/* Download Options Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Download className="w-5 h-5 text-emerald-600" />
                  Download Options
                </h2>
                <button
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Download All as ZIP Button */}
              <button
                className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-500 hover:via-green-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-emerald-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-emerald-500/30 hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                onClick={downloadAllImagesAsZip}
                disabled={loadingZip}
              >
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  {loadingZip ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                      <span className="text-sm font-medium">Download All Images as ZIP</span>
                    </>
                  )}
                </div>
                {!loadingZip && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
              </button>

              {/* Download Without Background ZIP Button */}
              <button
                className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-700 to-violet-700 hover:from-indigo-500 hover:via-purple-600 hover:to-violet-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-indigo-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-indigo-500/30 hover:border-indigo-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                onClick={downloadAllImagesWithoutBackgroundAsZip}
                disabled={loadingZipNoBg}
              >
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  {loadingZipNoBg ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Processing...</span>
                    </>
                  ) : (
                    <>
                      <FileImage className="w-5 h-5 group-hover:scale-105 transition-transform duration-300" />
                      <span className="text-sm font-medium">Download Images Without Background as ZIP</span>
                    </>
                  )}
                </div>
                {!loadingZipNoBg && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
              </button>

              {/* Download All Entries Button */}
              <button
                className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-700 to-red-700 hover:from-amber-500 hover:via-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-amber-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-amber-500/30 hover:border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                onClick={downloadAllEntries}
                disabled={loadingExcel}
              >
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  {loadingExcel ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Preparing Excel...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                      <span className="text-sm font-medium">Download All Entries as Excel</span>
                    </>
                  )}
                </div>
                {!loadingExcel && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                )}
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Choose your preferred download format from the options above
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Code Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600" />
                  Coupon Codes
                </h2>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Add New Coupon Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Add New Coupon
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="text"
                    placeholder="Coupon Name"
                    value={newCoupon.name.toUpperCase()}
                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value.toUpperCase() })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Value"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: Number.parseInt(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <select
                    value={newCoupon.scope}
                    onChange={(e) => setNewCoupon({ ...newCoupon, scope: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="indian">Indian</option>
                    <option value="international">International</option>
                  </select>


                  <button
                    onClick={() => {
                      if (newCoupon.name && newCoupon.value) {
                        setCoupons([...coupons, newCoupon])
                        setNewCoupon({ name: "", type: "fixed", value: 0, scope: "indian" })
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Add Coupon
                  </button>
                </div>
              </div>

              {/* Coupons List - Two Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Indian Coupons - Left Column */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Indian Coupons
                  </h4>
                  <div className="space-y-3">
                    {coupons
                      .filter((coupon) => coupon.scope === "indian")
                      .map((coupon, index) => {
                        const originalIndex = coupons.findIndex(
                          (c) => c.name === coupon.name && c.scope === coupon.scope,
                        )
                        return (
                          <div
                            key={`indian-${index}`}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                          >
                            {
                              editingCoupon === originalIndex ? (
                                <div className="flex items-center gap-4 flex-1">
                                  <input
                                    type="text"
                                    value={coupon.name}
                                    onChange={(e) => {
                                      const updated = [...coupons]
                                      updated[originalIndex].name = e.target.value
                                      setCoupons(updated)
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <select
                                    value={coupon.type}
                                    onChange={(e) => {
                                      const updated = [...coupons]
                                      updated[originalIndex].type = e.target.value
                                      setCoupons(updated)
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="percentage">Percentage</option>
                                  </select>
                                  <input
                                    type="number"
                                    value={coupon.value}
                                    onChange={(e) => {
                                      const updated = [...coupons]
                                      updated[originalIndex].value = Number.parseInt(e.target.value)
                                      setCoupons(updated)
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <select
                                    value={coupon.scope}
                                    onChange={(e) => {
                                      const updated = [...coupons]
                                      updated[originalIndex].scope = e.target.value
                                      setCoupons(updated)
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="indian">Indian</option>
                                    <option value="international">International</option>
                                  </select>
                                  <button
                                    onClick={() => setEditingCoupon(null)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-mono font-semibold">
                                      {coupon.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {coupon.scope === "international"
                                        ? `$${coupon.value}`
                                        : coupon.type === "fixed"
                                          ? `₹${coupon.value}`
                                          : `${coupon.value}%`}{" "}
                                      off
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                                      {coupon.type}
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                      Indian
                                    </span>
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    {couponUsageMap[coupon.name] || 0}
                                  </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* <button
                                    onClick={() => setEditingCoupon(originalIndex)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button> */}
                                    <button
                                      onClick={() => {
                                        const updated = coupons.filter((_, i) => i !== originalIndex)
                                        setCoupons(updated)
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )
                            }
                          </div>
                        )
                      })}
                    {coupons.filter((coupon) => coupon.scope === "indian").length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        No Indian coupon codes added yet
                      </div>
                    )}
                  </div>
                </div>

                {/* International Coupons - Right Column */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    International Coupons
                  </h4>
                  <div className="space-y-3">
                    {coupons
                      .filter((coupon) => coupon.scope === "international")
                      .map((coupon, index) => {
                        const originalIndex = coupons.findIndex(
                          (c) => c.name === coupon.name && c.scope === coupon.scope,
                        )
                        return (
                          <div
                            key={`international-${index}`}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                          >
                            {editingCoupon === originalIndex ? (
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="text"
                                  value={coupon.name}
                                  onChange={(e) => {
                                    const updated = [...coupons]
                                    updated[originalIndex].name = e.target.value
                                    setCoupons(updated)
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <select
                                  value={coupon.type}
                                  onChange={(e) => {
                                    const updated = [...coupons]
                                    updated[originalIndex].type = e.target.value
                                    setCoupons(updated)
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="fixed">Fixed Amount</option>
                                  <option value="percentage">Percentage</option>
                                </select>
                                <input
                                  type="number"
                                  value={coupon.value}
                                  onChange={(e) => {
                                    const updated = [...coupons]
                                    updated[originalIndex].value = Number.parseInt(e.target.value)
                                    setCoupons(updated)
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <select
                                  value={coupon.scope}
                                  onChange={(e) => {
                                    const updated = [...coupons]
                                    updated[originalIndex].scope = e.target.value
                                    setCoupons(updated)
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="indian">Indian</option>
                                  <option value="international">International</option>
                                </select>
                                <button
                                  onClick={() => setEditingCoupon(null)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4">
                                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-mono font-semibold">
                                    {coupon.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {coupon.scope === "indian"
                                      ? `₹${coupon.value}`
                                      : coupon.type === "fixed"
                                        ? `$${coupon.value}`
                                        : `${coupon.value}%`}{" "}
                                    off
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                                    {coupon.type}
                                  </div>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    International
                                  </span>

                                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    {couponUsageMap[coupon.name] || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* <button
                                    onClick={() => setEditingCoupon(originalIndex)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button> */}
                                  <button
                                    onClick={() => {
                                      const updated = coupons.filter((_, i) => i !== originalIndex)
                                      setCoupons(updated)
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })}
                    {coupons.filter((coupon) => coupon.scope === "international").length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        No International coupon codes added yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total Coupons: {coupons.length}
                <span className="ml-4">Indian: {coupons.filter((c) => c.scope === "indian").length}</span>
                <span className="ml-2">International: {coupons.filter((c) => c.scope === "international").length}</span>
              </p>
              <button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DownloadButtons