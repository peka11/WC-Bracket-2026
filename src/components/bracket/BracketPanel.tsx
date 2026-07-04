"use client";

import { useBracket } from "@/lib/bracket/BracketProvider";
import { CircularBracket } from "@/components/bracket/CircularBracket";
import { BracketListView } from "@/components/bracket/BracketListView";
import { MatchDrawer } from "@/components/matches/MatchDrawer";
import { BRACKET_SECTORS } from "@/lib/data/tournament";
import { MatchCard } from "@/components/matches/MatchCard";

interface BracketPanelProps {
  interactive?: boolean;
  onPickWinner?: (matchId: string, winnerId: string) => void;
}

export function BracketPanel({ interactive = false, onPickWinner }: BracketPanelProps) {
  const {
    teams,
    teamMap,
    slots,
    matches,
    championId,
    focusedSector,
    setFocusedSector,
    openTeam,
  } = useBracket();

  const focusedMatch =
    focusedSector != null
      ? matches.find((m) => m.round === "r16" && m.matchNumber === BRACKET_SECTORS[focusedSector]?.r16MatchNumber)
      : null;

  return (
    <>
      <div className="hidden md:block" style={{ maxWidth: 860, margin: "0 auto" }}>
        <CircularBracket
          teams={teams}
          teamMap={teamMap}
          slots={slots}
          matches={matches}
          championId={championId}
          focusedSector={focusedSector}
          interactive={interactive}
          onSectorFocus={setFocusedSector}
          onTeamClick={(teamId, matchId) => {
            if (interactive && matchId && onPickWinner) {
              onPickWinner(matchId, teamId);
            } else {
              openTeam(teamId, matchId);
            }
          }}
        />
      </div>

      <BracketListView
        matches={matches}
        teamMap={teamMap}
        onTeamClick={(teamId, matchId) => {
          if (interactive && matchId && onPickWinner) {
            onPickWinner(matchId, teamId);
          } else {
            openTeam(teamId, matchId);
          }
        }}
      />

      {focusedMatch && focusedSector != null && (
        <div className="mt-6 hidden rounded-2xl border border-wc-gold/30 bg-wc-gold/5 p-4 md:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-wc-gold">
              Round of 16 · Match {focusedMatch.matchNumber}
            </p>
            <button
              type="button"
              onClick={() => setFocusedSector(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear focus
            </button>
          </div>
          <MatchCard
            match={focusedMatch}
            home={teamMap[focusedMatch.homeTeamId]}
            away={teamMap[focusedMatch.awayTeamId]}
          />
        </div>
      )}

      <MatchDrawer />
    </>
  );
}
