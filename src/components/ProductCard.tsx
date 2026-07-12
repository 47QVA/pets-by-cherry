import { useEffect, useState } from 'preact/hooks';
import { addToCart } from '../lib/cart';
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

  useEffect(() => {
    const sync = () => setFavorited(isFavorited('product', id));
    sync();
    return onFavoritesChange(sync);
  }, [id]);

  function handleAdd() {
    addToCart({ kind: 'product', id, name, priceCents, photoUrl });
  }

  function handleToggleFavorite() {
    toggleFavorite({ kind: 'product', id, name, priceCents, photoUrl });
  }

  return (
    <div
      class="relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 motion-safe:animate-card-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div class="relative aspect-square overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={name} class="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div class="h-full w-full bg-sage/15" />
        )}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={favorited ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
          aria-pressed={favorited}
          class={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 shadow-sm ${
            favorited ? 'text-coral' : 'text-ink-soft'
          }`}
        >
          <span aria-hidden="true">{favorited ? '♥' : '♡'}</span>
        </button>
      </div>
      <div class="space-y-1 p-3">
        <p class="truncate font-display text-base text-ink">{name}</p>
        <p class="font-display text-base text-coral">{formatPrice(priceCents)}</p>
        {stockCount <= 3 && stockCount > 0 && (
          <p class="text-xs text-coral">Only {stockCount} left</p>
        )}
        <button
          type="button"
          onClick={handleAdd}
          class="mt-1 w-full rounded-full bg-sage-deep px-4 py-2 text-sm text-cream"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
