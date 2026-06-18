import type { Pin } from "@/types/pin";

/**
 * Saved ("pinned") pins, persisted in localStorage. No auth/backend — per-device.
 * Stores the full Pin so /saved can render without a DB round-trip.
 */
const KEY = "recon:saved:v1";
export const SAVED_EVENT = "recon:saved-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readSavedPins(): Pin[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Pin[]) : [];
  } catch {
    return [];
  }
}

function write(pins: Pin[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(pins));
  // Notify listeners in the same tab (storage event only fires cross-tab).
  window.dispatchEvent(new CustomEvent(SAVED_EVENT));
}

export function isSaved(postId: string): boolean {
  return readSavedPins().some((p) => p.postId === postId);
}

/** Add or remove the pin. Returns the new saved state (true = now saved). */
export function toggleSavedPin(pin: Pin): boolean {
  const current = readSavedPins();
  const exists = current.some((p) => p.postId === pin.postId);
  if (exists) {
    write(current.filter((p) => p.postId !== pin.postId));
    return false;
  }
  write([pin, ...current]);
  return true;
}

export function removeSavedPin(postId: string): void {
  write(readSavedPins().filter((p) => p.postId !== postId));
}
