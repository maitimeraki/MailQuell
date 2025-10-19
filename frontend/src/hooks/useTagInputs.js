import { useCallback, useEffect, useRef, useState } from "react";

export function useTagInputs({ createdBy, panelId, autoReload = true }) {
  const [items, setItems] = useState([]); // { _id?, patternRaw, pending?, error? }
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  let listUrl = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/tag-inputs`);

  const load = useCallback(async () => {
    if (!createdBy) return;
    setLoading(true);
    setError(null);
    try {
      listUrl.searchParams.set("createdBy", createdBy);
      // listUrl=listUrl.searchParams.set("tagsPageId", panelId);
      const res = await fetch(listUrl.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Load failed");
      const data = await res.json();
      // Expect each item has patternRaw
      setItems(
        data.map(d => ({
          id: d._id,
          tagsPageId: d.tagsPageId || null,
          patternRaw: d.patternRaw,
          pending: false,
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [createdBy, panelId]);

  useEffect(() => {
    if (autoReload) load();
  }, [autoReload, load]);
  // Create single tag
  
  
  const createTag = useCallback(
    (patternRaw) => {
      if (!patternRaw) return;
      const trimmed = patternRaw.trim();
      if (!trimmed) return;
      if (!createdBy) return;

      // Optimistic add
      const temp = {
        id: "__temp_" + Math.random().toString(36).slice(2),
        tagsPageId: panelId,
        patternRaw: trimmed,
        pending: true,
      };
      setItems(prev => [...prev, temp]);

      (async () => {
        setSyncing(true);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/create-tag-inputs`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                createdBy,
                patternRaw: trimmed,
                tagsPageId: panelId,
                
              })
            }
          );
          if (res.status === 409) {
            // Duplicate -> remove optimistic
            setItems(prev => prev.filter(i => i.id !== temp.id));
            return;
          }
          if (!res.ok) throw new Error("Create failed");
          const doc = await res.json();
          setItems(prev =>
            prev.map(i =>
              i.id === temp.id
                ? {
                  id: doc._id,
                  patternRaw: doc.patternRaw,
                  pending: false,
                  tagsPageId: doc.tagsPageId,
                }
                : i
            )
          );
        } catch (e) {
          console.error("Create tag input error:", e);
          setItems(prev =>
            prev.map(i =>
              i.id === temp.id ? { ...i, pending: false, error: e.message } : i
            )
          );
        } finally {
          setSyncing(false);
        }
      })();
    },
    [panelId, createdBy]
  );

  // Remove by value or id
  const removeTag = useCallback(
    (panelId,patternRaw) => {
      const target = items.find(
        t =>
          t.patternRaw === patternRaw &&
          (panelId ? t.tagsPageId === panelId : true)
      );
      if (!target) return;

      // Optimistic removal
      setItems(prev => prev.filter(i => i.patternRaw !== target.patternRaw));


      (async () => {
        setSyncing(true);
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/remove-tag-inputs/${(target.id)}`,
            {
              method: "DELETE",
              credentials: "include"
            }
          );
          if (!res.ok) {
            // rollback
            setItems(prev => [...prev, target]);
          }
        } catch {
          setItems(prev => [...prev, target]);
        } finally {
          setSyncing(false);
        }
      })();
    },
    [items, panelId]
  );

  const clearAll = useCallback(() => {                  
    const existing = items.filter(i => i.id && !i._id.startsWith("__temp_"));
    setItems([]);
    (async () => {
      for (const t of existing) {
        try {
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/clearall-tag-inputs/${t.id}`,
            { method: "DELETE", credentials: "include" }
          );
        } catch {
          // ignore
        }
      }
    })();
  }, [items]);

  return {
    items,
    loading,
    error,
    syncing,
    createTag,
    removeTag,
    clearAll,
    reload: load
  };
}