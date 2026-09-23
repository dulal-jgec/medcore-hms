import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicGallery } from "@/services/public-gallery.service";
import GalleryCard from "@/components/public-hospital/gallery/gallery-card";

export default async function GalleryPage({ params }) {
  const { id } = await params;

  const [hospitalResult, galleryResult] =
    await Promise.all([
      getPublicHospital(id),
      getPublicGallery(id, {
        page: 0,
        size: 100,
        sortBy: "displayOrder",
        sortDir: "asc",
      }),
    ]);

  const hospital = hospitalResult.data;

  if (!hospital) {
    return null;
  }

  const gallery = galleryResult.data?.content || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/hospitals/${id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {hospital.name}
      </Link>

      <section className="mb-10">
        <div className="flex items-center gap-3">
          <ImageIcon className="h-7 w-7 text-primary" />

          <div>
            <p className="text-sm text-muted-foreground">
              {hospital.name}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Hospital Gallery
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Explore the facilities and spaces of {hospital.name}.
        </p>
      </section>

      {gallery.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="font-medium">
            No gallery images available
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Images will appear here when they are published.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((image) => (
            <GalleryCard
              key={image.id}
              image={image}
            />
          ))}
        </div>
      )}
    </main>
  );
}