import { useEffect, useState } from 'preact/hooks';
import { addToCart, isInCart, onCartChange, type CartItem, type CartItemKind } from '../lib/cart';

interface AddToCartButtonsProps {
  kind: CartItemKind;
  id: number;
  name: string;
  priceCents: number;
  photoUrl: string | null;
}

export default function AddToCartButtons({ kind, id, name, priceCents, photoUrl }: AddToCartButtonsProps) {
  const [inCart, setInCart] = useState(false);
  const item: Omit<CartItem, 'quantity'> = { kind, id, name, priceCents, photoUrl };

  useEffect(() => {
    const sync = () => setInCart(isInCart(kind, id));
    sync();
    return onCartChange(sync);
  }, [kind, id]);

  function handleAdd() {
    addToCart(item);
  }

  function handleBuyNow() {
    addToCart(item);
    window.location.href = '/checkout';
  }

  if (inCart) {
    return (
      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/cart"
          class="rounded-full bg-white px-6 py-4 text-center font-display text-lg text-ink-soft ring-1 ring-ink/10 sm:px-10"
        >
          In your cart · View cart
        </a>
        <a
          href="/checkout"
          class="rounded-full bg-coral px-6 py-4 text-center font-display text-lg text-cream sm:px-10"
        >
          Buy now
        </a>
      </div>
    );
  }

  return (
    <div class="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleAdd}
        class="rounded-full bg-sage-deep px-6 py-4 font-display text-lg text-cream sm:px-10"
      >
        Add to cart
      </button>
      <button
        type="button"
        onClick={handleBuyNow}
        class="rounded-full bg-coral px-6 py-4 font-display text-lg text-cream sm:px-10"
      >
        Buy now
      </button>
    </div>
  );
}
