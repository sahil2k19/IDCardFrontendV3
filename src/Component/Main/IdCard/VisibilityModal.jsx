const VisibilityModal = ({
  globalVisibility,
  toggleGlobalVisibility,
  saveDesignSettings,
  toggleModalOpen,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Edit All ID Cards Visibility</h2>
      <div className="space-y-4">
        {Object.entries(globalVisibility).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="capitalize">{key}</span>
            <div className="flex items-center">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleGlobalVisibility(key)}
                />
                <span className="slider round"></span>
              </label>
              <span className="ml-2 text-sm">{value ? "Show" : "Hide"}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4">
        <button
          onClick={toggleModalOpen}
          className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
        <button
          onClick={() => {
            saveDesignSettings();
            toggleModalOpen();
          }}
          className="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
        >
          Save Changes
        </button>
      </div>
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
        }
        input:checked + .slider {
          background-color: #2196f3;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  </div>
);

export default VisibilityModal;
