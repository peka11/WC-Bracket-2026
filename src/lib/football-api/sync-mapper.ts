import type { Match } from "@/lib/types";
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

function teamIdFromApi(name: string): string | null {
  const key = name.trim().toLowerCase();
  return NAME_TO_ID[key] ?? null;
}

function winnerFromFixture(f: ApiFixture): string | null {
  if (f.teams.home.winner) return teamIdFromApi(f.teams.home.name);
  if (f.teams.away.winner) return teamIdFromApi(f.teams.away.name);
  return null;
}

/** Match API fixtures to bracket matches by team pair */
export function applyFixturesToMatches(
  base: Match[],
  fixtures: ApiFixture[]
): Match[] {
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
    result[idx] = {
      ...result[idx],
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status,
      winnerTeamId: winner ?? result[idx].winnerTeamId,
      kickoffAt: f.fixture.date,
      venue: f.fixture.venue?.name ?? result[idx].venue,
    };
  }

  return result;
}

export function buildSyncedMatches(fixtures: ApiFixture[]): Match[] {
  return applyFixturesToMatches(buildInitialMatches(), fixtures);
}
