export async function sendTagsToBackend(tags, signal) {
  if (!tags || tags.length === 0) return { skipped: true };
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tags/processTags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tags }),
      signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}


