import React, { useState, useCallback } from "react";
import { TagInputPanel } from "./TagInputPanel"; // ensure this path matches your structure
import { useProfile } from "../hooks/useProfile";
import { useEffect } from "react";
export default function TagInputs() {
  const [panels, setPanels] = useState([]); // [{id,name,value}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { profile } = useProfile();
  const createdBy = profile?.sub;
  // const hasCb = Boolean(createdBy);

  //load panels form backend if createdBy changes
  useEffect(() => {
    // if (!hasCb) return;
    const loadPanels = async () => {
      if (panels.length !== 0) return;
      if (!createdBy) return;
      setLoading(true);
      setError(null);
      try {
        const url = new URL(
          `${import.meta.env.VITE_BACKEND_URL}/api/tag-pages`
        );
        url.searchParams.set("createdBy", createdBy);
        const res = await fetch(url.toString(), { credentials: "include" });

        if (!res.ok) throw new Error("Faild to load panels!");
        const data = await res.json();
        console.log("Type of the data:", typeof data);

        if (Array.isArray(data)) {
          setPanels(
            data
              .sort((a, b) => a.order - b.order)
              .map((d) => ({
                id: d._id,
                name: d.name,
                createdBy: d.createdBy,
                tagInputIds: Array.isArray(d.tagInputIds) ? d.tagInputIds : [],
              }))
          );
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadPanels();
  }, [createdBy,panels.length]);
  
  const addPanel = useCallback(async () => {
    const localId = crypto.randomUUID?.() || Date.now().toString();
    const newPanel = { id: localId, name: `Tag Input${panels.length + 1}` };
    setPanels((prev) => [...prev, newPanel]);
    // if (!hasCb) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-tag-page`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newPanel.name,
            order: panels.length + 1,
            createdBy, // can be null
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create panel on backend");
      const doc = await res.json();
      if (!doc._id) throw new Error("Invalid response from server");
      setPanels((prev) =>
        prev.map((p) => (p.id === localId ? { ...p, id: doc._id } : p))
      );
    } catch (e) {
      setError(e.message);
      console.error("Failed to create panel on backend:", e);
      //keep local only
    }
  }, [panels.length, createdBy]);

  const updatePanel = async (id, name) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    // if (!hasCb) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-tag-page/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (!res.ok) throw new Error("Failed to update panel on backend");
    } catch (e) {
      setError(e.message);
    }
  };

  const removePanel = async (id) => {
    const removed = panels.find((p) => p.id === id);
    setPanels((prev) => prev.filter((p) => p.id !== id));
    // if (!hasCb) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/remove-tag-page/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to delete panel on backend");
    } catch (e) {
      setPanels((prev) => [...prev, removed]);
      setError(e.message);
    }
  };

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
            <svg
              viewBox="0 0 200 140"
              width="160"
              height="120"
              role="presentation"
            >
              <rect
                x="20"
                y="30"
                width="60"
                height="40"
                rx="6"
                fill="#e0ecff"
              />
              <rect
                x="50"
                y="70"
                width="60"
                height="40"
                rx="6"
                fill="#d4e7ff"
              />
              <rect
                x="100"
                y="40"
                width="70"
                height="50"
                rx="8"
                fill="#bfdbfe"
              />
              <circle cx="140" cy="65" r="14" fill="#2563eb" opacity="0.9" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3">No Tag Inputs Yet</h2>
          <p className="text-sm text-slate-600 max-w-sm">
            Click the “Create Tag Input” button in the top right to add your
            first sender / domain pattern.
          </p>
        </div>                                          
      ) : (
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-5">
          {panels.map((p, idx) => (
            <TagInputPanel
              key={p.id}
              index={idx + 1}                                  
              name={p.name}
              createdBy={createdBy}
              panelId={p.id}
              // tagInputIds={p.tagInputIds}
              onNameChange={(name) => updatePanel(p.id, name)}
              onRemove={() => removePanel(p.id)}
            />
          ))}
          {error && <div className="text-red-600">{error}</div>}
        </div>
      )}
    </div>
  );
}