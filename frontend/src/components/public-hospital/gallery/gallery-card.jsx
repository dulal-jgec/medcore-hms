import PublicImage from "@/components/public-hospital/shared/public-image";

export default function GalleryCard({ image }) {
  const category = image.category
    ? image.category.replaceAll("_", " ")
    : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image.imageUrl ? (
          <PublicImage
            src={image.imageUrl}
            alt={image.title || "Hospital image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              No image
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {image.title && (
          <p className="text-sm font-semibold">
            {image.title}
          </p>
        )}

        {category && (
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
            {category}
          </p>
        )}

        {image.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {image.description}
          </p>
        )}
      </div>
    </article>
  );
}