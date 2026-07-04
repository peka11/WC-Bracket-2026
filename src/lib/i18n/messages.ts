export type Locale = "en" | "es" | "pt";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
];

export type Messages = {
  nav: Record<keyof typeof en.nav, string>;
  match: Record<keyof typeof en.match, string>;
  schedule: Record<keyof typeof en.schedule, string>;
  venues: Record<keyof typeof en.venues, string>;
  tournament: Record<keyof typeof en.tournament, string>;
  path: Record<keyof typeof en.path, string>;
  present: Record<keyof typeof en.present, string>;
  ticker: Record<keyof typeof en.ticker, string>;
  a11y: Record<keyof typeof en.a11y, string>;
  status: Record<keyof typeof en.status, string>;
  round: Record<keyof typeof en.round, string>;
};

export const en = {
  nav: {
    bracket: "Bracket",
    live: "Live",
    predictions: "Predictions",
    schedule: "Schedule",
    venues: "Venues",
    tournament: "Story",
    path: "Path",
    groups: "Groups",
    dashboard: "Dashboard",
    modes: "Modes",
    compare: "Compare",
    challenge: "Challenge",
    leaderboard: "Leaderboard",
    leagues: "Leagues",
    admin: "Admin",
    present: "Present",
  },
  match: {
    timeline: "Match timeline",
    stats: "Match statistics",
    path: "Path to this match",
    referee: "Referee",
    attendance: "Attendance",
    follow: "Follow",
    unfollow: "Unfollow",
    back: "Back",
    xg: "Expected goals",
    shots: "Shots",
    onTarget: "On target",
    corners: "Corners",
    possession: "Possession",
    noEvents: "No events yet",
  },
  schedule: {
    title: "Match schedule",
    subtitle: "TV-guide view for every knockout kickoff",
    today: "Today",
    tomorrow: "Tomorrow",
    byRound: "By round",
    all: "All",
    filterTeam: "Team",
    filterCity: "City",
    nextKickoffs: "Next kickoffs",
    exportIcs: "Export calendar (.ics)",
    exportPrint: "Print schedule",
    noMatches: "No matches in this filter",
  },
  venues: {
    title: "Host cities & stadiums",
    subtitle: "2026 World Cup venues across North America",
    capacity: "Capacity",
    surface: "Surface",
    climate: "Climate",
    gettingThere: "Getting there",
    matchesHere: "Matches at this venue",
  },
  tournament: {
    title: "Tournament story",
    goldenBoot: "Golden Boot race",
    cinderella: "Cinderella tracker",
    confederations: "Confederations remaining",
    upsets: "Biggest upsets",
    teamsLeft: "teams still alive",
  },
  path: {
    title: "Knockout path visualizer",
    subtitle: "Can two teams meet in the final?",
    teamA: "Team A",
    teamB: "Team B",
    analyze: "Analyze paths",
  },
  present: {
    title: "Presenter mode",
    scan: "Scan for live bracket on your phone",
    refresh: "Auto-refresh",
  },
  ticker: {
    live: "Live scores",
  },
  a11y: {
    bracket: "World Cup knockout bracket",
    reducedMotion: "Reduced motion enabled",
  },
  status: {
    not_started: "Not Started",
    live: "Live",
    halftime: "Halftime",
    extra_time: "Extra Time",
    penalties: "Penalties",
    finished: "Finished",
    postponed: "Postponed",
    cancelled: "Cancelled",
  },
  round: {
    r32: "Round of 32",
    r16: "Round of 16",
    qf: "Quarterfinals",
    sf: "Semifinals",
    third: "Third Place",
    final: "Final",
    champion: "Champion",
  },
} as const;

export const es: Messages = {
  ...en,
  nav: {
    ...en.nav,
    bracket: "Cuadro",
    live: "En vivo",
    predictions: "Predicciones",
    schedule: "Calendario",
    venues: "Sedes",
    tournament: "Historia",
    path: "Rutas",
    groups: "Grupos",
    dashboard: "Panel",
    modes: "Modos",
    compare: "Comparar",
    challenge: "Reto",
    leaderboard: "Clasificación",
    leagues: "Ligas",
    admin: "Admin",
    present: "Presentar",
  },
  schedule: {
    ...en.schedule,
    title: "Calendario de partidos",
    subtitle: "Guía TV de todos los partidos eliminatorios",
    today: "Hoy",
    tomorrow: "Mañana",
    byRound: "Por ronda",
    all: "Todos",
    filterTeam: "Equipo",
    filterCity: "Ciudad",
    nextKickoffs: "Próximos partidos",
    exportIcs: "Exportar calendario (.ics)",
    exportPrint: "Imprimir calendario",
    noMatches: "No hay partidos con este filtro",
  },
  match: {
    ...en.match,
    timeline: "Cronología",
    stats: "Estadísticas",
    path: "Camino a este partido",
    referee: "Árbitro",
    attendance: "Asistencia",
    follow: "Seguir",
    unfollow: "Dejar de seguir",
    noEvents: "Sin eventos aún",
  },
};

export const pt: Messages = {
  ...en,
  nav: {
    ...en.nav,
    bracket: "Chave",
    live: "Ao vivo",
    predictions: "Palpites",
    schedule: "Agenda",
    venues: "Estádios",
    tournament: "História",
    path: "Rotas",
    groups: "Grupos",
    dashboard: "Painel",
    modes: "Modos",
    compare: "Comparar",
    challenge: "Desafio",
    leaderboard: "Ranking",
    leagues: "Ligas",
    admin: "Admin",
    present: "Apresentar",
  },
  schedule: {
    ...en.schedule,
    title: "Agenda de jogos",
    subtitle: "Guia de TV para todos os jogos do mata-mata",
    today: "Hoje",
    tomorrow: "Amanhã",
    byRound: "Por fase",
    all: "Todos",
    filterTeam: "Seleção",
    filterCity: "Cidade",
    nextKickoffs: "Próximos jogos",
    exportIcs: "Exportar calendário (.ics)",
    exportPrint: "Imprimir agenda",
    noMatches: "Nenhum jogo neste filtro",
  },
  match: {
    ...en.match,
    timeline: "Linha do tempo",
    stats: "Estatísticas",
    path: "Caminho até este jogo",
    referee: "Árbitro",
    attendance: "Público",
    follow: "Seguir",
    unfollow: "Deixar de seguir",
    noEvents: "Sem eventos ainda",
  },
};

export const dictionaries: Record<Locale, Messages> = { en, es, pt };
