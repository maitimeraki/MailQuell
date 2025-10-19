// ...existing code...
import React, { useEffect, useState } from "react";

export default function ActivityFeed({ limit = 20 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   let mounted = true;
  //   async function load() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/activity`);
  //       if (limit) url.searchParams.set("limit", String(limit));
  //       const res = await fetch(url.toString(), { credentials: "include" });
  //       if (!res.ok) throw new Error("Failed to load activity");
  //       const data = await res.json();
  //       if (mounted) setItems(Array.isArray(data) ? data : []);
  //     } catch (e) {
  //       if (mounted) setError(e.message);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   }
  //   load();
  //   return () => (mounted = false);
  // }, [limit]);

  return (
    <div style={{ padding: 12, background: "#fff", border: "1px solid #eee", borderRadius: 8 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>Activity Feed</h3>
      {loading && <div style={{ color: "#666" }}>Loading…</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!loading && items.length === 0 && <div style={{ color: "#666" }}>No activity yet.</div>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it._id} style={{ padding: 10, borderBottom: "1px solid #f1f1f1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 13 }}>
                <strong style={{ color: "#222" }}>{it.type || "event"}</strong>
                <div style={{ color: "#666", fontSize: 12 }}>{it.message}</div>
                {it.meta && <div style={{ color: "#777", fontSize: 11, marginTop: 6 }}>{JSON.stringify(it.meta)}</div>}
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <div style={{ fontSize: 12, color: "#666" }}>{it.actor || it.workspaceId || "system"}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{new Date(it.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
// ...existing code...