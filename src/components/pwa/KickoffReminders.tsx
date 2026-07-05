"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, BellOff } from "lucide-react";
import { useBracket } from "@/lib/bracket/BracketProvider";

const NOTIFIED_KEY = "wc-kickoff-notified";

export function KickoffReminders() {
  const { matches } = useBracket();
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setMounted(true);
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
      setEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    setEnabled(result === "granted");
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") return;

    const notified: string[] = JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "[]");
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;

    for (const m of matches) {
      if (m.status !== "not_started") continue;
      const kickoff = new Date(m.kickoffAt).getTime();
      const diff = kickoff - now;
      if (diff > 0 && diff <= windowMs && !notified.includes(m.id)) {
        new Notification("Kickoff soon!", {
          body: `${m.id.replace("-", " ").toUpperCase()} starts in ${Math.round(diff / 60000)} minutes`,
          icon: "/icon.svg",
          tag: m.id,
        });
        notified.push(m.id);
      }
    }

    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(notified.slice(-50)));
  }, [matches, enabled, permission]);

  if (!mounted || typeof Notification === "undefined") return null;

  return (
    <button
      type="button"
      onClick={requestPermission}
      className="btn-ghost text-xs"
      title="Kickoff reminders"
    >
      {enabled ? <Bell className="h-4 w-4 text-wc-green" /> : <BellOff className="h-4 w-4" />}
      {permission === "default" ? "Reminders" : enabled ? "Reminders on" : "Reminders off"}
    </button>
  );
}
