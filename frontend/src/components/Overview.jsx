
import React, { useEffect, useState, useMemo, useRef } from "react";


export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inputsList, setInputsList] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [watchInfo, setWatchInfo] = useState(null);
  const [range, setRange] = useState("30d");
  const [limit, setLimit] = useState(6);
  const [tagFilter, setTagFilter] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const tooltipRef = useRef();

  useEffect(() => {
    let mounted = true;
    const ctrl = new AbortController();
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        // const base = import.meta.env.VITE_BACKEND_URL;
        // const [inputsRes, matchesRes, statusRes] = await Promise.all([
        //   fetch(`${base}/api/tag-inputs`, { credentials: "include", signal: ctrl.signal }),
        //   fetch(`${base}/api/email-matches?limit=500`, { credentials: "include", signal: ctrl.signal }),
        //   fetch(`${base}/status`, { credentials: "include", signal: ctrl.signal }),
        // ]);

        if (inputsRes.ok) {
          const data = await inputsRes.json();
          if (mounted) setInputsList(Array.isArray(data) ? data : []);
        }

        if (matchesRes.ok) {
          const data = await matchesRes.json();
          if (mounted) setRecentMatches(Array.isArray(data) ? data : []);
        }

        if (statusRes.ok) {
          const js = await statusRes.json();
          if (mounted && js.ok) setWatchInfo(js.status);
        }
      } catch (e) {
        if (mounted && e.name !== "AbortError") setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;

      ctrl.abort();
    };
  }, [refreshKey]);

  // Top patterns by number of inputs (simple metric)
  const topPatterns = useMemo(() => {
    const freq = {};
    for (const it of inputsList) {
      const key = (it.patternRaw || it.pattern || "").trim() || (it.title || "").trim();
      if (!key) continue;
      freq[key] = (freq[key] || 0) + 1;
    }
    return Object.entries(freq)
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [inputsList]);

  // time window
  const timeWindowMs = useMemo(() => {
    if (range === "7d") return 7 * 24 * 60 * 60 * 1000;
    if (range === "90d") return 90 * 24 * 60 * 60 * 1000;
    return 30 * 24 * 60 * 60 * 1000;
  }, [range]);

  // build day-series for recent matches
  const series = useMemo(() => {
    const now = Date.now();
    const days = Math.max(1, Math.ceil(timeWindowMs / (24 * 60 * 60 * 1000)));
    const buckets = new Array(days).fill(0);
    const labels = new Array(days).fill(0).map((_, i) => {
      const ts = now - (days - 1 - i) * 24 * 60 * 60 * 1000;
      return new Date(ts).toISOString().slice(0, 10);
    });
    for (const m of recentMatches) {
      const t = new Date(m.receivedAt || m.createdAt || Date.now()).getTime();
      if (!t || t < now - timeWindowMs) continue;
      const dayIndex = Math.floor((t - (now - timeWindowMs)) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < days) buckets[dayIndex] += 1;
    }
    return labels.map((d, i) => ({ day: d, count: buckets[i] }));
  }, [recentMatches, timeWindowMs]);

  // clicking a top pattern filters recentMatches
  const filteredMatches = useMemo(() => {
    if (!tagFilter) return recentMatches;
    return recentMatches.filter(m => {
      const arr = m.matchedTagInput || m.matchDetails || [];
      return arr.some(x => {
        const p = (x.patternRaw || x.pattern || x.title || "").trim();
        return p && p === tagFilter;
      });
    });
  }, [recentMatches, tagFilter]);

  // small sparkline component
  function Sparkline({ data, height = 60 }) {
    const max = Math.max(...data.map(d => d.count), 1);
    const w = Math.max(180, data.length * 6);
    const points = data.map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * w;
      const y = height - (d.count / max) * (height - 8) - 4;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
        {data.map((d, i) => {
          const x = (i / Math.max(1, data.length - 1)) * w;
          const y = height - (d.count / max) * (height - 8) - 4;
          return <circle key={d.day} cx={x} cy={y} r={2} fill="#0369a1" />;
        })}
      </svg>
    );
  }

  function onTagClick(pattern) {
    setTagFilter(prev => (prev === pattern ? null : pattern));
    // small scroll to recent mails section
    document.getElementById("recent-mails")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={wrap}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>Overview</h1>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Quick insight into processed mails and top tags</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={range} onChange={e => setRange(e.target.value)} style={select}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
          <button onClick={() => setRefreshKey(k => k + 1)} style={button}>Refresh</button>
        </div>
      </header>

      <section style={statsGrid}>
        <StatCard title="Total tag inputs" value={inputsList.length} hint="Number of configured tag rules" />
        <StatCard title="Recent matches" value={recentMatches.length} hint="Matches in workspace" />
        <StatCard title="Watch" value={watchInfo ? (watchInfo.watching ? "ON" : "OFF") : (loading ? "…" : "unknown")} hint={watchInfo?.lastSyncAt ? `last: ${new Date(watchInfo.lastSyncAt).toLocaleString()}` : "—"} />
        <StatCard title="Processing" value={watchInfo?.syncStatus || (loading ? "…" : "idle")} hint="Sync status" />
      </section>

      <section style={{ display: "flex", gap: 16, marginTop: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Panel title="Processed mails (timeline)">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Sparkline data={series} height={72} />
              </div>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Total in window</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{series.reduce((s, x) => s + x.count, 0)}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{range} · {loading ? "…" : `${filteredMatches.length} shown`}</div>
              </div>
            </div>
          </Panel>

          <Panel title="Top tag patterns" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                {topPatterns.map(t => (
                  <button
                    key={t.pattern}
                    onClick={() => onTagClick(t.pattern)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "10px 12px",
                      border: tagFilter === t.pattern ? "1px solid #3b82f6" : "1px solid #eee",
                      borderRadius: 8,
                      background: tagFilter === t.pattern ? "#eef2ff" : "#fff",
                      marginBottom: 8,
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      const ttip = tooltipRef.current;
                      if (!ttip) return;
                      ttip.style.display = "block";
                      ttip.style.left = `${e.clientX + 8}px`;
                      ttip.style.top = `${e.clientY + 8}px`;
                      ttip.innerText = `Rules: ${t.count}`;
                    }}
                    onMouseLeave={() => {
                      const ttip = tooltipRef.current;
                      if (ttip) ttip.style.display = "none";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.pattern}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>matched rules: {t.count}</div>
                    </div>
                    <div style={{ color: "#374151", fontWeight: 700 }}>{t.count}</div>
                  </button>
                ))}
              </div>
              <div style={{ width: 260 }}>
                <small style={{ color: "#6b7280" }}>Matches over time</small>
                <div style={{ marginTop: 8 }}>
                  <Sparkline data={series} height={80} />
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <aside style={{ width: 380 }}>
          <Panel title="Recent processed mails" id="recent-mails" style={{ paddingBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))} style={select}>
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
              <button onClick={() => { setTagFilter(null); setRefreshKey(k => k + 1); }} style={button}>Reset</button>
            </div>

            <div style={{ maxHeight: 420, overflow: "auto", borderTop: "1px solid #f3f4f6" }}>
              {(filteredMatches.length === 0) && <div style={{ padding: 12, color: "#6b7280" }}>{loading ? "Loading…" : "No matches"}</div>}
              {filteredMatches.slice(0, limit).map(m => (
                <div key={m._id || m.gmailMessageId} style={{ padding: 12, borderBottom: "1px solid #f8fafc", display: "flex", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0369a1" }}>
                    {String((m.senderName || m.senderEmail || "U").charAt(0)).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 700 }}>{m.senderName || m.senderEmail || "Unknown"}</div>
                      <div style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(m.receivedAt || m.createdAt || Date.now()).toLocaleString()}</div>
                    </div>
                    <div style={{ color: "#374151", fontSize: 13, marginTop: 6 }}>{m.subject || <i style={{ color: "#9ca3af" }}>no subject</i>}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(m.matchedTagInput || m.matchDetails || []).slice(0, 3).map((t, i) => (
                        <span key={i} style={{ background: "#f1f5f9", color: "#0f172a", padding: "4px 8px", borderRadius: 999, fontSize: 12 }}>{(t.patternRaw || t.pattern || t.title || "tag").slice(0, 28)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </section>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      <div ref={tooltipRef} style={{ position: "fixed", display: "none", background: "#0f172a", color: "#fff", padding: "6px 8px", borderRadius: 6, fontSize: 12, zIndex: 60 }} />
    </div>
  );
}

function StatCard({ title, value, hint }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eef2ff" }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Panel({ title, children, id, style }) {
  return (
    <div id={id} style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #e6eefc", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <div style={{ color: "#9ca3af", fontSize: 12 }}>interactive</div>
      </div>
      {children}
    </div>
  );
}

const wrap = { padding: 24, maxWidth: 1200, margin: "0 auto" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 };
const select = { padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb" };
const button = { padding: "8px 10px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" };

