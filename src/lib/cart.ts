export type CartItemKind = 'pet' | 'product';

export interface CartItem {
  kind: CartItemKind;
  id: number;
  name: string;
  priceCents: number;
  photoUrl: string | null;
  quantity: number;
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

function findIndex(items: CartItem[], kind: CartItemKind, id: number): number {
  return items.findIndex((item) => item.kind === kind && item.id === id);
}

export function isInCart(kind: CartItemKind, id: number): boolean {
  return findIndex(getCart(), kind, id) !== -1;
}

/** Pets are unique individual animals, so quantity is always capped at 1. */
export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
  const items = getCart();
  const index = findIndex(items, item.kind, item.id);

  if (item.kind === 'pet') {
    if (index === -1) saveCart([...items, { ...item, quantity: 1 }]);
    return;
  }

  if (index === -1) {
    saveCart([...items, { ...item, quantity }]);
  } else {
    const next = [...items];
    next[index] = { ...next[index], quantity: next[index].quantity + quantity };
    saveCart(next);
  }
}

export function setQuantity(kind: CartItemKind, id: number, quantity: number): void {
  const items = getCart();
  if (quantity <= 0) {
    saveCart(items.filter((item) => !(item.kind === kind && item.id === id)));
    return;
  }
  const next = items.map((item) => (item.kind === kind && item.id === id ? { ...item, quantity } : item));
  saveCart(next);
}

export function removeFromCart(kind: CartItemKind, id: number): void {
  saveCart(getCart().filter((item) => !(item.kind === kind && item.id === id)));
}

export function clearCart(): void {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
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
