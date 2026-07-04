export interface SquadPlayer {
  name: string;
  position: string;
  club: string;
  caps?: number;
}

export interface WcHistoryEntry {
  year: number;
  finish: string;
}

export interface TeamEncyclopedia {
  qualification: string;
  groupStageRecap?: string;
  squad: SquadPlayer[];
  wcHistory: WcHistoryEntry[];
  rivalries: string[];
}

const DEFAULT_SQUAD = (star: string): SquadPlayer[] => [
  { name: star, position: "FW", club: "—", caps: 100 },
  { name: "Starting GK", position: "GK", club: "—", caps: 45 },
  { name: "Starting CB", position: "DF", club: "—", caps: 52 },
  { name: "Starting CM", position: "MF", club: "—", caps: 38 },
];

export const TEAM_ENCYCLOPEDIA: Record<string, TeamEncyclopedia> = {
  arg: {
    qualification: "CONMEBOL qualifiers — top tier",
    groupStageRecap: "Won Group J; dominated opening matches",
    squad: [
      { name: "Lionel Messi", position: "FW", club: "Inter Miami", caps: 190 },
      { name: "Emiliano Martínez", position: "GK", club: "Aston Villa", caps: 72 },
      { name: "Cristian Romero", position: "DF", club: "Tottenham", caps: 35 },
      { name: "Enzo Fernández", position: "MF", club: "Chelsea", caps: 40 },
      { name: "Lautaro Martínez", position: "FW", club: "Inter", caps: 68 },
    ],
    wcHistory: [
      { year: 2022, finish: "Champions" },
      { year: 2014, finish: "Runners-up" },
      { year: 1986, finish: "Champions" },
    ],
    rivalries: ["Brazil (Superclásico of the Americas)", "England (1986 & 1998 lore)"],
  },
  fra: {
    qualification: "UEFA qualifiers — group winners",
    groupStageRecap: "Perfect Group I record",
    squad: DEFAULT_SQUAD("Kylian Mbappé").map((p, i) =>
      i === 0 ? { ...p, name: "Kylian Mbappé", club: "Real Madrid", caps: 88 } : p
    ),
    wcHistory: [
      { year: 2018, finish: "Champions" },
      { year: 2022, finish: "Runners-up" },
    ],
    rivalries: ["Germany", "Italy"],
  },
  bra: {
    qualification: "CONMEBOL — automatic",
    groupStageRecap: "Topped Group C despite late loss",
    squad: DEFAULT_SQUAD("Vinícius Jr").map((p, i) =>
      i === 0 ? { ...p, name: "Vinícius Jr", club: "Real Madrid", caps: 42 } : p
    ),
    wcHistory: [
      { year: 2002, finish: "Champions" },
      { year: 2014, finish: "4th (semifinal)" },
    ],
    rivalries: ["Argentina", "Uruguay"],
  },
  eng: {
    qualification: "UEFA — qualified as group winners",
    groupStageRecap: "Strong Group L showing",
    squad: DEFAULT_SQUAD("Harry Kane").map((p, i) =>
      i === 0 ? { ...p, name: "Harry Kane", club: "Bayern Munich", caps: 110 } : p
    ),
    wcHistory: [{ year: 1966, finish: "Champions" }, { year: 2018, finish: "4th" }],
    rivalries: ["Germany", "Argentina"],
  },
  usa: {
    qualification: "CONCACAF — co-host automatic + strong form",
    groupStageRecap: "Won Group D as hosts",
    squad: DEFAULT_SQUAD("Christian Pulisic").map((p, i) =>
      i === 0 ? { ...p, name: "Christian Pulisic", club: "AC Milan", caps: 78 } : p
    ),
    wcHistory: [{ year: 1930, finish: "3rd" }, { year: 2002, finish: "Quarterfinals" }],
    rivalries: ["Mexico", "Canada"],
  },
  mex: {
    qualification: "CONCACAF — co-host",
    groupStageRecap: "Advanced from Group A",
    squad: DEFAULT_SQUAD("Hirving Lozano"),
    wcHistory: [{ year: 1970, finish: "Quarterfinals" }, { year: 1986, finish: "Quarterfinals" }],
    rivalries: ["USA", "Argentina"],
  },
};

export function getTeamEncyclopedia(teamId: string): TeamEncyclopedia {
  return (
    TEAM_ENCYCLOPEDIA[teamId] ?? {
      qualification: "Qualified via continental playoffs",
      squad: DEFAULT_SQUAD("Captain"),
      wcHistory: [{ year: 2026, finish: "In progress" }],
      rivalries: [],
    }
  );
}

export function headToHeadSummary(teamA: string, teamB: string): string {
  return `Historical meetings between ${teamA.toUpperCase()} and ${teamB.toUpperCase()} include prior World Cup and friendly clashes — check FIFA archives for full H2H.`;
}
