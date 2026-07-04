"use client";

import { useState } from "react";
import { RefreshCw, Activity, Database, Key } from "lucide-react";

export default function AdminPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const triggerSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "demo" },
        body: JSON.stringify({ source: "admin" }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-gray-500">Manage sync, API health, and tournament data</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Activity, label: "API Health", value: "Demo mode", ok: true },
          { icon: Database, label: "Last sync", value: "Not configured", ok: false },
          { icon: Key, label: "Football API", value: "Set FOOTBALL_API_KEY in .env", ok: false },
        ].map(({ icon: Icon, label, value, ok }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${ok ? "text-wc-green" : "text-gray-400"}`} />
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Manual sync</h2>
        <p className="text-sm text-gray-500">
          Trigger a live match sync. Requires CRON_SECRET header in production.
        </p>
        <button type="button" onClick={triggerSync} disabled={syncing} className="btn-primary">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync matches now"}
        </button>
        {result && (
          <pre className="overflow-auto rounded-xl bg-black/5 p-4 text-xs dark:bg-white/5">{result}</pre>
        )}
      </div>
    </div>
  );
}
