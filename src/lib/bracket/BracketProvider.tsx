"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Team, Match, BracketSlot } from "@/lib/types";
import {
  TEAMS_2026,
  buildInitialMatches,
  buildInitialSlots,
  getTeamMap,
} from "@/lib/data/tournament";
import { advanceWinner, ensureInnerSlots, getActiveTeamIds } from "@/lib/bracket/advance";
import { TOURNAMENT_ID } from "@/lib/data/tournament";

interface BracketState {
  teams: Team[];
  activeTeams: Team[];
  teamMap: Record<string, Team>;
  matches: Match[];
  slots: BracketSlot[];
  championId: string | null;
  lastUpdate: string | null;
  focusedSector: number | null;
  selectedMatch: Match | null;
  selectedTeamId: string | null;
  isSyncing: boolean;
  realtimeConnected: boolean;
}

interface BracketContextValue extends BracketState {
  selectWinner: (matchId: string, winnerId: string) => void;
  refresh: () => Promise<void>;
  setFocusedSector: (sector: number | null) => void;
  openTeam: (teamId: string, matchId?: string) => void;
  closeDrawer: () => void;
}

const BracketContext = createContext<BracketContextValue | null>(null);

const POLL_MS = 30_000;

function applyPayload(
  data: { matches?: Match[]; slots?: BracketSlot[]; syncedAt?: string },
  setMatches: (m: Match[]) => void,
  setSlots: (s: BracketSlot[]) => void,
  setLastUpdate: (t: string) => void
) {
  if (Array.isArray(data.matches) && data.matches.length > 0) {
    setMatches(data.matches);
  }
  if (Array.isArray(data.slots) && data.slots.length > 0) {
    setSlots(ensureInnerSlots(data.slots));
  }
  setLastUpdate(data.syncedAt ?? new Date().toISOString());
}

export function BracketProvider({ children }: { children: ReactNode }) {
  const [teams] = useState(TEAMS_2026);
  const [teamMap] = useState(getTeamMap(TEAMS_2026));
  const [matches, setMatches] = useState<Match[]>(buildInitialMatches);
  const [slots, setSlots] = useState<BracketSlot[]>(() => ensureInnerSlots(buildInitialSlots()));
  const [championId, setChampionId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [focusedSector, setFocusedSector] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTeams = useMemo(() => {
    const ids = getActiveTeamIds(slots);
    for (const m of matches) {
      if (m.status === "finished" && m.winnerTeamId) {
        if (m.homeTeamId !== m.winnerTeamId) ids.delete(m.homeTeamId);
        if (m.awayTeamId !== m.winnerTeamId) ids.delete(m.awayTeamId);
      }
    }
    return teams.filter((t) => ids.has(t.id));
  }, [teams, slots, matches]);

  const refresh = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/bracket", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      applyPayload(data, setMatches, setSlots, setLastUpdate);
    } catch {
      /* keep demo data on network failure */
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    let cleanup: (() => void) | undefined;

    import("@/lib/supabase/client").then(({ createClient, isSupabaseConfigured }) => {
      const supabase = createClient();
      if (supabase && isSupabaseConfigured()) {
        const channel = supabase
          .channel("bracket-snapshot")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "app_match_snapshots",
              filter: `tournament_key=eq.${TOURNAMENT_ID}`,
            },
            (payload) => {
              const row = payload.new as { matches?: Match[]; slots?: BracketSlot[]; updated_at?: string };
              if (row?.matches) {
                applyPayload(
                  { matches: row.matches, slots: row.slots, syncedAt: row.updated_at },
                  setMatches,
                  setSlots,
                  setLastUpdate
                );
              } else {
                refresh();
              }
            }
          )
          .subscribe((status) => {
            setRealtimeConnected(status === "SUBSCRIBED");
          });

        pollRef.current = setInterval(refresh, POLL_MS * 2);
        cleanup = () => {
          supabase.removeChannel(channel);
          if (pollRef.current) clearInterval(pollRef.current);
        };
      } else {
        pollRef.current = setInterval(refresh, POLL_MS);
        cleanup = () => {
          if (pollRef.current) clearInterval(pollRef.current);
        };
      }
    });

    return () => cleanup?.();
  }, [refresh]);

  const selectWinner = useCallback((matchId: string, winnerId: string) => {
    setMatches((prev) => {
      const updated = prev.map((m) =>
        m.id === matchId
          ? { ...m, winnerTeamId: winnerId, status: "finished" as const }
          : m
      );
      const match = updated.find((m) => m.id === matchId);
      if (match) {
        setSlots((s) => advanceWinner(s, match));
      }
      return updated;
    });
    setLastUpdate(new Date().toISOString());
  }, []);

  useEffect(() => {
    const champ = slots.find((s) => s.round === "champion" && s.teamId);
    setChampionId(champ?.teamId ?? null);
  }, [slots]);

  const openTeam = useCallback(
    (teamId: string, matchId?: string) => {
      setSelectedTeamId(teamId);
      if (matchId) {
        const m = matches.find((x) => x.id === matchId) ?? null;
        setSelectedMatch(m);
      } else {
        const m =
          matches.find(
            (x) =>
              (x.homeTeamId === teamId || x.awayTeamId === teamId) &&
              x.status !== "finished"
          ) ?? matches.find((x) => x.homeTeamId === teamId || x.awayTeamId === teamId) ?? null;
        setSelectedMatch(m);
      }
    },
    [matches]
  );

  const closeDrawer = useCallback(() => {
    setSelectedMatch(null);
    setSelectedTeamId(null);
  }, []);

  return (
    <BracketContext.Provider
      value={{
        teams,
        activeTeams,
        teamMap,
        matches,
        slots,
        championId,
        lastUpdate,
        focusedSector,
        selectedMatch,
        selectedTeamId,
        isSyncing,
        realtimeConnected,
        selectWinner,
        refresh,
        setFocusedSector,
        openTeam,
        closeDrawer,
      }}
    >
      {children}
    </BracketContext.Provider>
  );
}

export function useBracket() {
  const ctx = useContext(BracketContext);
  if (!ctx) throw new Error("useBracket must be used within BracketProvider");
  return ctx;
}
