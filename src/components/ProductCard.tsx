import { useEffect, useState } from 'preact/hooks';
import { addToCart, isInCart, onCartChange } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { isFavorited, onFavoritesChange, toggleFavorite } from '../lib/favorites';

interface ProductCardProps {
  id: number;
  name: string;
  priceCents: number;
  photoUrl: string | null;
  stockCount: number;
  index?: number;
}

export default function ProductCard({ id, name, priceCents, photoUrl, stockCount, index = 0 }: ProductCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    const syncFavorite = () => setFavorited(isFavorited('product', id));
    syncFavorite();
    const unsubFavorite = onFavoritesChange(syncFavorite);

    const syncCart = () => setInCart(isInCart('product', id));
    syncCart();
    const unsubCart = onCartChange(syncCart);

    return () => {
      unsubFavorite();
      unsubCart();
    };
  }, [id]);

  function handleAdd(e: MouseEvent) {
    e.preventDefault();
    addToCart({ kind: 'product', id, name, priceCents, photoUrl });
  }

  function handleToggleFavorite(e: MouseEvent) {
    e.preventDefault();
    toggleFavorite({ kind: 'product', id, name, priceCents, photoUrl });
  }

  return (
    <a
      href={`/product/${id}`}
      class="group relative block overflow-hidden bg-white shadow-sm border border-black/5 motion-safe:animate-card-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div class="relative aspect-square overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div class="h-full w-full bg-surface" />
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorited ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
          aria-pressed={favorited}
          class={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-white/90 shadow-sm ${
            favorited ? 'text-accent' : 'text-gray'
          }`}
        >
          <span aria-hidden="true">{favorited ? '♥' : '♡'}</span>
        </button>
      </div>
      <div class="space-y-1 p-3">
        <p class="truncate font-display text-base text-ink">{name}</p>
        <p class="font-display text-base text-accent">{formatPrice(priceCents)}</p>
        {stockCount <= 3 && stockCount > 0 && (
          <p class="text-xs text-accent">Only {stockCount} left</p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          class={`mt-1 w-full px-4 py-2 text-sm text-white ${inCart ? 'bg-ink' : 'bg-blue'}`}
        >
          {inCart ? 'In cart ✓' : 'Add to cart'}
        </button>
      </div>
    </a>
  );
}
