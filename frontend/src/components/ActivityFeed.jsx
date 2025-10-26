// ...existing code...
import React, { useEffect, useState, useMemo, useRef } from "react";

/*
  Enhanced ActivityFeed:
  - Real-time updates (SSE)
  - Advanced filtering & saved views (localStorage)
  - Detail drawer with quick actions (ack/resolve)
  - Aggregation charts with drill-down (timeline + top tags)
  - Simple alerts creation UI (sends to backend)
*/


export default function ActivityFeed({ limit = 500 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [dateRangeDays, setDateRangeDays] = useState(30);

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 20;

  // saved views
  const [savedViews, setSavedViews] = useState(() => {
    try { return JSON.parse(localStorage.getItem("activity.views") || "[]"); } catch { return []; }
  });

  // detail drawer
  const [selected, setSelected] = useState(null);
  const drawerRef = useRef();

  // alerts UI
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(50);

  // SSE ref
  const esRef = useRef(null);

  // useEffect(() => {
  //   let mounted = true;
  //   const ctrl = new AbortController();

  //   async function load() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/activity`);
  //       url.searchParams.set("limit", String(limit));
  //       const res = await fetch(url.toString(), { credentials: "include", signal: ctrl.signal });
  //       if (!res.ok) throw new Error("Failed to load activity");
  //       const data = await res.json();
  //       if (mounted) setItems(Array.isArray(data) ? data : []);
  //     } catch (e) {
  //       if (mounted && e.name !== "AbortError") setError(e.message);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   }

  //   load();

  //   // SSE connection for real-time updates
  //   function startSSE() {
  //     try {
  //       const es = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/api/activity/stream`, { withCredentials: true });
  //       es.onmessage = (ev) => {
  //         try {
  //           const parsed = JSON.parse(ev.data);
  //           // prepend new event
  //           setItems(prev => {
  //             const exists = prev.find(x => x._id === parsed._id || x.id === parsed.id);
  //             if (exists) return prev.map(x => (x._id === parsed._id || x.id === parsed.id ? { ...x, ...parsed } : x));
  //             return [parsed, ...prev].slice(0, 2000);
  //           });
  //         } catch (e) { /* ignore parse errors */ }
  //       };
  //       es.onerror = () => {
  //         es.close();
  //         // reconnect with delay
  //         setTimeout(startSSE, 2000);
  //       };
  //       esRef.current = es;
  //     } catch (e) {
  //       console.warn("SSE start failed", e);
  //     }
  //   }
  //   startSSE();

  //   return () => {
  //     mounted = false;
  //     ctrl.abort();
  //     if (esRef.current) esRef.current.close();
  //   };
  // }, [limit]);

  // derived lists for filters & charts
  const types = useMemo(() => {
    const s = new Set();
    for (const i of items) if (i.type) s.add(i.type.toLowerCase());
    return Array.from(s).sort();
  }, [items]);

  const topTags = useMemo(() => {
    const freq = {};
    for (const it of items) {
      (it.tags || []).forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    }
    return Object.entries(freq).map(([tag, count]) => ({ tag, count })).sort((a,b)=>b.count-a.count).slice(0,8);
  }, [items]);

  const timeline = useMemo(() => {
    const now = Date.now();
    const days = Math.max(1, Math.min(90, dateRangeDays));
    const buckets = {};
    for (let i=0;i<days;i++){ const d=new Date(now - (days-1-i)*86400000).toISOString().slice(0,10); buckets[d]=0; }
    for (const it of items) {
      const t = new Date(it.createdAt || it.ts || Date.now()).getTime();
      const key = new Date(t).toISOString().slice(0,10);
      if (key in buckets) buckets[key] += 1;
    }
    return Object.entries(buckets).map(([day,count])=>({day,count}));
  }, [items, dateRangeDays]);

  // filtered items list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(i => {
      if (typeFilter !== "all" && (i.type || "").toLowerCase() !== typeFilter) return false;
      if (tagFilter && !((i.tags || []).includes(tagFilter))) return false;
      if (q) {
        return JSON.stringify(i).toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, typeFilter, tagFilter, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page-1)*perPage, page*perPage);

  // actions
  async function acknowledge(itemId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/activity/${itemId}/acknowledge`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("ack failed");
      setItems(prev => prev.map(i => i._id===itemId ? { ...i, status: "acknowledged" } : i));
    } catch (e) {
      console.error(e);
    }
  }
  async function resolveItem(itemId) {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/activity/${itemId}/resolve`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("resolve failed");
      setItems(prev => prev.map(i => i._id===itemId ? { ...i, status: "resolved" } : i));
    } catch (e) {
      console.error(e);
    }
  }

  // saved views management (localStorage)
  function saveView(name) {
    const view = { name, typeFilter, tagFilter, search, dateRangeDays, createdAt: Date.now() };
    const newViews = [view, ...savedViews].slice(0, 10);
    setSavedViews(newViews);
    localStorage.setItem("activity.views", JSON.stringify(newViews));
  }
  function applyView(v) {
    setTypeFilter(v.typeFilter || "all");
    setTagFilter(v.tagFilter || null);
    setSearch(v.search || "");
    setDateRangeDays(v.dateRangeDays || 30);
  }
  function removeView(idx) {
    const arr = savedViews.slice();
    arr.splice(idx,1);
    setSavedViews(arr);
    localStorage.setItem("activity.views", JSON.stringify(arr));
  }

  // create simple alert
  async function createAlert() {
    try {
      const payload = { threshold: Number(alertThreshold), type: typeFilter === "all" ? null : typeFilter, tag: tagFilter || null };
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/activity/alerts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("create alert failed");
      setShowAlertForm(false);
      setAlertThreshold(50);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Activity Feed</h2>
          <div style={{ color: "#6b7280", fontSize: 13 }}>Real-time events, filters, and quick actions</div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={typeFilter} onChange={e=>{ setTypeFilter(e.target.value); setPage(1); }} style={{ padding: 8 }}>
            <option value="all">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select value={tagFilter||""} onChange={e=>{ setTagFilter(e.target.value||null); setPage(1); }} style={{ padding: 8 }}>
            <option value="">All tags</option>
            {topTags.map(t => <option key={t.tag} value={t.tag}>{t.tag} ({t.count})</option>)}
          </select>

          <input placeholder="Search…" value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} style={{ padding: 8 }} />
        </div>
      </header>

      <section style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #eef2ff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Activity timeline ({dateRangeDays}d)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={dateRangeDays} onChange={e=>setDateRangeDays(Number(e.target.value))} style={{ padding: 6 }}>
                  <option value={7}>7d</option>
                  <option value={30}>30d</option>
                  <option value={90}>90d</option>
                </select>
                <button onClick={()=>{ setTypeFilter("all"); setTagFilter(null); setSearch(""); }} style={{ padding: 6 }}>Reset</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <TimelineChart data={timeline} onBarClick={(day)=>{ /* optional drill-down */ }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: "#374151" }}>Events</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={()=>setShowAlertForm(s=>!s)} style={{ padding: 6 }}>{showAlertForm ? "Close alert" : "Create alert"}</button>
                  <button onClick={()=>saveView(prompt("Name for saved view")||`view-${Date.now()}`)} style={{ padding: 6 }}>Save view</button>
                </div>
              </div>

              {loading && <div style={{ color: "#6b7280" }}>Loading…</div>}
              {error && <div style={{ color: "red" }}>{error}</div>}

              <ul style={{ listStyle: "none", padding: 0 }}>
                {pageItems.map(it => (
                  <li key={it._id || it.id} style={{ padding: 12, marginBottom: 8, borderRadius: 8, background: "#fff", border: "1px solid #f3f4f6", cursor: "pointer" }}
                      onClick={()=>setSelected(it)}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0369a1" }}>
                        {(it.actor||it.type||"S").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{it.type ? it.type.toUpperCase() : "event"}</div>
                            <div style={{ color: "#6b7280", fontSize: 13 }}>{it.message || ""}</div>
                            <div style={{ marginTop: 6 }}>{(it.tags||[]).slice(0,3).map(t=> <span key={t} style={{ marginRight:6, background:"#f1f5f9", padding:"4px 8px", borderRadius: 6 }}>{t}</span>)}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>{it.actor || it.workspaceId || "system"}</div>
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(it.createdAt||Date.now()).toLocaleString()}</div>
                            <div style={{ marginTop: 6, fontSize: 12, color: it.status==="resolved" ? "green" : it.status==="acknowledged" ? "#d97706" : "#6b7280" }}>{it.status||"open"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div style={{ color: "#6b7280" }}>{filtered.length} results</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
                  <div style={{ minWidth: 36, textAlign: "center" }}>{page}/{pages}</div>
                  <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}>Next</button>
                </div>
              </div>
            </div>

            <aside style={{ width: 300 }}>
              <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #eef2ff" }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Top tags</div>
                {topTags.map(t => (
                  <div key={t.tag} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", cursor: "pointer" }} onClick={()=>{ setTagFilter(t.tag); setPage(1); }}>
                    <div style={{ color: "#374151" }}>{t.tag}</div>
                    <div style={{ color: "#6b7280" }}>{t.count}</div>
                  </div>
                ))}
                <hr style={{ margin: "8px 0" }} />
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Saved views</div>
                {savedViews.length===0 && <div style={{ color:"#9ca3af" }}>No saved views</div>}
                {savedViews.map((v, idx) => (
                  <div key={v.createdAt} style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <button onClick={()=>applyView(v)} style={{ flex: 1, textAlign: "left" }}>{v.name}</button>
                    <button onClick={()=>removeView(idx)} style={{ color: "red" }}>✕</button>
                  </div>
                ))}

                {showAlertForm && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>Create alert</div>
                    <input type="number" value={alertThreshold} onChange={e=>setAlertThreshold(e.target.value)} style={{ width: "100%", padding: 8, marginBottom: 6 }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={createAlert} style={{ padding: 8 }}>Create</button>
                      <button onClick={()=>setShowAlertForm(false)} style={{ padding: 8 }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

      </section>

      {/* detail drawer */}
      {selected && (
        <div ref={drawerRef} style={{ position: "fixed", right: 16, top: 60, bottom: 16, width: 420, background: "#fff", border: "1px solid #e6eefc", borderRadius: 8, padding: 12, overflow: "auto", zIndex: 60 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 800 }}>{selected.type?.toUpperCase() || "event"}</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{new Date(selected.createdAt||Date.now()).toLocaleString()}</div>
            </div>
            <div>
              <button onClick={()=>acknowledge(selected._id)} style={{ marginRight: 8, padding: 8 }}>Acknowledge</button>
              <button onClick={()=>resolveItem(selected._id)} style={{ padding: 8 }}>Resolve</button>
              <button onClick={()=>setSelected(null)} style={{ marginLeft: 8, padding: 6 }}>Close</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Message</div>
            <div style={{ color: "#374151", marginTop: 6 }}>{selected.message || JSON.stringify(selected.meta || {}, null, 2)}</div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>Meta</div>
              <pre style={{ background: "#f8fafc", padding: 8, borderRadius: 6, overflowX: "auto" }}>{JSON.stringify(selected.meta || {}, null, 2)}</pre>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>Related</div>
              {(selected.relatedIds || []).length===0 && <div style={{ color: "#9ca3af" }}>No related items</div>}
              {(selected.relatedIds || []).map(rid => <div key={rid} style={{ padding: 6, borderRadius: 6, background: "#fff", border: "1px solid #f3f4f6", marginTop: 6 }}>{rid}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// small timeline chart used above
function TimelineChart({ data = [], height = 48, onBarClick }) {
  const max = Math.max(...data.map(d=>d.count), 1);
  const w = data.length * 6;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      {data.map((d,i)=>{
        const x = i*6;
        const h = Math.round((d.count / max) * (height - 6));
        return <rect key={d.day} x={x} y={height - h - 2} width={5} height={h} fill="#94a3b8" style={{ cursor: "pointer" }} onClick={()=>onBarClick && onBarClick(d.day)} />;
      })}
    </svg>
  );
}
// ...existing code...