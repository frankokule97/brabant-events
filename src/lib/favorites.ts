const STORAGE_KEY = "brabantEvents:favorites:v1";

export function getFavoriteIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().has(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === "undefined") return false;

  const set = getFavoriteIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  return set.has(id); // here I return the new state!
}
