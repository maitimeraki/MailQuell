// ActivityFeed.jsx
// Subject + sender shown in cards
// Full details (including body) shown only on click drawer

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useProcessedMailStats } from "../hooks/useProcessedMailStats";

const statusColors = {
  processed: "#22c55e",
  failed: "#ef4444",
  queued: "#f59e42",
  pending: "#fbbf24",
  default: "#64748b"
};

export default function ActivityFeed({ limit = 500 }) {
  const { profile } = useProfile();
  const createdBy = profile?.email || profile?.sub;
  const { stats } = useProcessedMailStats(createdBy);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!createdBy) return;

    let cancelled = false;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        const url = new URL(`${import.meta.env.VITE_BACKEND_URL}/processed/mail-activity`);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("createdBy", String(createdBy));

        const res = await fetch(url.toString(), {
          credentials: "include",
          signal: ctrl.signal
        });

        if (!res.ok) throw new Error(`Failed to load activity (${res.status})`);
        const data = await res.json();

        if (!cancelled) {
          const normalized = (Array.isArray(data) ? data : []).map((it) => ({
            ...it,
            status: (it.status || "processed").toLowerCase()
          }));
          setItems(normalized);
        }
      } catch (e) {
        if (!cancelled && e.name !== "AbortError") {
          setError(e.message || "Failed to load activity");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [limit, createdBy]);

  const statuses = useMemo(() => {
    const s = new Set(items.map((i) => i.status).filter(Boolean));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter !== "all" && i.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [
        i.subject,
        i.senderEmail,
        i.senderDomain,
        i.message
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, statusFilter, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>

      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <SummaryItem label="Processed Total" value={stats.total} />
          <SummaryItem label="7D" value={stats.last7} />
          <SummaryItem label="30D" value={stats.last30} />
          <SummaryItem label="90D" value={stats.last90} />
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-slate-300 rounded-lg px-3 py-2"
        >
          <option value="all">All status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          className="md:col-span-2 border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Search by subject or sender..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading && <div className="text-slate-500">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <ul className="space-y-3">
        {pageItems.map((it, idx) => (
          <li
            key={it._id || idx}
            onClick={() => setSelected(it)}
            className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={it.status} />
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(it.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>

            <div className="font-semibold text-slate-900 line-clamp-1">
              {it.subject?.trim() || "(No subject)"}
            </div>

            <div className="text-sm text-slate-600 mt-1 line-clamp-1">
              {it.senderEmail || "Unknown sender"}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <div className="text-slate-500">{filtered.length} results</div>
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>{page}/{pages}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <DetailDrawer item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "processed").toLowerCase();
  const color = statusColors[s] || statusColors.default;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: `${color}1f`, color, border: `1px solid ${color}` }}
    >
      {s.toUpperCase()}
    </span>
  );
}

function DetailDrawer({ item, onClose }) {
  return (
    <div className="fixed right-4 top-16 bottom-4 w-[430px] bg-white border border-slate-200 rounded-xl shadow-lg p-5 z-50 overflow-auto">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">
          {item.subject?.trim() || "(No subject)"}
        </h3>
        <button
          className="text-slate-400 hover:text-slate-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="text-sm text-slate-500 mt-1">
        {new Date(item.createdAt || Date.now()).toLocaleString()}
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Sender" value={item.senderEmail || "Unknown"} />
        <Field label="Domain" value={item.senderDomain || "-"} />
        <Field label="Consumer" value={item.consumer || "-"} />
        <Field label="Message" value={item.message || "-"} />
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">Body</div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
          {item.body || "No body content"}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">Meta</div>
        <pre className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs overflow-x-auto">
          {JSON.stringify(item.meta || {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  );
}