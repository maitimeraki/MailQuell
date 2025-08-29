import { useEffect, useState, useCallback } from 'react';

export function useProfile(apiBase = `${import.meta.env.VITE_BACKEND_URL}`) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile data...");
      const res = await fetch(`${apiBase}/details/profile`, { credentials: "include" });
      if (!res.ok) throw new Error(`Status ${res.status}`);       
      const data = await res.json();
      console.log("Fetch data:", data); // Debug log
      setProfile(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => { load(); }, [load]);

  return { profile, loading, error, reload: load };
}