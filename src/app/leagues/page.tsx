"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, Link2, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import Link from "next/link";

interface LeagueRow {
  id: string;
  name: string;
  code: string;
  isOwner?: boolean;
  members?: number;
}

const LOCAL_KEY = "wc-2026-leagues";

function loadLocalLeagues(): LeagueRow[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocalLeagues(leagues: LeagueRow[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(leagues));
}

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function LeaguesPage() {
  const { user, configured } = useAuth();
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (user && configured) {
      const res = await fetch("/api/leagues");
      const data = await res.json();
      if (data.leagues) setLeagues(data.leagues);
    } else {
      setLeagues(loadLocalLeagues());
    }
  }, [user, configured]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const join = params.get("join");
    if (join) {
      setJoinCode(join);
      setShowJoin(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const join = params.get("join");
    if (join) {
      setJoinCode(join);
      setShowJoin(true);
    }
  }, []);

  async function createLeague() {
    setError(null);
    if (user && configured) {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setShowCreate(false);
        setName("");
        refresh();
      }
    } else {
      const code = randomCode();
      const league: LeagueRow = { id: crypto.randomUUID(), name: name || "My League", code, isOwner: true, members: 1 };
      const next = [...loadLocalLeagues(), league];
      saveLocalLeagues(next);
      setLeagues(next);
      setShowCreate(false);
      setName("");
    }
  }

  async function joinLeague() {
    setError(null);
    if (user && configured) {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", code: joinCode }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setShowJoin(false);
        setJoinCode("");
        refresh();
      }
    } else {
      const existing = loadLocalLeagues().find((l) => l.code === joinCode.toUpperCase());
      if (!existing) {
        setError("Invalid invite code");
        return;
      }
      setShowJoin(false);
      setJoinCode("");
    }
  }

  function copyInvite(code: string) {
    const url = `${window.location.origin}/leagues?join=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Private Leagues</h1>
          <p className="mt-1 text-gray-500">Compete with friends — share an invite link</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowJoin(true)} className="btn-ghost">
            <Link2 className="h-4 w-4" /> Join
          </button>
          <button type="button" onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
      </div>

      {!user && configured && (
        <p className="rounded-xl bg-wc-gold/10 px-4 py-3 text-sm">
          <Link href="/auth/login" className="font-medium text-wc-green hover:underline">Sign in</Link> to sync leagues across devices.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {showCreate && (
        <div className="glass-card space-y-3 p-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="League name"
            className="w-full rounded-xl border border-black/10 px-4 py-2 dark:border-white/10 dark:bg-gray-900"
          />
          <div className="flex gap-2">
            <button type="button" onClick={createLeague} className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {showJoin && (
        <div className="glass-card space-y-3 p-5">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Invite code"
            className="w-full rounded-xl border border-black/10 px-4 py-2 uppercase dark:border-white/10 dark:bg-gray-900"
          />
          <div className="flex gap-2">
            <button type="button" onClick={joinLeague} className="btn-primary">Join</button>
            <button type="button" onClick={() => setShowJoin(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {leagues.length === 0 && (
          <p className="text-center text-gray-500">No leagues yet — create one and share the invite link.</p>
        )}
        {leagues.map((league) => (
          <div key={league.id} className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wc-green/10">
              <Users className="h-6 w-6 text-wc-green" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{league.name}</p>
              <p className="text-sm text-gray-500">
                Code: {league.code}
                {league.members ? ` · ${league.members} members` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyInvite(league.code)}
              className="btn-ghost text-xs"
            >
              {copied === league.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
