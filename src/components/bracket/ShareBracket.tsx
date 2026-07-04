"use client";

import { useState } from "react";
import { Copy, Check, Swords, Share2, RefreshCw } from "lucide-react";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";

export function ShareBracket() {
  const { getShareUrl, getChallengeLink } = usePredictions();
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  const copyShare = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const copyChallenge = async () => {
    await navigator.clipboard.writeText(getChallengeLink());
    setCopiedChallenge(true);
    setTimeout(() => setCopiedChallenge(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copyShare} className="btn-ghost text-sm">
        {copiedShare ? <Check className="h-4 w-4 text-wc-green" /> : <Share2 className="h-4 w-4" />}
        {copiedShare ? "Link copied!" : "Share bracket"}
      </button>
      <button type="button" onClick={copyChallenge} className="btn-primary text-sm">
        {copiedChallenge ? <Check className="h-4 w-4" /> : <Swords className="h-4 w-4" />}
        {copiedChallenge ? "Copied!" : "Challenge a friend"}
      </button>
    </div>
  );
}

export function SyncIndicator({ syncing, onRefresh }: { syncing?: boolean; onRefresh?: () => void }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      className="btn-ghost text-xs text-gray-500"
      disabled={syncing}
    >
      <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing…" : "Refresh"}
    </button>
  );
}
