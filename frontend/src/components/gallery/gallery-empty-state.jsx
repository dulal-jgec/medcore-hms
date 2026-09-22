"use client";

import Link from "next/link";
import { Images, Plus } from "lucide-react";

export default function GalleryEmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Images className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-base font-semibold">
        No gallery images
      </h2>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Add images of your hospital, wards,
        reception, ICU, laboratory, and other
        facilities.
      </p>

      <Link
        href="/portal/admin/gallery/new"
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white hover:opacity-90"
      >
        <Plus className="h-4 w-4" />

        Add First Image
      </Link>
    </div>
  );
}