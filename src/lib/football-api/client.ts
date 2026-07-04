import type { MatchStatus } from "@/lib/types";

const API_STATUS_MAP: Record<string, MatchStatus> = {
  TBD: "not_started",
  NS: "not_started",
  "1H": "live",
  HT: "halftime",
  "2H": "live",
  ET: "extra_time",
  BT: "halftime",
  P: "penalties",
  FT: "finished",
  AET: "finished",
  PEN: "finished",
  PST: "postponed",
  CANC: "cancelled",
  ABD: "cancelled",
};

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string; elapsed?: number };
    venue?: { name?: string };
    referee?: string;
  };
  league: { id: number; season: number };
  teams: {
    home: { id: number; name: string; winner?: boolean | null };
    away: { id: number; name: string; winner?: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  statistics?: Array<{ team: { id: number }; statistics: Array<{ type: string; value: string | number | null }> }>;
  events?: Array<{ time: { elapsed: number }; type: string; detail: string; team: { id: number }; player: { name: string } }>;
}

export function mapApiStatus(short: string): MatchStatus {
  return API_STATUS_MAP[short] ?? "not_started";
}

export class FootballApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey ?? process.env.FOOTBALL_API_KEY ?? "";
    this.baseUrl = baseUrl ?? process.env.FOOTBALL_API_BASE_URL ?? "https://v3.football.api-sports.io";
  }

  get isConfigured() {
    return !!this.apiKey;
  }

  private async fetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const res = await fetch(url.toString(), {
      headers: {
        "x-apisports-key": this.apiKey,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`Football API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.errors && Object.keys(json.errors).length > 0) {
      throw new Error(JSON.stringify(json.errors));
    }

    return json.response as T;
  }

  async getFixtures(leagueId: number, season: number, status?: string) {
    return this.fetch<ApiFixture[]>("/fixtures", {
      league: leagueId,
      season,
      ...(status ? { status } : {}),
    });
  }

  async getLiveFixtures(leagueId: number, season: number) {
    return this.fetch<ApiFixture[]>("/fixtures", { league: leagueId, season, live: "all" });
  }

  async getFixtureById(fixtureId: number) {
    const data = await this.fetch<ApiFixture[]>("/fixtures", { id: fixtureId });
    return data[0] ?? null;
  }
}

export const footballApi = new FootballApiClient();
