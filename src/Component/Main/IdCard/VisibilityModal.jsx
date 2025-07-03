"use client";

const VisibilityModal = ({
  globalVisibility,
  toggleGlobalVisibility,
  saveDesignSettings,
  toggleModalOpen,
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
    <div className="bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200/50 overflow-hidden max-h-[80vh] flex flex-col">
      {/* Sleek Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 px-6 py-5">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-400/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <span>Visibility Settings</span>
          </h2>
          <p className="text-white/90 mt-1 text-sm">Toggle field visibility</p>
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 left-8 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
          <div className="absolute top-6 right-12 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-3 left-16 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse delay-700"></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-4">
          {Object.entries(globalVisibility).map(([key, value], index) => (
            <div key={key} className="group">
              <div className="relative bg-gradient-to-r from-white via-gray-50 to-slate-50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-gray-300/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 shadow-sm">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        value
                          ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25"
                          : "bg-gradient-to-br from-gray-300 to-slate-400"
                      } transition-all duration-300`}
                    >
                      <span className="text-white font-bold text-sm uppercase">
                        {key.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <p className="text-gray-500 text-xs">
                        {value ? "Currently visible" : "Currently hidden"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Sexy Toggle Switch */}
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => toggleGlobalVisibility(key)}
                        className="sr-only"
                        id={`toggle-${key}`}
                      />
                      <label
                        htmlFor={`toggle-${key}`}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                          value
                            ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                            : "bg-gradient-to-r from-gray-300 to-slate-300 shadow-inner"
                        }`}
                      >
                        <span
                          className={`inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
                            value ? "translate-x-6" : "translate-x-1"
                          } ${
                            value
                              ? "shadow-emerald-200/50"
                              : "shadow-gray-400/50"
                          }`}
                        />
                        {/* Inner glow */}
                        <div
                          className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                            value
                              ? "bg-gradient-to-r from-emerald-400/20 to-green-500/20"
                              : "bg-gray-400/10"
                          }`}
                        ></div>
                      </label>
                    </div>

                    {/* Status Indicator */}
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        value
                          ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleek Footer */}
      <div className="bg-gradient-to-r from-gray-50/90 via-white/90 to-slate-50/90 backdrop-blur-sm px-6 py-4 border-t border-gray-200/50">
        <div className="flex justify-end gap-3">
          {/* Cancel Button */}
          <button
            onClick={toggleModalOpen}
            className="group relative overflow-hidden bg-gradient-to-r from-gray-200 to-slate-300 hover:from-gray-300 hover:to-slate-400 text-gray-700 font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-gray-400/20 transform hover:scale-105 transition-all duration-300 ease-out border border-gray-300/50 hover:border-gray-400/70"
          >
            <div className="flex items-center space-x-2 relative z-10">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm">Cancel</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>

          {/* Save Button */}
          <button
            onClick={() => {
              saveDesignSettings();
              toggleModalOpen();
            }}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 ease-out"
          >
            <div className="flex items-center space-x-2 relative z-10">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm">Save Changes</span>
            </div>
            <div className="absolute inset-0   opacity-0 group-hover:opacity-100  transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>
    </div>

    {/* Custom Scrollbar Styles for Light Mode */}
    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(229, 231, 235, 0.5);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #3b82f6);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #9333ea, #2563eb);
      }
    `}</style>
  </div>
);

export default VisibilityModal;
