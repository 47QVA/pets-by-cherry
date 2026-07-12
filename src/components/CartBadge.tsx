import { useEffect, useState } from 'preact/hooks';
import { getCart, getCartItemCount, onCartChange } from '../lib/cart';

export default function CartBadge() {
  const [count, setCount] = useState(0);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const sync = () => setCount(getCartItemCount(getCart()));
    sync();
    return onCartChange(sync);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setBounce(true);
    const timeout = setTimeout(() => setBounce(false), 300);
    return () => clearTimeout(timeout);
  }, [count]);

  return (
    <a
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      class="relative flex h-10 w-10 items-center justify-center bg-white text-ink border border-black/10"
    >
      <span aria-hidden="true">🛒</span>
      {count > 0 && (
        <span
          class={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-accent px-1 text-xs font-medium text-white motion-safe:transition-transform motion-safe:duration-200 ${
            bounce ? 'motion-safe:scale-125' : 'motion-safe:scale-100'
          }`}
        >
          {count}
        </span>
      )}
    </a>
  );
}
