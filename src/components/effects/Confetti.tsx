"use client";

import { useCallback, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

const COLORS = ["#00A651", "#C5A028", "#FFFFFF", "#E8C547", "#1a4d2e"];

export function fireConfetti(durationMs = 2500) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:9999;pointer-events:none;width:100%;height:100%";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const particles: Particle[] = Array.from({ length: 120 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: window.innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -14 - 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    life: 1,
  }));

  const start = performance.now();

  function frame(now: number) {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.life -= 0.012;
      if (p.life <= 0) continue;
      alive++;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    }
    ctx.globalAlpha = 1;
    if (alive > 0 && now - start < durationMs) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(frame);
}

export function useConfetti() {
  const fired = useRef(false);
  return useCallback((force = false) => {
    if (!force && fired.current) return;
    fired.current = true;
    fireConfetti();
  }, []);
}
