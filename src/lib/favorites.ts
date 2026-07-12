export type FavoriteKind = 'pet' | 'product';

export interface FavoriteItem {
  kind: FavoriteKind;
  id: number;
  name: string;
  priceCents: number;
  photoUrl: string | null;
}

const STORAGE_KEY = 'pbc_favorites';
const CHANGE_EVENT = 'pbc-favorites-changed';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getFavorites(): FavoriteItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]): void {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function isFavorited(kind: FavoriteKind, id: number): boolean {
  return getFavorites().some((item) => item.kind === kind && item.id === id);
}

export function toggleFavorite(item: FavoriteItem): void {
  const items = getFavorites();
  const exists = items.some((existing) => existing.kind === item.kind && existing.id === item.id);
  saveFavorites(
    exists
      ? items.filter((existing) => !(existing.kind === item.kind && existing.id === item.id))
      : [...items, item]
  );
}

export function onFavoritesChange(handler: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
