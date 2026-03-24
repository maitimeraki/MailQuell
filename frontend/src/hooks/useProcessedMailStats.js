import { useEffect, useState } from "react";

export function useProcessedMailStats(createdBy) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!createdBy) {
      setStats(null);
      return;
    }

    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/processed/processed-mail-stats?createdBy=${createdBy}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);

        const data = await res.json();
        if (!cancelled) {
          setStats({
            total: data?.total || 0,
            last7: data?.last7 || 0,
            last30: data?.last30 || 0,
            last90: data?.last90 || 0,
            tagInputStats: Array.isArray(data?.tagInputStats) ? data.tagInputStats : [],
            topPatterns: Array.isArray(data?.topPatterns) ? data.topPatterns : [],
          });
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [createdBy]);

  return { stats, loading, error };
}