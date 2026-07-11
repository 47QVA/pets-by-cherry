import { formatPrice } from '../lib/format';

interface PetCardProps {
  id: number;
  name: string;
  breed: string | null;
  priceCents: number;
  photoUrl: string | null;
  index?: number;
}

export default function PetCard({ id, name, breed, priceCents, photoUrl, index = 0 }: PetCardProps) {
  return (
    <a
      href={`/pet/${id}`}
      class="group relative block overflow-hidden rounded-3xl bg-cream shadow-sm ring-1 ring-ink/5 transition-transform duration-300 ease-out motion-safe:animate-card-in hover:-translate-y-1 hover:shadow-lg"
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
          <div class="h-full w-full bg-sage/40" />
        )}
        <span
          aria-hidden="true"
          class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-ink-soft shadow-sm"
        >
          ♡
        </span>
      </div>
      <div class="space-y-0.5 p-3">
        <p class="truncate font-display text-lg text-ink">{name}</p>
        {breed && <p class="truncate text-sm text-ink-soft">{breed}</p>}
        <p class="pt-1 font-display text-base text-coral">{formatPrice(priceCents)}</p>
      </div>
    </a>
  );
}
