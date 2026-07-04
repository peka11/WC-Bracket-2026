import type { Match, MatchEvent, MatchStats } from "@/lib/types";
import { TEAMS_2026, buildInitialMatches } from "@/lib/data/tournament";
import { mapApiStatus, type ApiFixture } from "@/lib/football-api/client";

/** Map API-Football team names → our team ids (demo WC 2026) */
const NAME_TO_ID: Record<string, string> = Object.fromEntries(
  TEAMS_2026.flatMap((t) => [
    [t.name.toLowerCase(), t.id],
    [t.code.toLowerCase(), t.id],
  ])
);

NAME_TO_ID["united states"] = "usa";
NAME_TO_ID["dr congo"] = "cod";
NAME_TO_ID["côte d'ivoire"] = "civ";
NAME_TO_ID["ivory coast"] = "civ";
NAME_TO_ID["bosnia and herzegovina"] = "bih";
NAME_TO_ID["bosnia & herzegovina"] = "bih";
NAME_TO_ID["south africa"] = "rsa";
NAME_TO_ID["cape verde"] = "cpv";

const teamCodeByApiId = (apiTeamId: number, f: ApiFixture): string | null => {
  if (f.teams.home.id === apiTeamId) return teamCodeFromApi(f.teams.home.name);
  if (f.teams.away.id === apiTeamId) return teamCodeFromApi(f.teams.away.name);
  return null;
};

function teamIdFromApi(name: string): string | null {
  const key = name.trim().toLowerCase();
  return NAME_TO_ID[key] ?? null;
}

function teamCodeFromApi(name: string): string | null {
  const id = teamIdFromApi(name);
  if (!id) return null;
  return TEAMS_2026.find((t) => t.id === id)?.code ?? null;
}

function winnerFromFixture(f: ApiFixture): string | null {
  if (f.teams.home.winner) return teamIdFromApi(f.teams.home.name);
  if (f.teams.away.winner) return teamIdFromApi(f.teams.away.name);
  return null;
}

function mapEventType(type: string, detail: string): MatchEvent["type"] {
  const d = detail.toLowerCase();
  if (type === "Goal") return "goal";
  if (type === "Card") return d.includes("red") ? "card" : "card";
  if (type === "subst") return "subst";
  if (type === "Var") return "var";
  return "goal";
}

function mapEvents(f: ApiFixture): MatchEvent[] | undefined {
  if (!f.events?.length) return undefined;
  return f.events.map((e) => ({
    type: mapEventType(e.type, e.detail),
    minute: e.time.elapsed,
    teamCode: teamCodeByApiId(e.team.id, f) ?? "???",
    player: e.player?.name,
    detail: e.detail,
  }));
}

function statNum(value: string | number | null | undefined): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  const n = parseFloat(String(value).replace("%", ""));
  return Number.isFinite(n) ? n : undefined;
}

function mapStats(f: ApiFixture): MatchStats | undefined {
  if (!f.statistics?.length) return undefined;
  const homeApiId = f.teams.home.id;
  const home = f.statistics.find((s) => s.team.id === homeApiId);
  const away = f.statistics.find((s) => s.team.id !== homeApiId);
  if (!home || !away) return undefined;

  const pick = (rows: typeof home.statistics, type: string) =>
    statNum(rows.find((s) => s.type === type)?.value);

  const stats: MatchStats = {
    homePossession: pick(home.statistics, "Ball Possession"),
    awayPossession: pick(away.statistics, "Ball Possession"),
    homeShots: pick(home.statistics, "Total Shots"),
    awayShots: pick(away.statistics, "Total Shots"),
    homeShotsOnTarget: pick(home.statistics, "Shots on Goal"),
    awayShotsOnTarget: pick(away.statistics, "Shots on Goal"),
    homeCorners: pick(home.statistics, "Corner Kicks"),
    awayCorners: pick(away.statistics, "Corner Kicks"),
    homeXG: pick(home.statistics, "expected_goals"),
    awayXG: pick(away.statistics, "expected_goals"),
  };

  const hasData = Object.values(stats).some((v) => v != null);
  return hasData ? stats : undefined;
}

/** Match API fixtures to bracket matches by team pair */
export function applyFixturesToMatches(base: Match[], fixtures: ApiFixture[]): Match[] {
  const result = base.map((m) => ({ ...m }));

  for (const f of fixtures) {
    const homeId = teamIdFromApi(f.teams.home.name);
    const awayId = teamIdFromApi(f.teams.away.name);
    if (!homeId || !awayId) continue;

    const idx = result.findIndex(
      (m) =>
        (m.homeTeamId === homeId && m.awayTeamId === awayId) ||
        (m.homeTeamId === awayId && m.awayTeamId === homeId)
    );
    if (idx < 0) continue;

    const status = mapApiStatus(f.fixture.status.short);
    const winner = winnerFromFixture(f);
    const events = mapEvents(f);
    const stats = mapStats(f);
    const swapped = result[idx].homeTeamId !== homeId;

    result[idx] = {
      ...result[idx],
      homeScore: swapped ? f.goals.away : f.goals.home,
      awayScore: swapped ? f.goals.home : f.goals.away,
      status,
      winnerTeamId: winner ?? result[idx].winnerTeamId,
      kickoffAt: f.fixture.date,
      venue: f.fixture.venue?.name ?? result[idx].venue,
      referee: f.fixture.referee ?? result[idx].referee,
      events: events?.length ? events : result[idx].events,
      stats: stats ?? result[idx].stats,
      homePossession: stats?.homePossession ?? result[idx].homePossession,
      awayPossession: stats?.awayPossession ?? result[idx].awayPossession,
    };
  }

  return result;
}

export function buildSyncedMatches(fixtures: ApiFixture[]): Match[] {
  return applyFixturesToMatches(buildInitialMatches(), fixtures);
}
