import { useEffect, useState } from 'preact/hooks';
import { getCart, getCartTotal, onCartChange, removeFromCart, setQuantity, type CartItem } from '../lib/cart';
import { formatPrice } from '../lib/format';

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    setReady(true);
    return onCartChange(sync);
  }, []);

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div class="rounded-2xl bg-white ring-1 ring-ink/10 p-8 text-center">
        <p class="text-ink-soft">Your cart is empty.</p>
        <a href="/" class="mt-4 inline-block rounded-full bg-sage-deep px-6 py-3 font-medium text-cream">
          Browse pets
        </a>
      </div>
    );
  }

  return (
    <div>
      <ul class="space-y-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`} class="flex items-center gap-4 rounded-2xl bg-cream p-3 ring-1 ring-ink/5">
            <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage/30">
              {item.photoUrl && <img src={item.photoUrl} alt={item.name} class="h-full w-full object-cover" />}
            </div>
            <div class="flex-1">
              <p class="font-display text-lg text-ink">{item.name}</p>
              <p class="text-sm text-ink-soft">{formatPrice(item.priceCents)}</p>
            </div>

            {item.kind === 'product' ? (
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(item.kind, item.id, item.quantity - 1)}
                  aria-label={`Decrease quantity of ${item.name}`}
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10"
                >
                  −
                </button>
                <span class="w-5 text-center text-ink">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(item.kind, item.id, item.quantity + 1)}
                  aria-label={`Increase quantity of ${item.name}`}
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => removeFromCart(item.kind, item.id)}
                aria-label={`Remove ${item.name} from cart`}
                class="text-ink-soft underline"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <div class="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
        <span class="font-display text-lg text-ink">Total</span>
        <span class="font-display text-xl text-coral">{formatPrice(getCartTotal(items))}</span>
      </div>

      <a
        href="/checkout"
        class="mt-6 block rounded-full bg-coral px-6 py-4 text-center font-display text-lg text-cream"
      >
        Proceed to checkout
      </a>
    </div>
  );
}
