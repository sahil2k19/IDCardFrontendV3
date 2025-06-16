import IdCard from "./IdCard";
import { useState, useEffect } from "react";
const colorOptions = ["white", "black",];

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


const NumberInputWithButtons = ({
  value,
  min,
  max,
  onChange,
  step = 1,
  label
}) => {
  // local copy prevents focus loss on parent re-renders
  const [localValue, setLocalValue] = useState(value);

  // sync when parent-driven value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // fire onChange as you type (real-time), but clamp to [min, max]
  const handleChange = e => {
    const raw = e.target.value;
    setLocalValue(raw);
    const num = Number(raw);
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, num));
      onChange(clamped);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => {
          const next = Math.max(min, value - step);
          onChange(next);
        }}
        className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-full font-bold text-lg"
        aria-label={`Decrease ${label}`}
      >
        –
      </button>

      <input
        type="number"
        value={localValue}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="w-16 text-center border rounded-lg py-1 focus:ring-2 focus:ring-blue-500"
        aria-label={label}
      />

      <button
        type="button"
        onClick={() => {
          const next = Math.min(max, value + step);
          onChange(next);
        }}
        className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-full font-bold text-lg"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
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
        value={elementStyles[element].left}
        onChange={(e) =>
          updateElementStyle(
            element,
            "left",
            Number.parseInt(e.target.value)
          )
        }
        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
      />

      <button
        onClick={() => updateElementStyle(element, "left", "50%")}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
      >
        Center
      </button>

      {/* Size or Font Size */}
      {sizeControl ? (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Size
          </label>
          <NumberInputWithButtons
            value={elementStyles[element].size}
            min={50}
            max={250}
            onChange={val =>
              updateElementStyle(element, "size", val)
            }
            label="Size"
          />
        </>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Font Size
          </label>
          <NumberInputWithButtons
            value={elementStyles[element].fontSize}
            min={8}
            max={40}
            onChange={val =>
              updateElementStyle(element, "fontSize", val)
            }
            label="Font Size"
          />
        </>
      )}
      {colorControl && (
        <>
          <label className="block text-sm font-medium text-gray-700">
            {label} Color
          </label>
          <div className="flex space-x-2 items-center">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => updateElementStyle(element, "color", color)}
                className={`w-8 h-8 rounded-full ${color === "white"
                    ? "bg-white border border-gray-300"
                    : "bg-black"
                  } ${elementStyles[element].color === color ? "ring-2 ring-blue-500" : ""}`}
                aria-label={`Set ${label} color to ${color}`}
              />
            ))}
            {/* Color Picker */}
            <input
              type="color"
              id={`color-picker-${element}`}
              value={elementStyles[element].color && !colorOptions.includes(elementStyles[element].color)
                ? elementStyles[element].color
                : "#ffa500" // fallback default color
              }
              onChange={e => updateElementStyle(element, "color", e.target.value)}
              className="w-8 h-8 border-none p-0 bg-transparent cursor-pointer"
              aria-label={`Pick custom color for ${label}`}
            />
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded"
              onClick={() => document.getElementById(`color-picker-${element}`).click()}>Custom</button>
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
                  {renderStyleControls("qrCode", "QR Code", 0, 580,true )}
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
