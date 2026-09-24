import { notFound } from "next/navigation";
import { Images, Sparkles } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicGallery } from "@/services/public-gallery.service";
import GalleryCard from "@/components/public-hospital/gallery/gallery-card";

export const metadata = {
  title: "Gallery | MedCore",
};

function getTileSize(index) {
  const pattern = [
    "featured", // 0  2×2
    "small",    // 1
    "tall",     // 2  1×2
    "small",    // 3
    "wide",     // 4  2×1
    "small",    // 5
    "small",    // 6
    "featured", // 7  2×2
    "small",    // 8
    "tall",     // 9
    "small",    // 10
    "wide",     // 11
    "small",    // 12
    "small",    // 13
  ];
  return pattern[index % pattern.length];
}

export default async function GalleryPage({ params }) {
  const { id } = await params;

  const [hospitalResult, galleryResult] = await Promise.all([
    getPublicHospital(id),
    getPublicGallery(id, {
      page: 0,
      size: 50,
      sortBy: "displayOrder",
      sortDir: "asc",
    }),
  ]);

  const hospital = hospitalResult.data;
  if (!hospital) notFound();

  const gallery = galleryResult.data?.content || [];

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand">
              <span className="h-px w-8 bg-brand" />
              Gallery
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              A look inside{" "}
              <span className="text-brand">{hospital.name}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
              {gallery.length > 0
                ? `${gallery.length} photograph${
                    gallery.length !== 1 ? "s" : ""
                  } from the wards, facilities, and everyday environment.`
                : "Photographs from the hospital will appear here once published."}
            </p>
          </div>

          {gallery.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand" />
                {gallery.length} image{gallery.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-2">
                <Images className="h-4 w-4 text-brand" />
                Real facilities
              </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          {gallery.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4">
              {gallery.map((image, index) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  size={getTileSize(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <Images className="h-7 w-7 text-brand-soft-foreground" />
      </div>
      <h2 className="mt-6 text-lg font-semibold">Gallery coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        The hospital is still adding photographs of its facilities. Check back
        soon.
      </p>
    </div>
  );
}