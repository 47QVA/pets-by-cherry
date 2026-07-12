import { useEffect, useState } from 'preact/hooks';
import { getFavorites, onFavoritesChange, toggleFavorite, type FavoriteItem } from '../lib/favorites';
import { formatPrice } from '../lib/format';

export default function FavoritesView() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(getFavorites());
    sync();
    setReady(true);
    return onFavoritesChange(sync);
  }, []);

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div class="rounded-2xl bg-white p-8 text-center ring-1 ring-ink/10">
        <p class="text-ink-soft">No favourites yet. Tap the heart on a pet or product to save it here.</p>
        <a href="/" class="mt-4 inline-block rounded-full bg-sage-deep px-6 py-3 font-medium text-cream">
          Browse pets
        </a>
      </div>
    );
  }

  return (
    <ul class="space-y-3">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} class="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-ink/5">
          {item.kind === 'pet' ? (
            <a href={`/pet/${item.id}`} class="flex flex-1 items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage/30">
                {item.photoUrl && <img src={item.photoUrl} alt={item.name} class="h-full w-full object-cover" />}
              </div>
              <div class="flex-1">
                <p class="font-display text-lg text-ink">{item.name}</p>
                <p class="text-sm text-ink-soft">{formatPrice(item.priceCents)}</p>
              </div>
            </a>
          ) : (
            <div class="flex flex-1 items-center gap-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sage/30">
                {item.photoUrl && <img src={item.photoUrl} alt={item.name} class="h-full w-full object-cover" />}
              </div>
              <div class="flex-1">
                <p class="font-display text-lg text-ink">{item.name}</p>
                <p class="text-sm text-ink-soft">{formatPrice(item.priceCents)}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(item)}
            aria-label={`Remove ${item.name} from favourites`}
            class="text-ink-soft underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
