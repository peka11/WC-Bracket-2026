"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

interface LeaguePreview {
  id: string;
  name: string;
  code: string;
  members?: number;
}

const LOCAL_KEY = "wc-2026-leagues";

function loadLocalLeagues() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as LeaguePreview[];
  } catch {
    return [];
  }
}

function saveLocalLeagues(leagues: LeaguePreview[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(leagues));
}

export default function JoinLeaguePage({ params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const router = useRouter();
  const { user, configured } = useAuth();
  const [league, setLeague] = useState<LeaguePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/leagues/join/${code}` : "";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      if (configured) {
        const res = await fetch(`/api/leagues?code=${encodeURIComponent(code)}`);
        if (!res.ok) {
          setError("League not found — check the invite code");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLeague(data.league);
      } else {
        const local = loadLocalLeagues().find((l) => l.code === code);
        if (local) setLeague(local);
        else setError("League not found — check the invite code");
      }
      setLoading(false);
    }
    load();
  }, [code, configured]);

  const join = useCallback(async () => {
    setJoining(true);
    setError(null);
    if (configured && user) {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", code }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setJoining(false);
        return;
      }
      setJoined(true);
      setJoining(false);
      return;
    }
    if (configured && !user) {
      router.push(`/auth/login?next=/leagues/join/${code}`);
      return;
    }
    const existing = loadLocalLeagues();
    const found = existing.find((l) => l.code === code);
    if (found) {
      setJoined(true);
      setJoining(false);
      return;
    }
    if (league) {
      saveLocalLeagues([...existing, { ...league, members: (league.members ?? 0) + 1 }]);
      setJoined(true);
    }
    setJoining(false);
  }, [code, configured, league, router, user]);

  function copyLink() {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-wc-green" />
        <p className="text-gray-500">Loading invite…</p>
      </div>
    );
  }

  if (error && !league) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/leagues" className="btn-primary inline-flex">
          Go to leagues
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-wc-green">League invite</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Join {league?.name}</h1>
        <p className="mt-2 text-gray-500">Code: {code}</p>
      </div>

      <div className="glass-card flex flex-col items-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-wc-green/10">
          <Users className="h-7 w-7 text-wc-green" />
        </div>
        {league?.members != null && (
          <p className="text-sm text-gray-500">{league.members} member{league.members === 1 ? "" : "s"} already in</p>
        )}
        {inviteUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteUrl)}`}
              alt={`QR code to join ${league?.name}`}
              width={200}
              height={200}
              className="rounded-xl ring-1 ring-black/10"
            />
            <p className="text-center text-xs text-gray-400">Scan to join on your phone</p>
          </>
        )}
        <button type="button" onClick={copyLink} className="btn-ghost text-sm">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          Copy invite link
        </button>
      </div>

      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      {joined ? (
        <div className="space-y-4 text-center">
          <p className="flex items-center justify-center gap-2 font-semibold text-wc-green">
            <Check className="h-5 w-5" /> You&apos;re in!
          </p>
          <Link href="/leagues" className="btn-primary inline-flex">
            View my leagues
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <button type="button" onClick={join} disabled={joining} className="btn-primary w-full py-3">
            {joining ? "Joining…" : configured && !user ? "Sign in to join" : "Join league"}
          </button>
          {!user && configured && (
            <p className="text-center text-xs text-gray-400">
              You need an account to sync league standings across devices
            </p>
          )}
        </div>
      )}
    </div>
  );
}
