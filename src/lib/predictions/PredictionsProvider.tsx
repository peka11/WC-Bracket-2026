"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { UserPredictions, MatchPick } from "@/lib/predictions/types";
import { emptyPredictions } from "@/lib/predictions/types";
import {
  loadPredictions,
  savePredictions,
  decodePredictionsFromShare,
} from "@/lib/predictions/store";
import { encodePredictionsForShare } from "@/lib/predictions/store";
import { getSharePageUrl, getChallengeUrl } from "@/lib/predictions/head-to-head";
import { useAuth } from "@/lib/auth/AuthProvider";

interface PredictionsContextValue {
  picks: UserPredictions;
  setMatchPick: (matchId: string, pick: MatchPick) => void;
  setBracketPick: (matchId: string, winnerId: string) => void;
  setConfidence: (matchId: string, confidence: 1 | 2 | 3) => void;
  setChampion: (teamId: string | null) => void;
  setDisplayName: (name: string) => void;
  save: () => Promise<void>;
  loadFromShare: (encoded: string) => boolean;
  getShareUrl: () => string;
  getChallengeLink: () => string;
  saved: boolean;
  cloudSynced: boolean;
}

const PredictionsContext = createContext<PredictionsContextValue | null>(null);

async function syncToCloud(picks: UserPredictions) {
  try {
    await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...picks, updatedAt: new Date().toISOString() }),
    });
    return true;
  } catch {
    return false;
  }
}

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [picks, setPicks] = useState<UserPredictions>(emptyPredictions);
  const [saved, setSaved] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("bracket");
    if (shared) {
      const decoded = decodePredictionsFromShare(shared);
      if (decoded) {
        setPicks(decoded);
        savePredictions(decoded);
        return;
      }
    }

    async function load() {
      if (user) {
        const res = await fetch("/api/predictions");
        const data = await res.json();
        if (data.picks) {
          setPicks(data.picks as UserPredictions);
          savePredictions(data.picks as UserPredictions);
          setCloudSynced(true);
          return;
        }
      }
      setPicks(loadPredictions());
    }
    load();
  }, [user]);

  const persist = useCallback(
    (next: UserPredictions) => {
      const withTime = { ...next, updatedAt: new Date().toISOString() };
      savePredictions(withTime);
      if (user) syncToCloud(withTime).then(setCloudSynced);
      return withTime;
    },
    [user]
  );

  const setMatchPick = useCallback((matchId: string, pick: MatchPick) => {
    setPicks((prev) => persist({
      ...prev,
      matchPicks: { ...prev.matchPicks, [matchId]: { ...prev.matchPicks[matchId], ...pick } },
    }));
  }, [persist]);

  const setBracketPick = useCallback((matchId: string, winnerId: string) => {
    setPicks((prev) => persist({
      ...prev,
      bracketPicks: { ...prev.bracketPicks, [matchId]: winnerId },
      matchPicks: {
        ...prev.matchPicks,
        [matchId]: { ...prev.matchPicks[matchId], winner: winnerId },
      },
    }));
  }, [persist]);

  const setConfidence = useCallback((matchId: string, confidence: 1 | 2 | 3) => {
    setPicks((prev) => persist({
      ...prev,
      matchPicks: {
        ...prev.matchPicks,
        [matchId]: { ...prev.matchPicks[matchId], confidence },
      },
    }));
  }, [persist]);

  const setChampion = useCallback((teamId: string | null) => {
    setPicks((prev) => persist({ ...prev, champion: teamId }));
  }, [persist]);

  const setDisplayName = useCallback((name: string) => {
    setPicks((prev) => persist({ ...prev, displayName: name }));
  }, [persist]);

  const save = useCallback(async () => {
    const withTime = { ...picks, updatedAt: new Date().toISOString() };
    savePredictions(withTime);
    if (user) await syncToCloud(withTime);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [picks, user]);

  const loadFromShare = useCallback((encoded: string) => {
    const decoded = decodePredictionsFromShare(encoded);
    if (!decoded) return false;
    setPicks(persist(decoded));
    return true;
  }, [persist]);

  const getShareUrl = useCallback(() => {
    const encoded = encodePredictionsForShare(picks);
    return getSharePageUrl(encoded);
  }, [picks]);

  const getChallengeLink = useCallback(() => {
    const encoded = encodePredictionsForShare(picks);
    return getChallengeUrl(encoded);
  }, [picks]);

  return (
    <PredictionsContext.Provider
      value={{
        picks,
        setMatchPick,
        setBracketPick,
        setConfidence,
        setChampion,
        setDisplayName,
        save,
        loadFromShare,
        getShareUrl,
        getChallengeLink,
        saved,
        cloudSynced,
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const ctx = useContext(PredictionsContext);
  if (!ctx) throw new Error("usePredictions must be used within PredictionsProvider");
  return ctx;
}
