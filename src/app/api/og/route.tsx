import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { decodePredictionsFromShare } from "@/lib/predictions/store";
import { TEAMS_2026, buildInitialMatches } from "@/lib/data/tournament";
import { analyzeBracket } from "@/lib/predictions/bracket-analysis";

export const runtime = "edge";

const teamMap = Object.fromEntries(TEAMS_2026.map((t) => [t.id, t]));

export async function GET(req: NextRequest) {
  const b = req.nextUrl.searchParams.get("b") ?? "";
  const picks = decodePredictionsFromShare(b);
  const name = picks?.displayName ?? "Bracket Challenge";
  const champion = picks?.champion ? teamMap[picks.champion]?.code ?? "—" : "—";
  const analysis = picks ? analyzeBracket(picks, buildInitialMatches()) : null;
  const darkHorse = analysis?.darkHorseTeamId
    ? teamMap[analysis.darkHorseTeamId]?.code ?? "—"
    : "—";
  const risk = analysis?.riskScore ?? 0;
  const riskLabel = analysis?.riskLabel ?? "Balanced";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(145deg, #071a10 0%, #0f3320 45%, #1a4d2e 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(197,160,40,0.2)",
              border: "2px solid #C5A028",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🏆
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, color: "#00A651", fontWeight: 700, letterSpacing: 2 }}>
              FIFA WORLD CUP 2026
            </span>
            <span style={{ fontSize: 36, fontWeight: 800 }}>My World Cup Prediction</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>{name}</span>
          <div style={{ display: "flex", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>Champion</span>
              <span style={{ fontSize: 32, color: "#E8C547", fontWeight: 800 }}>{champion}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }}>Dark horse</span>
              <span style={{ fontSize: 32, color: "#E8C547", fontWeight: 800 }}>{darkHorse}</span>
            </div>
          </div>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
            Risk {risk}/100 · {riskLabel}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid rgba(197,160,40,0.35)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.5)" }}>Think you can beat me?</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#071a10",
              background: "#00A651",
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            Challenge me →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
