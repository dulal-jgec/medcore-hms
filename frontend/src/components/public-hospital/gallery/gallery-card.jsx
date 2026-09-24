import { Camera } from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function GalleryCard({ image, size = "small" }) {
  const spanClass =
    size === "featured"
      ? "col-span-2 row-span-2"
      : size === "wide"
      ? "col-span-2"
      : size === "tall"
      ? "row-span-2"
      : "";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-muted ${spanClass}`}
    >
      <PublicImage
        src={image.imageUrl}
        alt={image.title || "Hospital gallery"}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
      />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      {image.category && (
        <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {image.category}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {image.title && (
              <h3 className="truncate text-base font-bold tracking-tight text-white">
                {image.title}
              </h3>
            )}
            {image.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/80">
                {image.description}
              </p>
            )}
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Camera className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}