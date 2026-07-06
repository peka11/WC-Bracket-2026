import type { Team } from "@/lib/types";
import { TEAMS_2026 } from "@/lib/data/tournament";

export interface TeamProfile extends Team {
  nickname?: string;
  coach?: string;
  starPlayer?: string;
  worldCupBest?: string;
  form?: string;
  pathSummary?: string;
}

export const TEAM_PROFILES: Record<string, Omit<TeamProfile, keyof Team>> = {
  arg: { nickname: "La Albiceleste", coach: "Lionel Scaloni", starPlayer: "Lionel Messi", worldCupBest: "Champions (1978, 1986, 2022)", form: "WWWDW", pathSummary: "Beat Cape Verde 3-2 AET in R32 · face Egypt in R16" },
  fra: { nickname: "Les Bleus", coach: "Didier Deschamps", starPlayer: "Kylian Mbappé", worldCupBest: "Champions (1998, 2018)", form: "WWWWD", pathSummary: "Beat Paraguay 3-1 in R16 · quarterfinal vs Morocco" },
  bra: { nickname: "Seleção", coach: "Carlo Ancelotti", starPlayer: "Vinícius Jr", worldCupBest: "Champions (5×)", form: "WWLWW", pathSummary: "Beat Norway 2-1 in R16 · quarterfinal vs England" },
  eng: { nickname: "The Three Lions", coach: "Gareth Southgate", starPlayer: "Harry Kane", worldCupBest: "Champions (1966)", form: "WWDWW", pathSummary: "Beat Mexico 2-0 in R16 · quarterfinal vs Brazil" },
  esp: { nickname: "La Roja", coach: "Luis de la Fuente", starPlayer: "Lamine Yamal", worldCupBest: "Champions (2010)", form: "WWWDW", pathSummary: "Beat Austria 3-0 in R32 · Iberian derby vs Portugal in R16" },
  por: { nickname: "A Seleção", coach: "Roberto Martínez", starPlayer: "Cristiano Ronaldo", worldCupBest: "3rd (1966)", form: "WDWWW", pathSummary: "Beat Croatia 2-1 in R32 · face Spain in R16" },
  ger: { nickname: "Die Mannschaft", coach: "Julian Nagelsmann", starPlayer: "Jamal Musiala", worldCupBest: "Champions (4×)", form: "LWWDL", pathSummary: "Eliminated R32 — lost to Paraguay on penalties" },
  par: { nickname: "La Albirroja", coach: "Gustavo Alfaro", starPlayer: "Miguel Almirón", worldCupBest: "Quarterfinals (2010)", form: "WDWLW", pathSummary: "Eliminated R16 — lost 1-3 to France in Philadelphia" },
  jpn: { nickname: "Samurai Blue", coach: "Hajime Moriyasu", starPlayer: "Kaoru Mitoma", worldCupBest: "Round of 16 (3×)", form: "LWWLW", pathSummary: "Eliminated R32 — lost 2-1 to Brazil" },
  usa: { nickname: "USMNT", coach: "Mauricio Pochettino", starPlayer: "Christian Pulisic", worldCupBest: "3rd (1930)", form: "WWDWW", pathSummary: "Beat Bosnia 2-0 in R32 · face Belgium in R16" },
  mex: { nickname: "El Tri", coach: "Javier Aguirre", starPlayer: "Hirving Lozano", worldCupBest: "Quarterfinals (2×)", form: "WWDWW", pathSummary: "Eliminated R16 — lost 0-2 to England in Mexico City" },
  can: { nickname: "CanMNT", coach: "Jesse Marsch", starPlayer: "Alphonso Davies", worldCupBest: "Group stage (4×)", form: "DWDWW", pathSummary: "Eliminated R16 — lost 0-1 to Morocco in Houston" },
  mar: { nickname: "Atlas Lions", coach: "Walid Regragui", starPlayer: "Achraf Hakimi", worldCupBest: "4th (2022)", form: "WWDWW", pathSummary: "Beat Canada 1-0 in R16 · quarterfinal vs France" },
  col: { nickname: "Los Cafeteros", coach: "Néstor Lorenzo", starPlayer: "Luis Díaz", worldCupBest: "Quarterfinals (2014)", form: "WWDWW", pathSummary: "Beat Ghana 1-0 in R32 · face Switzerland in R16" },
  nor: { nickname: "Løvene", coach: "Ståle Solbakken", starPlayer: "Erling Haaland", worldCupBest: "Group stage", form: "WWLWW", pathSummary: "Eliminated R16 — lost 2-1 to Brazil at MetLife" },
};

export function getTeamProfile(teamId: string): TeamProfile | null {
  const base = TEAMS_2026.find((t) => t.id === teamId);
  if (!base) return null;
  return { ...base, ...TEAM_PROFILES[teamId] };
}

export function getAllTeamProfiles(): TeamProfile[] {
  return TEAMS_2026.map((t) => ({ ...t, ...TEAM_PROFILES[t.id] }));
}
