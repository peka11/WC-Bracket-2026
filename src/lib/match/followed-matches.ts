"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wc-followed-matches";

export function useFollowedMatches() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFollowed(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFollowed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
  }, []);

  const toggleFollow = useCallback(
    (matchId: string) => {
      const next = new Set(followed);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      persist(next);
    },
    [followed, persist]
  );

  const isFollowed = useCallback((matchId: string) => followed.has(matchId), [followed]);

  return { followed, toggleFollow, isFollowed };
}
