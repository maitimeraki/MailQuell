import { useCallback, useEffect, useRef, useState } from 'react';
import { sendTagsToBackend } from '@/utils/sendTagsToBackend';

const LS_KEY = 'tags';

export function useTags(autoSync = true, debounceMs = 600) {
  const [tags, setTags] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  });
   
  const [syncState, setSyncState] = useState('idle'); // idle | syncing | error | ok
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const timerRef = useRef(null);

  const persist = useCallback(next => {                             
    setTags(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }, []);

  const addTags = useCallback(raw => {
    const incoming = Array.isArray(raw) ? raw : [raw];
    const cleaned = incoming
      .map(t => t.trim())
      .filter(Boolean);
    if (cleaned.length === 0) return;
    persist(Array.from(new Set([...tags, ...cleaned])));
  }, [tags, persist]);

  const removeTag = useCallback(tag => {
    persist(tags.filter(t => t !== tag));
  }, [tags, persist]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const flush = useCallback(async () => {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    setSyncState('syncing');
    setError(null);
    const result = await sendTagsToBackend(tags, controllerRef.current.signal);
    if (!result.ok) {
      setSyncState('error');
      setError(result.error);
    } else {
      setSyncState('ok');
    }
    return result;
  }, [tags]);

  // Debounced auto sync
  useEffect(() => {
    if (!autoSync) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tags.length === 0) {
      setSyncState('idle');
      return;
    }
    timerRef.current = setTimeout(() => {
      flush();
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [tags, autoSync, debounceMs, flush]);

  return {
    tags,
    addTags,
    removeTag,
    clear,
    flush,
    syncState,
    error
  };
}