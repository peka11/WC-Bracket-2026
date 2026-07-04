"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { formatInTimeZone } from "date-fns-tz";

const STORAGE_KEY = "wc-timezone";
export const DEFAULT_TIMEZONE = "America/New_York";

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "UTC", label: "UTC" },
] as const;

interface TimezoneContextValue {
  timezone: string;
  setTimezone: (tz: string) => void;
  options: typeof TIMEZONE_OPTIONS;
  formatKickoff: (iso: string, pattern?: string) => string;
  timezoneLabel: string;
}

const TimezoneContext = createContext<TimezoneContextValue>({
  timezone: DEFAULT_TIMEZONE,
  setTimezone: () => {},
  options: TIMEZONE_OPTIONS,
  formatKickoff: (iso) => iso,
  timezoneLabel: "ET",
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState(DEFAULT_TIMEZONE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTimezoneState(stored);
    else {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TIMEZONE_OPTIONS.some((o) => o.value === detected)) {
          setTimezoneState(detected);
        }
      } catch {
        /* keep default */
      }
    }
    setMounted(true);
  }, []);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
    localStorage.setItem(STORAGE_KEY, tz);
  }, []);

  const formatKickoff = useCallback(
    (iso: string, pattern = "MMM d · h:mm a") => {
      const tz = mounted ? timezone : DEFAULT_TIMEZONE;
      return formatInTimeZone(new Date(iso), tz, pattern);
    },
    [timezone, mounted]
  );

  const timezoneLabel = mounted
    ? formatInTimeZone(new Date(), timezone, "zzz")
    : "ET";

  return (
    <TimezoneContext.Provider
      value={{ timezone: mounted ? timezone : DEFAULT_TIMEZONE, setTimezone, options: TIMEZONE_OPTIONS, formatKickoff, timezoneLabel }}
    >
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  return useContext(TimezoneContext);
}
