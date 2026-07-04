"use client";

import { BracketPanel } from "@/components/bracket/BracketPanel";
import { BracketZoomContainer } from "@/components/bracket/BracketZoomContainer";

export default function EmbedBracketPage() {
  return (
    <div className="min-h-[480px] bg-[#071a10] p-2">
      <BracketZoomContainer>
        <div className="bracket-export-svg">
          <BracketPanel />
        </div>
      </BracketZoomContainer>
      <p className="mt-2 text-center text-[10px] text-white/40">
        <a href="/" target="_blank" rel="noopener noreferrer" className="hover:text-wc-green">
          WC Bracket Challenge
        </a>
      </p>
    </div>
  );
}
