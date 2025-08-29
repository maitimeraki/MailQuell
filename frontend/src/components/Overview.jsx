import React from "react";
export default function Overview() {
  return (
    <div style={wrap}>
      <h1>Overview</h1>
      <p>High-level KPIs (placeholder). Fetch 24h / 30d / 90d / YTD stats, queue status, top tags, recent alerts.</p>
    </div>
  );
}
const wrap = { padding: 28, display: "flex", flexDirection: "column", gap: 16 };