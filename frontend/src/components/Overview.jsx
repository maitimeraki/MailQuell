import { useEffect, useMemo, useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useProcessedMailStats } from "../hooks/useProcessedMailStats";

export default function Overview() {
  const { profile, loading: profileLoading } = useProfile();
  const createdBy = profile?.email || profile?.sub;
  const { stats, loading, error } = useProcessedMailStats(createdBy);

  const [mails, setMails] = useState([]);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailError, setMailError] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    if (!createdBy) return;

    let cancelled = false;
    const ctrl = new AbortController();

    async function loadMails() {
      setMailLoading(true);
      setMailError("");
      try {
        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/processed/mail-activity`);
        url.searchParams.set("limit", "200");
        url.searchParams.set("createdBy", String(createdBy));

        const res = await fetch(url.toString(), {
          credentials: "include",
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(`Failed to load processed mails (${res.status})`);
        const data = await res.json();

        if (!cancelled) {
          const arr = Array.isArray(data) ? data : [];
          const sorted = arr.sort(
            (a, b) =>
              new Date(b.createdAt || b.processAt || 0).getTime() -
              new Date(a.createdAt || a.processAt || 0).getTime()
          );
          setMails(sorted);
        }
      } catch (e) {
        if (!cancelled && e.name !== "AbortError") {
          setMailError(e.message || "Failed to load processed mails");
        }
      } finally {
        if (!cancelled) setMailLoading(false);
      }
    }

    loadMails();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [createdBy]);

  const patternRanking = useMemo(() => {
    if (!stats?.topPatterns?.length) return [];
    const max = Math.max(...stats.topPatterns.map((x) => x.count || 0), 1);
    return stats.topPatterns.map((x, i) => ({
      rank: i + 1,
      pattern: x._id || "Unknown pattern",
      count: x.count || 0,
      pct: Math.round(((x.count || 0) / max) * 100),
    }));
  }, [stats]);

  const pages = Math.max(1, Math.ceil(mails.length / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return mails.slice(start, start + perPage);
  }, [mails, page]);

  if (profileLoading) return <div style={center}>Loading profile...</div>;
  if (!profile) return <div style={center}>Please login to view overview.</div>;

  return (
    <div style={wrap}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>Overview</h1>
          <div style={subheader}>Mail processing analytics and content snapshots</div>
        </div>
      </header>

      {loading && <div style={muted}>Loading analytics...</div>}
      {error && <div style={danger}>{error}</div>}

      {!!stats && (
        <section style={grid4}>
          <MetricCard title="Total Processed" value={stats.total} tone="#0f766e" />
          <MetricCard title="Last 7 Days" value={stats.last7} tone="#2563eb" />
          <MetricCard title="Last 30 Days" value={stats.last30} tone="#7c3aed" />
          <MetricCard title="Last 90 Days" value={stats.last90} tone="#b45309" />
        </section>
      )}

      <section style={twoCol}>
        <Panel title="Processed Mail Snapshots">
          {mailLoading && <div style={muted}>Loading processed mails...</div>}
          {mailError && <div style={danger}>{mailError}</div>}

          {!mailLoading && !mailError && pageItems.length === 0 && (
            <div style={muted}>No processed mails found.</div>
          )}

          {pageItems.map((m, idx) => {
            const rawText =
              m.subject ||
              m.message ||
              (m.meta ? JSON.stringify(m.meta) : "") ||
              "No content available";

            const preview = firstWords(rawText, 100);

            return (
              <div key={m._id || m.gmailMessageId || idx} style={mailCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>{m.senderEmail || "Unknown sender"}</div>
                  <div style={tiny}>
                    {new Date(m.createdAt || m.processAt || Date.now()).toLocaleString()}
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                  {preview}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <div style={tiny}>
              {mails.length} mails • page {page}/{pages}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={pagerBtn}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              <button
                style={pagerBtn}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
              >
                Next
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Top Matching Patterns">
          {patternRanking.length === 0 ? (
            <div style={muted}>No pattern data yet.</div>
          ) : (
            patternRanking.map((row) => (
              <RankRow
                key={`${row.pattern}-${row.rank}`}
                label={row.pattern}
                rank={row.rank}
                count={row.count}
                pct={row.pct}
              />
            ))
          )}
        </Panel>
      </section>
    </div>
  );
}

function firstWords(text, n) {
  const words = String(text).trim().split(/\s+/);
  if (words.length <= n) return text;
  return `${words.slice(0, n).join(" ")}...`;
}

function MetricCard({ title, value, tone }) {
  return (
    <div style={metricCard}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: tone }}>{value}</div>
    </div>
  );
}

function RankRow({ label, rank, count, pct }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontWeight: 600 }}>
          #{rank} {label}
        </div>
        <div style={{ color: "#475569", fontSize: 13 }}>{count} mails</div>
      </div>
      <div style={barBg}>
        <div style={{ ...barFill, width: `${Math.max(5, pct)}%` }} />
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

const wrap = { padding: 24, maxWidth: 1200, margin: "0 auto" };
const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};
const subheader = { color: "#6b7280", fontSize: 13, marginTop: 6 };
const grid4 = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 16,
};
const twoCol = { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 };
const metricCard = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
};
const panel = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
};
const mailCard = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
  background: "#fcfdff",
};
const barBg = {
  width: "100%",
  height: 8,
  borderRadius: 999,
  background: "#e2e8f0",
  marginTop: 6,
};
const barFill = {
  height: 8,
  borderRadius: 999,
  background: "linear-gradient(90deg, #2563eb, #06b6d4)",
};
const pagerBtn = {
  padding: "6px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};
const tiny = { color: "#64748b", fontSize: 12 };
const muted = { color: "#64748b" };
const danger = { color: "#dc2626", marginBottom: 12 };
const center = { display: "grid", placeItems: "center", minHeight: "50vh" };