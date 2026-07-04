"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Activity, Database, Key, Shield, Save } from "lucide-react";
import { buildInitialMatches } from "@/lib/data/tournament";
import type { Match } from "@/lib/types";

const KEY_STORAGE = "wc-admin-key";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [override, setOverride] = useState({ homeScore: "", awayScore: "", status: "finished", winnerTeamId: "" });
  const [overrideMsg, setOverrideMsg] = useState<string | null>(null);

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORAGE);
    if (k) setAdminKey(k);
    setMatches(buildInitialMatches());
    setSelectedId(buildInitialMatches()[0]?.id ?? "");
  }, []);

  const headers = () => ({
    "Content-Type": "application/json",
    "x-admin-key": adminKey,
  });

  const saveKey = () => {
    sessionStorage.setItem(KEY_STORAGE, adminKey);
  };

  const loadHealth = async () => {
    const res = await fetch("/api/admin/override", { headers: headers() });
    const data = await res.json();
    setHealth(data);
  };

  const triggerSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ source: "admin" }),
      });
      setSyncResult(JSON.stringify(await res.json(), null, 2));
      await loadHealth();
    } catch (e) {
      setSyncResult(e instanceof Error ? e.message : "Failed");
    } finally {
      setSyncing(false);
    }
  };

  const applyOverride = async () => {
    setOverrideMsg(null);
    const res = await fetch("/api/admin/override", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        matchId: selectedId,
        homeScore: override.homeScore === "" ? undefined : Number(override.homeScore),
        awayScore: override.awayScore === "" ? undefined : Number(override.awayScore),
        status: override.status,
        winnerTeamId: override.winnerTeamId || null,
      }),
    });
    const data = await res.json();
    setOverrideMsg(res.ok ? "Override saved" : JSON.stringify(data));
  };

  useEffect(() => {
    if (adminKey) loadHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  const selected = matches.find((m) => m.id === selectedId);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold">
          <Shield className="h-8 w-8 text-wc-green" /> Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-500">Sync, health monitoring, and manual result overrides</p>
      </div>

      <div className="glass-card space-y-3 p-5">
        <label className="block text-sm font-medium">Admin key (CRON_SECRET)</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="flex-1 rounded-xl border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-gray-900"
            placeholder="Enter CRON_SECRET"
          />
          <button type="button" onClick={saveKey} className="btn-ghost">Save</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Activity, label: "API status", value: health?.footballApiConfigured ? "Configured" : "Demo mode", ok: !!health?.footballApiConfigured },
          { icon: Database, label: "Last snapshot", value: (health?.lastSnapshot as string) ?? "—", ok: !!health?.lastSnapshot },
          { icon: Key, label: "Provider health", value: (health?.health as { is_healthy?: boolean })?.is_healthy ? "Healthy" : "Unknown", ok: !!(health?.health as { is_healthy?: boolean })?.is_healthy },
        ].map(({ icon: Icon, label, value, ok }) => (
          <div key={label} className="glass-card p-5">
            <Icon className={`mb-2 h-5 w-5 ${ok ? "text-wc-green" : "text-gray-400"}`} />
            <p className="text-sm text-gray-500">{label}</p>
            <p className="truncate text-sm font-medium">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="glass-card space-y-4 p-6">
        <h2 className="font-display font-semibold">Manual sync</h2>
        <button type="button" onClick={triggerSync} disabled={syncing || !adminKey} className="btn-primary">
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Replay sync from API-Football"}
        </button>
        {syncResult && <pre className="overflow-auto rounded-xl bg-black/5 p-4 text-xs dark:bg-white/5">{syncResult}</pre>}
      </div>

      <div className="glass-card space-y-4 p-6">
        <h2 className="font-display font-semibold">Manual result override</h2>
        <p className="text-sm text-gray-500">Fix wrong API scores instantly. Updates bracket advancement.</p>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-3 py-2 dark:border-white/20"
        >
          {matches.map((m) => (
            <option key={m.id} value={m.id}>{m.id} · {m.round} #{m.matchNumber}</option>
          ))}
        </select>
        {selected && (
          <p className="text-xs text-gray-400">
            {selected.homeTeamId} vs {selected.awayTeamId} · current {selected.homeScore ?? "-"}–{selected.awayScore ?? "-"}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Home score" value={override.homeScore} onChange={(e) => setOverride({ ...override, homeScore: e.target.value })} className="score-input w-full" />
          <input placeholder="Away score" value={override.awayScore} onChange={(e) => setOverride({ ...override, awayScore: e.target.value })} className="score-input w-full" />
          <select value={override.status} onChange={(e) => setOverride({ ...override, status: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-white/20">
            <option value="not_started">Not started</option>
            <option value="live">Live</option>
            <option value="finished">Finished</option>
          </select>
          <input placeholder="Winner team id (e.g. arg)" value={override.winnerTeamId} onChange={(e) => setOverride({ ...override, winnerTeamId: e.target.value })} className="rounded-xl border px-3 py-2 dark:border-white/20" />
        </div>
        <button type="button" onClick={applyOverride} disabled={!adminKey} className="btn-primary">
          <Save className="h-4 w-4" /> Apply override
        </button>
        {overrideMsg && <p className="text-sm text-wc-green">{overrideMsg}</p>}
      </div>

      {Array.isArray(health?.recentLogs) && (health.recentLogs as unknown[]).length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-display mb-3 font-semibold">Recent sync logs</h2>
          <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(health.recentLogs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
