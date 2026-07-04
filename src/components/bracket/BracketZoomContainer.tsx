"use client";

import { useCallback, useRef, useState, type ReactNode, type WheelEvent } from "react";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface BracketZoomContainerProps {
  children: ReactNode;
  className?: string;
}

export function BracketZoomContainer({ children, className }: BracketZoomContainerProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(2.5, Math.max(0.5, s - e.deltaY * 0.001)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPan((p) => ({
      x: p.x + e.clientX - last.current.x,
      y: p.y + e.clientY - last.current.y,
    }));
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        <button type="button" className="btn-ghost p-2" onClick={() => setScale((s) => Math.min(2.5, s + 0.2))} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button type="button" className="btn-ghost p-2" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button type="button" className="btn-ghost p-2" onClick={reset} aria-label="Reset zoom">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-2 right-2 z-10 hidden h-16 w-16 rounded-lg border border-white/20 bg-black/40 sm:block">
        <div
          className="absolute rounded border border-wc-gold/60 bg-wc-gold/20"
          style={{
            width: `${Math.min(100, 100 / scale)}%`,
            height: `${Math.min(100, 100 / scale)}%`,
            left: `${50 - pan.x / 20 - 50 / scale}%`,
            top: `${50 - pan.y / 20 - 50 / scale}%`,
          }}
        />
      </div>

      <p className="mb-2 text-center text-[10px] text-gray-400 sm:hidden">
        Pinch or scroll to zoom · drag when zoomed
      </p>

      <div
        className="touch-pan-y overflow-hidden rounded-xl"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ touchAction: scale > 1 ? "none" : "pan-y" }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 0.15s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
