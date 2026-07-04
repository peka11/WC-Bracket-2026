"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Swords, ArrowRight } from "lucide-react";
import { decodePredictionsFromShare } from "@/lib/predictions/store";
import { getChallengeUrl } from "@/lib/predictions/head-to-head";
import { usePredictions } from "@/lib/predictions/PredictionsProvider";

export function ShareClient({ encoded }: { encoded: string }) {
  const router = useRouter();
  const { loadFromShare } = usePredictions();
  const picks = encoded ? decodePredictionsFromShare(encoded) : null;

  useEffect(() => {
    if (encoded && picks) {
      loadFromShare(encoded);
    }
  }, [encoded, picks, loadFromShare]);

  if (!encoded || !picks) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-gray-500">Invalid or missing bracket link.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Go to bracket
        </Link>
      </div>
    );
  }

  const challengeUrl = getChallengeUrl(encoded);

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-wc-gold/15 ring-1 ring-wc-gold/30">
        <Trophy className="h-8 w-8 text-wc-gold" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-bold">{picks.displayName}&apos;s Bracket</h1>
        <p className="mt-2 text-gray-500">Imported to your device — challenge them or edit your own picks.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Link href={challengeUrl} className="btn-primary inline-flex items-center justify-center gap-2 py-3">
          <Swords className="h-4 w-4" />
          Challenge {picks.displayName}
        </Link>
        <button
          type="button"
          onClick={() => router.push("/predictions")}
          className="btn-ghost inline-flex items-center justify-center gap-2 py-3"
        >
          View as my picks <ArrowRight className="h-4 w-4" />
        </button>
        <Link href="/" className="text-sm text-gray-500 hover:text-wc-green">
          ← Back to live bracket
        </Link>
      </div>
    </div>
  );
}
