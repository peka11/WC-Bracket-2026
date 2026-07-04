"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, Plus, Link2, Copy, Check, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

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

function inviteUrl(code: string) {
  if (typeof window === "undefined") return `/leagues/join/${code}`;
  return `${window.location.origin}/leagues/join/${code}`;
}

export default function LeaguesPage() {
  const { user, configured } = useAuth();
  const [leagues, setLeagues] = useState<LeagueRow[]>([]);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
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
      window.location.replace(`/leagues/join/${join.toUpperCase()}`);
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
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    window.location.href = `/leagues/join/${code}`;
  }

  function copyInvite(code: string) {
    const url = inviteUrl(code);
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Private Leagues</h1>
          <p className="mt-1 text-gray-500">Compete with friends — share an invite link or QR code</p>
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
            <button type="button" onClick={joinLeague} className="btn-primary">Continue</button>
            <button type="button" onClick={() => setShowJoin(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {leagues.length === 0 && (
          <p className="text-center text-gray-500">No leagues yet — create one and share the invite link.</p>
        )}
        {leagues.map((league) => {
          const url = inviteUrl(league.code);
          const showQr = qrCode === league.code;
          return (
            <div key={league.id} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-wc-green/10">
                  <Users className="h-6 w-6 text-wc-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{league.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    Code: {league.code}
                    {league.members ? ` · ${league.members} members` : ""}
                  </p>
                  <Link
                    href={`/leagues/join/${league.code}`}
                    className="text-xs text-wc-green hover:underline"
                  >
                    {url.replace(/^https?:\/\//, "")}
                  </Link>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setQrCode(showQr ? null : league.code)}
                    className="btn-ghost text-xs"
                  >
                    <QrCode className="h-4 w-4" />
                    QR
                  </button>
                  <button
                    type="button"
                    onClick={() => copyInvite(league.code)}
                    className="btn-ghost text-xs"
                  >
                    {copied === league.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copy
                  </button>
                </div>
              </div>
              {showQr && (
                <div className="mt-4 flex flex-col items-center gap-2 border-t border-black/5 pt-4 dark:border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`}
                    alt={`QR code for ${league.name}`}
                    width={180}
                    height={180}
                    className="rounded-xl ring-1 ring-black/10"
                  />
                  <p className="text-xs text-gray-400">Friends scan this to join instantly</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
