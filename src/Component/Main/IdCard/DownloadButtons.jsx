"use client"

import { Edit, Eye, Download, FileImage, FileSpreadsheet, Loader2 } from 'lucide-react'

const DownloadButtons = ({
  loading,
  downloadAllImagesAsZip,
  downloadAllImagesWithoutBackgroundAsZip,
  downloadAllEntries,
  toggleModalOpenedit,
  toggleModalOpen,
}) => (
  <div className="w-full max-w-6xl mx-auto p-6 relative">
    {/* Professional background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 rounded-2xl opacity-40"></div>

    <div className="relative grid h-[60px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Edit All ID Cards Button */}
      <button
        className="group h-full relative overflow-hidden bg-gradient-to-r from-slate-700 via-slate-800 to-gray-800 hover:from-slate-600 hover:via-slate-700 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-slate-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-slate-600/30 hover:border-slate-500/50"
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

      {/* Download All as ZIP Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-500 hover:via-green-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-emerald-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-emerald-500/30 hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
        onClick={downloadAllImagesAsZip}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2 relative z-10">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
              <span className="text-sm font-medium">Download All as ZIP</span>
            </>
          )}
        </div>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}
      </button>

      {/* Download Without Background ZIP Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-700 to-violet-700 hover:from-indigo-500 hover:via-purple-600 hover:to-violet-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-indigo-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-indigo-500/30 hover:border-indigo-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
        onClick={downloadAllImagesWithoutBackgroundAsZip}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2 relative z-10">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </>
          ) : (
            <>
              <FileImage className="w-5 h-5 group-hover:scale-105 transition-transform duration-300" />
              <span className="text-sm font-medium whitespace-nowrap">Download Without BG ZIP</span>
            </>
          )}
        </div>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}
      </button>

      {/* Download All Entries Button */}
      <button
        className="group relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-700 to-red-700 hover:from-amber-500 hover:via-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-amber-500/20 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border border-amber-500/30 hover:border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
        onClick={downloadAllEntries}
        disabled={loading}
      >
        <div className="flex items-center justify-center space-x-2 relative z-10">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Preparing Excel...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
              <span className="text-sm font-medium text-nowrap">Download All Entries</span>
            </>
          )}
        </div>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        )}
      </button>
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
  </div>
)

export default DownloadButtons
