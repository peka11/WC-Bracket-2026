"use client";

import { Download } from "lucide-react";

export function BracketPosterButton() {
  const downloadSvg = () => {
    const svg = document.querySelector(".bracket-export-svg");
    if (!svg) {
      window.print();
      return;
    }
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wc-2026-bracket.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={downloadSvg} className="btn-ghost text-sm">
      <Download className="h-4 w-4" /> Download bracket poster
    </button>
  );
}
