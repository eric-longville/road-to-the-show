import { useCallback, useState } from "react";

const STORAGE_KEY = "rtts:scouting-report";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set(); // SSR: no storage
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function write(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // private mode / storage disabled — favorites simply don't persist.
  }
}

/**
 * A per-viewer "Scouting Report" of favorited player ids, backed by
 * localStorage. Every read/write is guarded so a blocked-storage browser still
 * renders correctly (favorites just won't persist).
 *
 * State hydrates via a lazy initializer: SSR sees an empty set, the client
 * reads storage on first render. Favorites aren't rendered at page load (the
 * drawer is closed), so there's no hydration mismatch.
 */
export function useScoutingReport() {
  const [ids, setIds] = useState<Set<string>>(read);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      write(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  return { favorites: ids, isFavorite, toggle };
}
