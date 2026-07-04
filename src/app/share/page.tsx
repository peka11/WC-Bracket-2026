import type { Metadata } from "next";
import { decodePredictionsFromShare } from "@/lib/predictions/store";
import { ShareClient } from "./ShareClient";

type Props = { searchParams: { b?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const b = searchParams.b ?? "";
  const picks = b ? decodePredictionsFromShare(b) : null;
  const name = picks?.displayName ?? "Someone";
  const ogImage = `/api/og?b=${encodeURIComponent(b)}`;

  return {
    title: `${name}'s World Cup Bracket`,
    description: `See ${name}'s World Cup 2026 picks and challenge their bracket.`,
    openGraph: {
      title: `${name}'s World Cup Bracket`,
      description: "Challenge this bracket — World Cup 2026 Knockout Challenge",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name}'s bracket` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name}'s World Cup Bracket`,
      images: [ogImage],
    },
  };
}

export default function SharePage({ searchParams }: Props) {
  return <ShareClient encoded={searchParams.b ?? ""} />;
}
