"use client";

/** Lightweight QR via external API — no extra dependency */
export function QRCodeDisplay({ url, size = 96 }: { url: string; size?: number }) {
  if (!url) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="QR code" width={size} height={size} className="rounded-lg bg-white p-1" />
  );
}
