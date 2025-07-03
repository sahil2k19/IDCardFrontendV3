"use client"

import { Edit, Eye, Download, FileImage, FileSpreadsheet, Loader2 } from "lucide-react"

const DownloadButtons = ({
  loading,
  downloadAllImagesAsZip,
  downloadAllImagesWithoutBackgroundAsZip,
  downloadAllEntries,
  toggleModalOpenedit,
  toggleModalOpen,
}) => (
  <div className="w-full max-w-6xl mx-auto p-6">
    <div className="grid h-[50px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Edit All ID Cards Button */}
      <button
        className="group h-full relative overflow-hidden bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border border-gray-700 hover:border-gray-500"
        onClick={toggleModalOpenedit}
      >
        <div className="flex items-center justify-center space-x-2">
          <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-sm font-medium">Edit All ID Cards</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Show & Hide Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border border-gray-600 hover:border-gray-400"
        onClick={toggleModalOpen}
      >
        <div className="flex items-center justify-center space-x-2">
          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-medium">Show & Hide</span>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {/* Download All as ZIP Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-white text-gray-900 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={downloadAllImagesAsZip}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Wait...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
              <span className="text-sm font-medium">Download All as ZIP</span>
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      </button>

      {/* Download Without Background ZIP Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-gray-100 to-white hover:from-white hover:to-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={downloadAllImagesWithoutBackgroundAsZip}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Wait...</span>
            </>
          ) : (
            <>
              <FileImage className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium whitespace-nowrap">Download Without BG ZIP</span>
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      </button>

      {/* Download All Entries Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out border border-gray-700 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={downloadAllEntries}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Preparing Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
              <span className="text-sm font-medium text-nowrap">Download All Entries</span>
            </>
          )}
        </div>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>
    </div>

    {/* Optional: Add a subtle background pattern */}
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900"></div>
    </div>
  </div>
)

export default DownloadButtons
