import { useEffect, useState } from 'preact/hooks';
import { getFavorites, onFavoritesChange } from '../lib/favorites';

export default function FavoritesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getFavorites().length);
    sync();
    return onFavoritesChange(sync);
  }, []);

  return (
    <a
      href="/favourites"
      aria-label={`Favourites, ${count} item${count === 1 ? '' : 's'}`}
      class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink ring-1 ring-ink/10"
    >
      <span aria-hidden="true">{count > 0 ? '♥' : '♡'}</span>
      {count > 0 && (
        <span class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-xs font-medium text-cream">
          {count}
        </span>
      )}
    </a>
  );
}
