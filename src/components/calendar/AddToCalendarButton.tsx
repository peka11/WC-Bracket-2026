"use client";

import { CalendarPlus } from "lucide-react";
import type { Match } from "@/lib/types";
import { downloadMatchCalendar, downloadMatchesCalendar } from "@/lib/calendar/ics";
import { cn } from "@/lib/utils";

interface AddToCalendarButtonProps {
  match: Match;
  homeName: string;
  awayName: string;
  className?: string;
  compact?: boolean;
}

export function AddToCalendarButton({
  match,
  homeName,
  awayName,
  className,
  compact = false,
}: AddToCalendarButtonProps) {
  if (match.status !== "not_started") return null;

  return (
    <button
      type="button"
      onClick={() => downloadMatchCalendar(match, homeName, awayName)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-wc-green transition hover:bg-wc-green/10",
        compact ? "p-1.5" : "px-2.5 py-1.5",
        className
      )}
      title="Add to calendar"
    >
      <CalendarPlus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {!compact && "Add to calendar"}
    </button>
  );
}

interface AddAllToCalendarButtonProps {
  events: { match: Match; homeName: string; awayName: string }[];
  className?: string;
  label?: string;
}

export function AddAllToCalendarButton({
  events,
  className,
  label = "Add all to calendar",
}: AddAllToCalendarButtonProps) {
  const upcoming = events.filter((e) => e.match.status === "not_started");
  if (upcoming.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => downloadMatchesCalendar(upcoming)}
      className={cn("btn-ghost text-sm", className)}
    >
      <CalendarPlus className="h-4 w-4" />
      {label}
    </button>
  );
}
