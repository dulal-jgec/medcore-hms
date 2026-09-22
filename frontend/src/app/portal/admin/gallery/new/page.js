"use client";

import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";

import GalleryForm from "@/components/gallery/gallery-form";

export default function NewGalleryPage() {
  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/portal/admin/gallery"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Gallery
          </Link>

          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-brand" />

            <h1 className="text-xl font-semibold tracking-tight">
              Add Gallery Image
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a new image to your hospital gallery.
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <GalleryForm />
      </main>
    </div>
  );
}