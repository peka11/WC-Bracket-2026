"use client";

import { motion } from "framer-motion";
import type { Team, BracketSlot, Match } from "@/lib/types";
import { polarToCartesian } from "@/lib/utils";
import { BRACKET_SECTORS, radiusForRound } from "@/lib/data/tournament";

const CX = 400;
const CY = 400;
const TROPHY_H = 88;

interface CircularBracketProps {
  teams: Team[];
  teamMap: Record<string, Team>;
  slots: BracketSlot[];
  matches: Match[];
  championId?: string | null;
  focusedSector?: number | null;
  onSectorFocus?: (sector: number | null) => void;
  onTeamClick?: (teamId: string, matchId?: string) => void;
  interactive?: boolean;
}

function BracketDefs() {
  return (
    <defs>
      <radialGradient id="pitchBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a4d2e" />
        <stop offset="55%" stopColor="#0f3320" />
        <stop offset="100%" stopColor="#071a10" />
      </radialGradient>

      <radialGradient id="centerSpotlight" cx="50%" cy="50%" r="28%">
        <stop offset="0%" stopColor="#C5A028" stopOpacity="0.35" />
        <stop offset="70%" stopColor="#00A651" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5E6A3" />
        <stop offset="35%" stopColor="#C5A028" />
        <stop offset="65%" stopColor="#E8C547" />
        <stop offset="100%" stopColor="#8B6914" />
      </linearGradient>

      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#C5A028" stopOpacity="0.65" />
      </linearGradient>

      <linearGradient id="r16ArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C5A028" stopOpacity="0.15" />
        <stop offset="50%" stopColor="#C5A028" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#C5A028" stopOpacity="0.15" />
      </linearGradient>

      <filter id="teamGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
      </filter>

      <filter id="trophyGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#C5A028" floodOpacity="0.55" />
        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
      </filter>

      <filter id="desaturate">
        <feColorMatrix type="saturate" values="0.15" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.55" />
        </feComponentTransfer>
      </filter>

      <pattern id="grassDots" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.6" fill="#ffffff" opacity="0.04" />
        <circle cx="8" cy="7" r="0.5" fill="#ffffff" opacity="0.03" />
      </pattern>
    </defs>
  );
}

function TeamNode({
  team,
  x,
  y,
  isWinner,
  isLive,
  isEliminated,
  isInner,
  onClick,
  interactive,
  size = 52,
}: {
  team: Team;
  x: number;
  y: number;
  isWinner?: boolean;
  isLive?: boolean;
  isEliminated?: boolean;
  isInner?: boolean;
  onClick?: () => void;
  interactive?: boolean;
  size?: number;
}) {
  const clipId = `clip-${team.id}-${Math.round(x)}-${Math.round(y)}`;
  const imgSize = size - 10;
  const imgX = x - imgSize / 2;
  const imgY = y - imgSize / 2;
  const ringR = size / 2 + 2;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: isEliminated ? 0.4 : 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      whileHover={interactive && !isEliminated ? { scale: 1.1 } : undefined}
      style={{ cursor: interactive && !isEliminated ? "pointer" : "default" }}
      onClick={onClick}
      filter={isEliminated ? undefined : "url(#teamGlow)"}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={x} cy={y} r={imgSize / 2} />
        </clipPath>
      </defs>

      {isWinner && (
        <motion.circle
          cx={x}
          cy={y}
          r={ringR + 5}
          fill="none"
          stroke="url(#goldRing)"
          strokeWidth={2.5}
          animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        />
      )}

      {isLive && (
        <>
          <motion.circle
            cx={x + ringR - 2}
            cy={y - ringR + 2}
            r={6}
            fill="#EF4444"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <circle cx={x + ringR - 2} cy={y - ringR + 2} r={6} fill="none" stroke="#EF4444" strokeWidth={1} opacity={0.5} />
        </>
      )}

      <circle cx={x} cy={y} r={ringR + 1} fill="none" stroke="url(#goldRing)" strokeWidth={isInner ? 1.5 : 1} opacity={isInner ? 0.7 : 0.35} />
      <circle
        cx={x}
        cy={y}
        r={ringR}
        fill="#0a1f14"
        stroke={isWinner ? "#E8C547" : isInner ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)"}
        strokeWidth={isWinner ? 2 : 1.5}
      />

      <image
        href={team.flagUrl}
        x={imgX}
        y={imgY}
        width={imgSize}
        height={imgSize}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
        filter={isEliminated ? "url(#desaturate)" : undefined}
      />

      <rect
        x={x - 18}
        y={y + ringR + 4}
        width={36}
        height={14}
        rx={7}
        fill="rgba(0,0,0,0.55)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.5}
      />
      <text
        x={x}
        y={y + ringR + 14}
        textAnchor="middle"
        fill="#f3f4f6"
        fontSize={8}
        fontWeight={700}
        letterSpacing="0.08em"
      >
        {team.code.length > 3 ? team.code.slice(0, 3) : team.code}
      </text>
    </motion.g>
  );
}

function WorldCupCenter({ championId, teamMap }: { championId?: string | null; teamMap: Record<string, Team> }) {
  const trophyW = (TROPHY_H * 110.59) / 294.97;

  return (
    <motion.g
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
    >
      {[72, 58, 44].map((r, i) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="url(#goldRing)"
          strokeWidth={i === 0 ? 1.5 : 1}
          opacity={0.25 - i * 0.05}
        />
      ))}

      <circle cx={CX} cy={CY} r={38} fill="rgba(0,0,0,0.35)" stroke="url(#goldRing)" strokeWidth={2} />

      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        filter="url(#trophyGlow)"
      >
        <image
          href="/world-cup-trophy.svg"
          x={CX - trophyW / 2}
          y={CY - TROPHY_H / 2 - 8}
          width={trophyW}
          height={TROPHY_H}
          preserveAspectRatio="xMidYMid meet"
        />
      </motion.g>

      <text
        x={CX}
        y={CY + 52}
        textAnchor="middle"
        fill="#E8C547"
        fontSize={7}
        fontWeight={700}
        letterSpacing="0.22em"
        opacity={0.85}
      >
        FIFA WORLD CUP
      </text>

      {championId && teamMap[championId] && (
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <rect x={CX - 52} y={CY + 58} width={104} height={22} rx={11} fill="rgba(197,160,40,0.2)" stroke="#C5A028" strokeWidth={1} />
          <text x={CX} y={CY + 73} textAnchor="middle" fill="#F5E6A3" fontSize={10} fontWeight="bold">
            {teamMap[championId].name}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}

function curvedBracketPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend = 0.35
): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = mx - CX;
  const dy = my - CY;
  const cx = mx - dx * bend;
  const cy = my - dy * bend;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export function CircularBracket({
  teamMap,
  slots,
  matches,
  championId,
  focusedSector = null,
  onSectorFocus,
  onTeamClick,
  interactive = false,
}: CircularBracketProps) {
  const r32Slots = slots.filter((s) => s.round === "r32" && s.teamId);
  const r16TeamIds = new Set(
    slots.filter((s) => s.round === "r16" && s.teamId).map((s) => s.teamId!)
  );
  const liveTeamIds = new Set(
    matches.filter((m) => m.status === "live").flatMap((m) => [m.homeTeamId, m.awayTeamId])
  );

  const isSlotVisible = (slot: BracketSlot, match?: Match) => {
    if (slot.isEliminated) return false;
    if (match?.winnerTeamId && slot.teamId && match.winnerTeamId !== slot.teamId) return false;
    return true;
  };

  return (
    <div className="relative mx-auto w-full max-w-[860px] overflow-visible px-2 py-4">
      <div className="pointer-events-none absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(197,160,40,0.12)_0%,transparent_65%)] blur-2xl" />
      <svg
        viewBox="-48 -48 896 896"
        className="relative aspect-square h-auto w-full"
        aria-label="World Cup bracket"
      >
        <BracketDefs />

        {/* Pitch base */}
        <circle cx={CX} cy={CY} r={395} fill="url(#pitchBg)" />
        <circle cx={CX} cy={CY} r={395} fill="url(#grassDots)" />
        <circle cx={CX} cy={CY} r={395} fill="none" stroke="url(#goldRing)" strokeWidth={2} opacity={0.35} />

        {/* Sector wedges — click to focus R16 matchup */}
        {BRACKET_SECTORS.map((sector, i) => {
          const startDeg = (i * 360) / 8;
          const endDeg = ((i + 1) * 360) / 8;
          const r = 380;
          const p1 = polarToCartesian(CX, CY, r, startDeg);
          const p2 = polarToCartesian(CX, CY, r, endDeg);
          const midDeg = (startDeg + endDeg) / 2;
          const labelPos = polarToCartesian(CX, CY, 300, midDeg);
          const [ta, tb] = sector.r16TeamIds;
          const label =
            ta && tb
              ? `${teamMap[ta]?.code ?? "?"}·${teamMap[tb]?.code ?? "?"}`
              : ta
                ? `${teamMap[ta]?.code ?? "?"}·TBD`
                : "COL·GHA";
          const focused = focusedSector === i;

          return (
            <g key={`sector-${i}`}>
              <path
                d={`M ${CX} ${CY} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`}
                fill={focused ? "#C5A028" : i % 2 === 0 ? "#ffffff" : "#00A651"}
                opacity={focused ? 0.12 : 0.025}
                style={{ cursor: "pointer" }}
                onClick={() => onSectorFocus?.(focused ? null : i)}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                fill={focused ? "#F5E6A3" : "rgba(255,255,255,0.35)"}
                fontSize={8}
                fontWeight={700}
                letterSpacing="0.06em"
                style={{ cursor: "pointer", pointerEvents: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r={360} fill="url(#centerSpotlight)" />

        {/* Round rings */}
        {(["r32", "r16", "qf", "sf"] as const).map((round, i) => (
          <circle
            key={round}
            cx={CX}
            cy={CY}
            r={radiusForRound(round)}
            fill="none"
            stroke="url(#goldRing)"
            strokeWidth={round === "r16" ? 1.2 : 0.8}
            opacity={0.12 + i * 0.04}
            strokeDasharray={round === "r32" ? "none" : "3 8"}
          />
        ))}

        {/* Bracket connector curves */}
        {BRACKET_SECTORS.map((sector, sectorIndex) => {
          if (focusedSector != null && focusedSector !== sectorIndex) return null;
          return sector.r32MatchNumbers.map((matchNum, matchIdx) => {
            const matchSlots = r32Slots.filter((s) => s.sourceMatchId === `r32-${matchNum}`);
            if (matchSlots.length !== 2) return null;
            const [a, b] = matchSlots;
            const r16Slot = slots.find(
              (s) => s.round === "r16" && s.slotIndex === sectorIndex * 2 + matchIdx
            );
            const pa = polarToCartesian(CX, CY, radiusForRound("r32"), a.angleDegrees);
            const pb = polarToCartesian(CX, CY, radiusForRound("r32"), b.angleDegrees);
            const targetAngle = r16Slot?.angleDegrees ?? (a.angleDegrees + b.angleDegrees) / 2;
            const mid = polarToCartesian(CX, CY, radiusForRound("r16"), targetAngle);

            return (
              <g key={`line-${sectorIndex}-${matchNum}`} fill="none" stroke="url(#lineGrad)" strokeWidth={1.4} opacity={0.5}>
                <path d={curvedBracketPath(pa.x, pa.y, mid.x, mid.y)} />
                <path d={curvedBracketPath(pb.x, pb.y, mid.x, mid.y)} />
              </g>
            );
          });
        })}

        {/* R16 matchup arcs */}
        {BRACKET_SECTORS.map((sector, sectorIndex) => {
          if (focusedSector != null && focusedSector !== sectorIndex) return null;
          const pair = slots.filter(
            (s) =>
              s.round === "r16" &&
              s.slotIndex >= sectorIndex * 2 &&
              s.slotIndex < sectorIndex * 2 + 2 &&
              s.teamId
          );
          if (pair.length !== 2) return null;
          const [a, b] = pair;
          const pa = polarToCartesian(CX, CY, radiusForRound("r16"), a.angleDegrees);
          const pb = polarToCartesian(CX, CY, radiusForRound("r16"), b.angleDegrees);
          const midAngle = (a.angleDegrees + b.angleDegrees) / 2;
          const ctrl = polarToCartesian(CX, CY, radiusForRound("r16") - 28, midAngle);
          return (
            <path
              key={`r16-pair-${sectorIndex}`}
              d={`M ${pa.x} ${pa.y} Q ${ctrl.x} ${ctrl.y} ${pb.x} ${pb.y}`}
              fill="none"
              stroke="url(#r16ArcGrad)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* R32 teams still in contention */}
        {r32Slots.map((slot) => {
          const team = slot.teamId ? teamMap[slot.teamId] : null;
          if (!team || r16TeamIds.has(team.id)) return null;
          const match = matches.find(
            (m) => m.round === "r32" && (m.homeTeamId === team.id || m.awayTeamId === team.id)
          );
          if (!isSlotVisible(slot, match)) return null;
          const sectorIdx = BRACKET_SECTORS.findIndex((s) =>
            s.r32MatchNumbers.some((n) => `r32-${n}` === slot.sourceMatchId)
          );
          if (focusedSector != null && focusedSector !== sectorIdx) return null;
          const { x, y } = polarToCartesian(CX, CY, radiusForRound("r32"), slot.angleDegrees);
          return (
            <TeamNode
              key={slot.id}
              team={team}
              x={x}
              y={y}
              isWinner={match?.winnerTeamId === team.id}
              isLive={liveTeamIds.has(team.id)}
              isEliminated={false}
              interactive={interactive}
              onClick={() => onTeamClick?.(team.id, match?.id)}
            />
          );
        })}

        {/* Inner round teams */}
        {slots
          .filter((s) => s.round !== "r32" && s.round !== "champion" && s.teamId)
          .map((slot) => {
            const sectorIdx = Math.floor(slot.slotIndex / 2);
            if (focusedSector != null && slot.round === "r16" && focusedSector !== sectorIdx) return null;
            const team = teamMap[slot.teamId!];
            const { x, y } = polarToCartesian(CX, CY, radiusForRound(slot.round), slot.angleDegrees);
            return (
              <TeamNode
                key={slot.id}
                team={team}
                x={x}
                y={y}
                size={slot.round === "final" ? 46 : 42}
                isInner
                isWinner={championId === team.id}
                interactive={interactive}
                onClick={() => onTeamClick?.(team.id)}
              />
            );
          })}

        <WorldCupCenter championId={championId} teamMap={teamMap} />
      </svg>
    </div>
  );
}
