import { useEffect, useState } from 'preact/hooks';
import { getCart, onCartChange } from '../lib/cart';

export default function CartBadge() {
  const [count, setCount] = useState(0);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const sync = () => setCount(getCart().length);
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
      class="relative flex h-10 w-10 items-center justify-center rounded-full bg-sage/20 text-ink"
    >
      <span aria-hidden="true">🛒</span>
      {count > 0 && (
        <span
          class={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-xs font-medium text-cream motion-safe:transition-transform motion-safe:duration-200 ${
            bounce ? 'motion-safe:scale-125' : 'motion-safe:scale-100'
          }`}
        >
          {count}
        </span>
      )}
    </a>
  );
}
