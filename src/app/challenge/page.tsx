import type { Metadata } from "next";
import { decodePredictionsFromShare } from "@/lib/predictions/store";
import { ChallengeClient } from "./ChallengeClient";

type Props = { searchParams: { vs?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const vs = searchParams.vs ?? "";
  const picks = vs ? decodePredictionsFromShare(vs) : null;
  const name = picks?.displayName ?? "Someone";
  const ogImage = picks ? `/api/og?b=${encodeURIComponent(vs)}` : "/api/og?b=";

  return {
    title: `Challenge ${name}'s Bracket`,
    description: `Can you beat ${name} in the World Cup 2026 bracket challenge?`,
    openGraph: {
      title: `Challenge ${name}'s Bracket`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default function ChallengePage() {
  return <ChallengeClient />;
}
