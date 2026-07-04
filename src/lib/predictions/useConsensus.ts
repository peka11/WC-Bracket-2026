"use client";

import { useEffect, useState } from "react";
import type { ConsensusData } from "@/lib/predictions/consensus-types";

export function useConsensus() {
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/predictions/consensus", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setConsensus(data as ConsensusData))
      .catch(() => setConsensus(null))
      .finally(() => setLoading(false));
  }, []);

  return { consensus, loading };
}
