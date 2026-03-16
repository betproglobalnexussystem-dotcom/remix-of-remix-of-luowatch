/**
 * Global music cache — module-level singleton.
 * Starts the Firebase subscription the instant this module is imported.
 * Any component can read from it synchronously with zero wait.
 */
import { subscribeMusic, FireMusic } from "./firestore";
import { orderBy } from "firebase/firestore";

type Listener = (music: FireMusic[]) => void;

let cache: FireMusic[] = [];
let ready = false;
const listeners = new Set<Listener>();
let unsubscribe: (() => void) | null = null;

/** Start the subscription (called once from main.tsx at app boot). */
export function initMusicCache() {
  if (unsubscribe) return; // already started
  unsubscribe = subscribeMusic([orderBy("createdAt", "desc")], (data) => {
    cache = data;
    ready = true;
    listeners.forEach((fn) => fn(data));
  });
}

/** Get all cached music synchronously — empty array if not yet loaded. */
export function getAllMusic(): FireMusic[] {
  return cache;
}

/** Get a single music item by id synchronously — null if not in cache yet. */
export function getMusicFromCache(id: string): FireMusic | null {
  return cache.find((m) => m.id === id) ?? null;
}

/** True once the first snapshot has arrived from Firebase. */
export function isMusicCacheReady(): boolean {
  return ready;
}

/**
 * Subscribe to cache updates.
 * The callback fires immediately with current data if already loaded,
 * then again on every subsequent Firebase update.
 */
export function subscribeToMusicCache(fn: Listener): () => void {
  listeners.add(fn);
  if (ready) fn(cache); // give current data right away
  return () => listeners.delete(fn);
}
