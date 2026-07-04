import type { UserPredictions } from "./types";
import { PREDICTIONS_STORAGE_KEY, emptyPredictions } from "./types";

export function loadPredictions(): UserPredictions {
  if (typeof window === "undefined") return emptyPredictions();
  try {
    const raw = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if (!raw) return emptyPredictions();
    return { ...emptyPredictions(), ...JSON.parse(raw) };
  } catch {
    return emptyPredictions();
  }
}

export function savePredictions(picks: UserPredictions): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    PREDICTIONS_STORAGE_KEY,
    JSON.stringify({ ...picks, updatedAt: new Date().toISOString() })
  );
}

export function encodePredictionsForShare(picks: UserPredictions): string {
  const json = JSON.stringify(picks);
  if (typeof window !== "undefined") {
    return btoa(unescape(encodeURIComponent(json)));
  }
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodePredictionsFromShare(encoded: string): UserPredictions | null {
  try {
    let json: string;
    if (typeof window !== "undefined") {
      json = decodeURIComponent(escape(atob(encoded)));
    } else {
      json = Buffer.from(encoded, "base64url").toString("utf-8");
    }
    return { ...emptyPredictions(), ...JSON.parse(json) };
  } catch {
    return null;
  }
}
