import React, { useState, useCallback } from "react";
import { TagInputPanel } from "./TagInputPanel"; // ensure this path matches your structure

export default function TagInputs() {
  const [panels, setPanels] = useState([]); // [{id,name,value}]

  const addPanel = useCallback(() => {
    setPanels(prev => [
      ...prev,
      {
        id: (crypto?.randomUUID?.() || Date.now().toString()) + "-" + (prev.length + 1),
        name: `Tag Input ${prev.length + 1}`,
        value: ""
      }
    ]);                                                              
  }, []);

  const updatePanel = (id, field, val) =>
    setPanels(prev => prev.map(p => (p.id === id ? { ...p, [field]: val } : p)));

  const removePanel = (id) =>
    setPanels(prev => prev.filter(p => p.id !== id));

  const empty = panels.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h1 className="text-xl font-semibold">Tag Inputs</h1>
        <div className="flex items-center gap-3">
          {!empty && (
            <button
              onClick={() => setPanels([])}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Clear All
            </button>
          )}
          <button
            onClick={addPanel}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 h-10 rounded-md shadow-sm"
          >
            <i className="fa-solid fa-plus" />
            {empty ? "Create Tag Input" : "Create Another Tag Input"}
          </button>
        </div>
      </div>

      {/* Body */}
      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-40 mb-6 opacity-90">
            <svg viewBox="0 0 200 140" width="160" height="120" role="presentation">
              <rect x="20" y="30" width="60" height="40" rx="6" fill="#e0ecff" />
              <rect x="50" y="70" width="60" height="40" rx="6" fill="#d4e7ff" />
              <rect x="100" y="40" width="70" height="50" rx="8" fill="#bfdbfe" />
              <circle cx="140" cy="65" r="14" fill="#2563eb" opacity="0.9" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3">No Tag Inputs Yet</h2>
          <p className="text-sm text-slate-600 max-w-sm">
            Click the “Create Tag Input” button in the top right to add your first sender / domain pattern.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-5">
          {panels.map((p, idx) => (
            <TagInputPanel
              key={p.id}
              index={idx + 1}
              name={p.name}
              value={p.value}
              onNameChange={(val) => updatePanel(p.id, "name", val)}
              onValueChange={(val) => updatePanel(p.id, "value", val)}
              onRemove={() => removePanel(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}