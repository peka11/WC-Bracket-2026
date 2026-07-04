"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";

export function ShareBracket() {
  const { getShareUrl } = usePredictions();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="btn-ghost text-sm"
    >
      {copied ? <Check className="h-4 w-4 text-wc-green" /> : <Copy className="h-4 w-4" />}
      {copied ? "Link copied!" : "Share bracket"}
    </button>
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
