import { useState } from "react";
import { StatusBadge } from "../common/StatusBadge";

export const FieldCard = ({
  field,
  onUpdate,
  onView,
  onRemove,
  userRole = "admin",
  onUpdateStage,
  onAddObservation,
}) => {
  const [selectedStage, setSelectedStage] = useState("");
  const [observation, setObservation] = useState("");
  const [stageSaving, setStageSaving] = useState(false);
  const [obsSaving, setObsSaving] = useState(false);

  const cropEmojis = {
    wheat:    "🌾",
    corn:     "🌽",
    rice:     "🍚",
    barley:   "🌾",
    soybean:  "🫘",
    maize:    "🌽",
    sunflower:"🌻",
    sorghum:  "🌾",
    default:  "🌱",
  };

  const emoji = cropEmojis[field.cropType?.toLowerCase()] || cropEmojis.default;
  const daysElapsed = Math.floor(
    (Date.now() - new Date(field.plantingDate)) / (1000 * 60 * 60 * 24)
  );

  // Normalise to lowercase so "admin", "ADMIN", "Admin" all work
  const isAgent = userRole?.toLowerCase() === "agent";

  const handleStageUpdate = async () => {
    if (!selectedStage) return;
    setStageSaving(true);
    await onUpdateStage?.(field.id, selectedStage);
    setSelectedStage("");
    setStageSaving(false);
  };

  const handleSaveObservation = async () => {
    if (!observation.trim()) return;
    setObsSaving(true);
    await onAddObservation?.(field.id, observation.trim());
    setObservation("");
    setObsSaving(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-bold text-gray-900">{field.name}</h3>
            <p className="text-sm text-gray-500">{field.cropType}</p>
          </div>
        </div>
        {!isAgent && onRemove && (
          <button
            onClick={() => onRemove(field.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status and Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status:</span>
          <StatusBadge status={field.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Current Stage</p>
            <p className="font-semibold text-gray-900">{field.currentStage}</p>
          </div>
          <div>
            <p className="text-gray-500">Days Elapsed</p>
            <p className="font-semibold text-gray-900">{daysElapsed} days</p>
          </div>
        </div>

        {field.agent && (
          <div>
            <p className="text-sm text-gray-500">Assigned Agent</p>
            <p className="font-semibold text-gray-900">{field.agent}</p>
          </div>
        )}

        {field._count?.observations !== undefined && (
          <div>
            <p className="text-sm text-gray-500">Observations</p>
            <p className="font-semibold text-gray-900">{field._count.observations}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {field.notes && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          📌 {field.notes}
        </div>
      )}

      {/* Agent actions */}
      {isAgent && (
        <div className="mb-4 space-y-3 p-3 bg-blue-50 border border-blue-200 rounded">

          {/* Stage update */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Update Stage
            </label>
            <div className="flex gap-2">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded bg-white"
              >
                <option value="">Select new stage...</option>
                <option value="PLANTED">Planted</option>
                <option value="GROWING">Growing</option>
                <option value="READY">Ready</option>
                <option value="HARVESTED">Harvested</option>
              </select>
              <button
                onClick={handleStageUpdate}
                disabled={!selectedStage || stageSaving}
                className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {stageSaving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>

          {/* Observation */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Add Observation
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Add notes or observations..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
              rows={2}
            />
            <button
              onClick={handleSaveObservation}
              disabled={!observation.trim() || obsSaving}
              className="mt-1 w-full px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {obsSaving ? "Saving…" : "Save Observation"}
            </button>
          </div>
        </div>
      )}

      {/* Admin actions */}
      {!isAgent && (
        <div className="flex gap-2">
          <button
            onClick={() => onView?.(field.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
          >
            View Details
          </button>
          <button
            onClick={() => onUpdate?.(field.id)}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
          >
            Manage
          </button>
        </div>
      )}
    </div>
  );
};