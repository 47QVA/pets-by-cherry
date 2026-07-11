export interface CartItem {
  petId: number;
  name: string;
  priceCents: number;
  photoUrl: string | null;
}

const STORAGE_KEY = 'pbc_cart';
const CHANGE_EVENT = 'pbc-cart-changed';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function isInCart(petId: number): boolean {
  return getCart().some((item) => item.petId === petId);
}

export function addToCart(item: CartItem): void {
  const items = getCart();
  if (items.some((existing) => existing.petId === item.petId)) return;
  saveCart([...items, item]);
}

export function removeFromCart(petId: number): void {
  saveCart(getCart().filter((item) => item.petId !== petId));
}

export function clearCart(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents, 0);
}

export function onCartChange(handler: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
