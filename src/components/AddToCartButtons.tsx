import { useEffect, useState } from 'preact/hooks';
import { addToCart, isInCart, onCartChange, type CartItem } from '../lib/cart';

export default function AddToCartButtons(props: CartItem) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const sync = () => setInCart(isInCart(props.petId));
    sync();
    return onCartChange(sync);
  }, [props.petId]);

  function handleAdd() {
    addToCart(props);
  }

  function handleBuyNow() {
    addToCart(props);
    window.location.href = '/checkout';
  }

  if (inCart) {
    return (
      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/cart"
          class="rounded-full bg-sage/20 px-6 py-4 text-center font-display text-lg text-ink-soft sm:px-10"
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
