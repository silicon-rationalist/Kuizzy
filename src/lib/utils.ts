// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Fisher-Yates shuffle (returns a new array) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Generate a short unique ID */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Format seconds into MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/** Format a timestamp into a readable date */
export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

/** Clamp a number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Pick a random subset of size n from array */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
