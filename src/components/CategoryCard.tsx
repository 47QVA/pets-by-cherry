interface CategoryCardProps {
  name: string;
  slug: string;
  photoUrl: string | null;
  index?: number;
}

export default function CategoryCard({ name, slug, photoUrl, index = 0 }: CategoryCardProps) {
  return (
    <a
      href={`/category/${slug}`}
      class="group relative block aspect-[4/5] overflow-hidden bg-surface shadow-sm transition-transform duration-300 ease-out motion-safe:animate-card-in hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 80}ms` }}
    >
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
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent p-4">
        <span class="font-display text-xl text-white drop-shadow-sm">{name}</span>
      </div>
    </a>
  );
}
