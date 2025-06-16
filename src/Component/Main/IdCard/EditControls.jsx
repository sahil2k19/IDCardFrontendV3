import IdCard from "./IdCard";

const colorOptions = ["white", "black", "orange"];

const EditControls = ({
  previewCard,
  elementStyles,
  setElementStyles,
  setPreviewCard,
  globalVisibility,
  saveDesignSettings,
  toggleModalOpenedit,
  reversedData,
  fetchData,
  isLoading,
  fetchDesignations,
  eventId,
  checkedInParticipants,
  handleCheckin,
}) => {
  const updateElementStyle = (element, property, value) => {
    setElementStyles((prev) => ({
      ...prev,
      [element]: { ...prev[element], [property]: value },
    }));
    if (previewCard) setPreviewCard({ ...previewCard });
  };

  const renderStyleControls = (
    element,
    label,
    minValue = 0,
    maxValue = 580,
    sizeControl = false,
    colorControl = false
  ) => (
    <div className="space-y-4 bg-gray-200 p-2 rounded-lg">
        <h2 className="text-lg font-bold underline">{label}</h2>
      <label className="block text-sm font-medium text-gray-700">
        Y Position
      </label>
      <input
        type="range"
        min={minValue}
        max={maxValue}
        value={elementStyles[element].top || elementStyles[element].bottom}
        onChange={(e) =>
          updateElementStyle(
            element,
            element === "name" ? "top" : "bottom",
            Number.parseInt(e.target.value)
          )
        }
        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
      />

      {/* X Position */}
      <label className="block text-sm font-medium text-gray-700 mt-2">
        {label} X Position
      </label>
      <input
        type="range"
        min={minValue}
        max={maxValue}
        value={elementStyles[element].left }
        onChange={(e) =>
          updateElementStyle(
            element,
            "left",
            Number.parseInt(e.target.value)
          )
        }
        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
      />
      {sizeControl && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Size
          </label>
          <input
            type="range"
            min={50}
            max={250}
            value={elementStyles[element].size}
            onChange={(e) =>
              updateElementStyle(
                element,
                "size",
                Number.parseInt(e.target.value)
              )
            }
            className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
          />
        </>
      )}
      {!sizeControl && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Font Size
          </label>
          <input
            type="range"
            min={8}
            max={40}
            value={elementStyles[element].fontSize}
            onChange={(e) =>
              updateElementStyle(
                element,
                "fontSize",
                Number.parseInt(e.target.value)
              )
            }
            className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
          />
        </>
      )}
      {colorControl && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Color
          </label>
          <div className="flex space-x-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => updateElementStyle(element, "color", color)}
                className={`w-8 h-8 rounded-full ${color === "white"
                    ? "bg-white border border-gray-300"
                    : color === "black"
                      ? "bg-black"
                      : "bg-orange-500"
                  } ${elementStyles[element].color === color
                    ? "ring-2 ring-blue-500"
                    : ""
                  }`}
                aria-label={`Set ${label} color to ${color}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[1200px] h-[95vh] flex">
        <div className="w-full pr-4">
          <h2 className="text-xl font-bold mb-4">Edit ID Card Elements</h2>
          <div className="flex">
            <div className="h-[70vh] w-1/2 px-2 overflow-y-auto">
              <div className="grid grid-cols-2 gap-10">
                <div className="col-span-1 space-y-10">
                  {renderStyleControls("name", "Name", 0, 580, false, true)}
                  {renderStyleControls("designation", "Designation", 0, 580, false, true)}
                  {renderStyleControls("profilePicture", "Profile Picture", 0, 580, true)}
                </div>
                <div className="col-span-1 space-y-10">
                  {renderStyleControls("institute", "Institute", 0, 580, false, true)}
                  {renderStyleControls("participantId", "Participant ID", 0, 580, false, true)}
                  {renderStyleControls("qrCode", "QR Code", 0, 580)}
                </div>
              </div>
            </div>
            <div className=" h-[70vh] pl-4 flex justify-center w-1/2 items-center overflow-auto">
              {previewCard && (
                <IdCard
                  card={previewCard}
                  index={0}
                  fetchData={fetchData}
                  isLoading={isLoading}
                  fetchDesignations={fetchDesignations}
                  elementStyles={elementStyles}
                  eventId={eventId}
                  reversedData={reversedData}
                  globalVisibility={globalVisibility}
                  isPreview={true}
                  checkedInParticipants={checkedInParticipants}
                  handleCheckin={handleCheckin}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-6 mt-6 items-center">
            <button
              onClick={toggleModalOpenedit}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
            <button
              onClick={() => {
                saveDesignSettings();
                toggleModalOpenedit();
              }}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditControls;
