// ...existing code...
import React, { useEffect, useState } from "react";

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagesCount, setPagesCount] = useState(0);
  const [inputsCount, setInputsCount] = useState(0);
  const [topPatterns, setTopPatterns] = useState([]);
  const [watchInfo, setWatchInfo] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const base = `${import.meta.env.VITE_BACKEND_URL}/api`;

        // Fire requests in parallel; backend should use session or accept createdBy query
        const [pagesRes, inputsRes, statusRes, matchesRes] = await Promise.allSettled([
          fetch(`${base}/tag-pages`, { credentials: "include" }),
          fetch(`${base}/tag-inputs`, { credentials: "include" }),
          fetch(`${base}/integration/status`, { credentials: "include" }),
          // optional endpoint for recent matches; if not present it will fail gracefully
          fetch(`${base}/email-matches?limit=6`, { credentials: "include" }),
        ]);

        // tag-pages
        if (pagesRes.status === "fulfilled" && pagesRes.value.ok) {
          const pages = await pagesRes.value.json();
          if (mounted) setPagesCount(Array.isArray(pages) ? pages.length : 0);
        } else {
          if (pagesRes.status === "fulfilled" && pagesRes.value) {
            // non-ok response
            // ignore, backend may require createdBy; leave zero
          }
        }

        // tag-inputs
        let inputsList = [];
        if (inputsRes.status === "fulfilled" && inputsRes.value.ok) {
          const inputs = await inputsRes.value.json();
          inputsList = Array.isArray(inputs) ? inputs : [];
          if (mounted) setInputsCount(inputsList.length);
        }

        // compute top patterns
        if (inputsList.length) {
          const freq = inputsList.reduce((acc, it) => {
            const key = (it.patternRaw || "").trim();
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {});
          const top = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pattern, count]) => ({ pattern, count }));
          if (mounted) setTopPatterns(top);
        }

        // integration/status
        if (statusRes.status === "fulfilled" && statusRes.value.ok) {
          const js = await statusRes.value.json();
          if (mounted && js.ok && js.status) setWatchInfo(js.status);
        }

        // recent matches (optional)
        if (matchesRes.status === "fulfilled" && matchesRes.value.ok) {
          const jm = await matchesRes.value.json();
          if (mounted) setRecentMatches(Array.isArray(jm) ? jm.slice(0, 6) : []);
        }
      } catch (e) {
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={wrap}>
      <h1>Overview</h1>

      <div style={grid}>
        <Card title="Tag pages" value={loading ? "…" : pagesCount} />
        <Card title="Tag inputs" value={loading ? "…" : inputsCount} />
        <Card
          title="Watching Gmail"
          value={
            watchInfo
              ? watchInfo.watching
                ? "ON"
                : "OFF"
              : loading
              ? "…"
              : "unknown"
          }
          meta={
            watchInfo && watchInfo.watch
              ? `lastSync: ${
                  watchInfo.lastSyncAt ? new Date(watchInfo.lastSyncAt).toLocaleString() : "—"
                }`
              : undefined
          }
        />
        <Card
          title="Queue / Processing"
          value={watchInfo?.syncStatus || (loading ? "…" : "idle")}
          meta={watchInfo?.lastSyncAt ? new Date(watchInfo.lastSyncAt).toLocaleString() : undefined}
        />
      </div>

      <section style={{ marginTop: 18, width: "100%" }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Top patterns</h3>
        {topPatterns.length === 0 ? (
          <div style={hint}>{loading ? "Loading…" : "No patterns yet"}</div>
        ) : (
          <ol>
            {topPatterns.map((t) => (
              <li key={t.pattern} style={{ marginBottom: 6 }}>
                <strong>{t.pattern}</strong> <span style={{ color: "#666" }}>— {t.count}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section style={{ marginTop: 18, width: "100%" }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Recent matches</h3>
        {recentMatches.length === 0 ? (
          <div style={hint}>{loading ? "Loading…" : "No recent matches"}</div>
        ) : (
          <ul>
            {recentMatches.map((m) => (
              <li key={m._id || m.gmailMessageId} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13 }}>
                  <strong>{m.senderEmail || "unknown sender"}</strong>{" "}
                  <span style={{ color: "#666", fontSize: 12 }}>
                    • {m.matchedTagInput?.length || m.matchDetails?.length || 0} matches
                  </span>
                </div>
                <div style={{ color: "#666", fontSize: 12 }}>
                  {m.receivedAt ? new Date(m.receivedAt).toLocaleString() : m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <div style={{ color: "red", marginTop: 12 }}>Error: {error}</div>}
    </div>
  );
}

function Card({ title, value, meta }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      {meta && <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{meta}</div>}
    </div>
  );
}

const wrap = { padding: 28, display: "flex", flexDirection: "column", gap: 16, maxWidth: 980 };
const grid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 };
const card = {
  padding: 12,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #eee",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minHeight: 72,
  justifyContent: "center",
};
const hint = { color: "#666", fontSize: 13 };
// ...existing code...