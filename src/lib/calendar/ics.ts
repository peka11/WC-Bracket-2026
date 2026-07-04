import type { Match } from "@/lib/types";
import { getMatchLabel } from "@/lib/data/tournament";

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildVevent(match: Match, homeName: string, awayName: string): string {
  const start = new Date(match.kickoffAt);
  const end = new Date(start.getTime() + MATCH_DURATION_MS);
  const uid = `${match.id}@wc-bracket-2026`;
  const summary = escapeIcs(`${homeName} vs ${awayName} · FIFA World Cup 2026`);
  const description = escapeIcs(getMatchLabel(match));
  const location = escapeIcs(match.venue ?? "World Cup 2026");
  const now = formatIcsUtc(new Date());

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function buildIcsCalendar(
  events: { match: Match; homeName: string; awayName: string }[]
): string {
  const body = events.map((e) => buildVevent(e.match, e.homeName, e.awayName)).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WC Bracket Challenge//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadMatchCalendar(match: Match, homeName: string, awayName: string) {
  const content = buildIcsCalendar([{ match, homeName, awayName }]);
  const slug = `${homeName}-vs-${awayName}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  downloadIcsFile(content, `wc-2026-${slug}.ics`);
}

export function downloadMatchesCalendar(
  events: { match: Match; homeName: string; awayName: string }[],
  filename = "wc-2026-upcoming"
) {
  if (events.length === 0) return;
  downloadIcsFile(buildIcsCalendar(events), filename);
}
