import { useEffect, useState } from 'preact/hooks';
import { getCart, getCartItemCount, onCartChange } from '../lib/cart';

interface MobileTabBarProps {
  currentPath: string;
}

export default function MobileTabBar({ currentPath }: MobileTabBarProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getCartItemCount(getCart()));
    sync();
    return onCartChange(sync);
  }, []);

  const items = [
    { href: '/', label: 'Home', icon: '🏠', active: currentPath === '/' },
    { href: '/#categories', label: 'Categories', icon: '🐾', active: currentPath.startsWith('/category') },
    { href: '/cart', label: 'Cart', icon: '🛒', active: currentPath === '/cart', badge: count }
  ];

  return (
    <nav
      aria-label="Primary"
      class="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-ink/10 bg-cream/95 py-2 backdrop-blur sm:hidden"
    >
      {items.map((item) => (
        <a
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          class={`relative flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
            item.active ? 'text-sage-deep' : 'text-ink-soft'
          }`}
        >
          <span aria-hidden="true" class="text-lg leading-none">
            {item.icon}
          </span>
          {item.label}
          {!!item.badge && (
            <span class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] text-cream">
              {item.badge}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
}
