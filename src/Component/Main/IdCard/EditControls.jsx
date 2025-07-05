"use client";

import IdCard from "./IdCard";
import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  RotateCcw,
  Palette,
  Move,
  Type,
  ImageIcon,
  QrCode,
  User,
  Building,
  Hash,
  X,
  Save,
} from "lucide-react";

const colorOptions = ["white", "black"];

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
    label,
  }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
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
          className="group w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-400 hover:to-gray-500 text-white rounded-lg font-bold flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={localValue}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          className="w-16 text-center border-2 border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm font-medium text-gray-800"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => {
            const next = Math.min(max, value + step);
            onChange(next);
          }}
          className="group w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-400 hover:to-gray-500 text-white rounded-lg font-bold flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const getElementIcon = (element) => {
    const iconMap = {
      name: User,
      designation: Building,
      profilePicture: ImageIcon,
      institute: Building,
      participantId: Hash,
      qrCode: QrCode,
    };
    const IconComponent = iconMap[element] || Type;
    return <IconComponent className="w-5 h-5" />;
  };

  const renderStyleControls = (
    element,
    label,
    minValue = 0,
    maxValue = 580,
    sizeControl = false,
    colorControl = false
  ) => (
    <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          {getElementIcon(element)}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{label}</h3>
      </div>

      {/* Y Position Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-semibold text-gray-700">
            Y Position
          </label>
        </div>
        <div className="relative">
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
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        </div>
      </div>

      {/* X Position Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-600 rotate-90" />
            <label className="text-sm font-semibold text-gray-700">
              X Position
            </label>
          </div>
          <button
            onClick={() => updateElementStyle(element, "left", "50%")}
            className="group flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Center</span>
          </button>
        </div>
        <div className="relative">
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
            className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        </div>
      </div>

      {/* Size or Font Size Control */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-semibold text-gray-700">
            {sizeControl ? `${label} Size` : `${label} Font Size`}
          </label>
        </div>
        <NumberInputWithButtons
          value={
            sizeControl
              ? elementStyles[element].size
              : elementStyles[element].fontSize
          }
          min={sizeControl ? 50 : 8}
          max={sizeControl ? 250 : 40}
          onChange={(val) =>
            updateElementStyle(element, sizeControl ? "size" : "fontSize", val)
          }
          label={sizeControl ? "Size" : "Font Size"}
        />
      </div>

      {/* Color Control */}
      {colorControl && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">
              {label} Color
            </label>
          </div>
          <div className="flex space-x-3 items-center">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => updateElementStyle(element, "color", color)}
                className={`w-10 h-10 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 ${
                  color === "white"
                    ? "bg-white border-2 border-gray-300"
                    : "bg-black border-2 border-gray-700"
                } ${
                  elementStyles[element].color === color
                    ? "ring-4 ring-blue-500 ring-offset-2"
                    : ""
                }`}
                aria-label={`Set ${label} color to ${color}`}
              />
            ))}

            {/* Custom Color Picker */}
            <div className="relative inline-block">
              <input
                type="color"
                id={`color-picker-${element}`}
                value={
                  elementStyles[element].color &&
                  !colorOptions.includes(elementStyles[element].color)
                    ? elementStyles[element].color
                    : "#ffa500"
                }
                onChange={(e) =>
                  updateElementStyle(element, "color", e.target.value)
                }
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label={`Pick custom color for ${label}`}
              />

              <button
                type="button"
                className="w-28 group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">Custom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const [scale, setScale] = useState(0.5);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-gray-50 to-slate-100 rounded-3xl w-[1200px] h-[95vh] flex shadow-2xl border border-gray-200/50 overflow-hidden">
        <div className="w-full p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  ID Card Designer
                </h2>
                <p className="text-gray-600 text-sm">
                  Customize your ID card elements
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-8 h-[calc(100%-200px)]">
            {/* Controls Panel */}
            <div className="w-1/2 overflow-y-auto custom-scrollbar pr-4">
              <div className="grid grid-cols-1 gap-6">
                {renderStyleControls("name", "Name", 0, 580, false, true)}
                {renderStyleControls(
                  "designation",
                  "Designation",
                  0,
                  580,
                  false,
                  true
                )}
                {renderStyleControls(
                  "profilePicture",
                  "Profile Picture",
                  0,
                  580,
                  true
                )}
                {renderStyleControls(
                  "institute",
                  "Institute",
                  0,
                  580,
                  false,
                  true
                )}
                {renderStyleControls(
                  "participantId",
                  "Participant ID",
                  0,
                  580,
                  false,
                  true
                )}
                {renderStyleControls("qrCode", "QR Code", 0, 580, true)}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 flex flex-col justify-center items-center gap-4 bg-gradient-to-br from-gray-100 to-slate-200 rounded-2xl p-4 shadow-inner overflow-hidden">
              {/* Scale Buttons */}

              {/* Card Preview */}
              <div
                className="transform shadow-2xl rounded-2xl max-w-full  bg-white origin-center transition-transform duration-300"
                style={{ transform: `scale(${scale})` }}
              >
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
            <div className="flex flex-col gap-4 mb-2">
              <button
                onClick={() => setScale(0.4)}
                className="bg-gradient-to-br px-2  from-blue-600 to-purple-700 rounded py-1 font-bold text-white"
              >
                50%
              </button>
              <button
                onClick={() => setScale(0.67)}
                className="bg-gradient-to-br px-2 from-blue-600 to-purple-700 rounded py-1 font-bold text-white"
              >
                75%
              </button>
              <button
                onClick={() => setScale(1)}
                className="bg-gradient-to-br px-2 from-blue-600 to-purple-700 rounded py-1 font-bold text-white"
              >
                100%
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={toggleModalOpenedit}
              className="group relative overflow-hidden bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-400 hover:to-slate-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>

            <button
              onClick={() => {
                saveDesignSettings();
                toggleModalOpenedit();
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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
          background: rgba(229, 231, 235, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default EditControls;
