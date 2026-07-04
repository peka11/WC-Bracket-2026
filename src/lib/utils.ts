import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function flagUrl(code: string, size = 80) {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

export function polarToCartesian(cx: number, cy: number, radius: number, angleDegrees: number) {
  const rad = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}
