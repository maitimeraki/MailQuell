import React, { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch"; // add this import
export function UserDropdown({ profile, open, onClose, onSignOut }) {
  const ref = useRef(null);
  const [watching, setWatching] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
  async function toggleWatch(next) {
    setWatching(next);
    if(!next) return ;
    setLoadingWatch(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/watch-gmail`,          
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ watching: next }),
        }
      );
      if (!res.ok) throw new Error("failed");                       
    } catch (e) {
      console.error("Failed to toggle watch:", e);
      setWatching(!next); // revert on failure
    }finally{
      setLoadingWatch(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const baseItem = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "10px 16px",
    textDecoration: "none",
    fontSize: 14,
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const itemStyle = {
    ...baseItem,
    color: "#222",
  };

  const itemStyleBtn = {
    ...baseItem,
    color: "#222",
  };
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "56px",
        right: "16px",
        width: 240,
        background: "#fff",
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "12px 0",
        fontFamily: "system-ui, sans-serif",
        zIndex: 50,
      }}
    >
      <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{profile?.name}</div>
        <div style={{ fontSize: 12, color: "#555", wordBreak: "break-all" }}>
          {profile?.email}
        </div>
      </div>
      <nav
        style={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <a href="/profile" style={itemStyle}>
          <i className="fa-solid fa-user" /> <span>Profile</span>
        </a>
        {/* Gmail Watch Toggle */}
        <div
          style={{
            ...itemStyle,
            cursor: "default",
            justifyContent: "space-between",
            paddingRight: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i
              className={
                "fa-solid " +
                (watching
                  ? "fa-bolt text-blue-600"
                  : "fa-bolt-lightning text-slate-400")
              }
              style={{ minWidth: 16 }}
            />
            <span style={{ fontSize: 13 }}>
              {watching ? "Watching Gmail" : "Watch Gmail"}
            </span>
          </div>
          <Switch
            // disabled={loadingWatch}
            checked={watching}
            onCheckedChange={toggleWatch}
          />
        </div>
        <button
          type="button"
          style={itemStyleBtn}
          onClick={() => console.log("Settings clicked")}
        >
          <i className="fa-solid fa-gear" /> <span>Settings</span>
        </button>
        <button
          type="button"
          style={{ ...itemStyleBtn, color: "#b42318" }}
          onClick={onSignOut}
        >
          <i className="fa-solid fa-right-from-bracket" /> <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
