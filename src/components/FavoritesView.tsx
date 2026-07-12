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
      <div class="bg-white p-8 text-center border border-black/10">
        <p class="text-gray">No favourites yet. Tap the heart on a pet or product to save it here.</p>
        <a href="/" class="mt-4 inline-block bg-blue px-6 py-3 font-medium text-white">
          Browse pets
        </a>
      </div>
    );
  }

  return (
    <ul class="space-y-3">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} class="flex items-center gap-4 bg-white p-3 border border-black/5">
          <a href={`/${item.kind}/${item.id}`} class="flex flex-1 items-center gap-4">
            <div class="h-16 w-16 shrink-0 overflow-hidden bg-surface">
              {item.photoUrl && <img src={item.photoUrl} alt={item.name} class="h-full w-full object-cover" />}
            </div>
            <div class="flex-1">
              <p class="font-display text-lg text-ink">{item.name}</p>
              <p class="text-sm text-gray">{formatPrice(item.priceCents)}</p>
            </div>
          </a>
          <button
            type="button"
            onClick={() => toggleFavorite(item)}
            aria-label={`Remove ${item.name} from favourites`}
            class="text-gray underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
