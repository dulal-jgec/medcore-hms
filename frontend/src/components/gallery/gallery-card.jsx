"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useAuthStore } from "@/store/auth-store";

import {
  deleteGalleryImage,
} from "@/services/gallery.service";

import {
  getGalleryCategoryLabel,
} from "@/features/gallery/gallery.constants";

export default function GalleryCard({
  item,
  onDeleted,
}) {
  const { accessToken } = useAuthStore();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${item.title}" from the hospital gallery?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setMenuOpen(false);

      await deleteGalleryImage(
        item.id,
        accessToken
      );

      await onDeleted();
    } catch (error) {
      console.error(
        "Failed to delete gallery image:",
        error
      );

      window.alert(
        error?.message ||
          "Failed to delete gallery image."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-background">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-muted-foreground">
              No image
            </span>
          </div>
        )}

        {/* Category */}
        <div className="absolute left-3 top-3">
          <span className="rounded-md bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            {getGalleryCategoryLabel(
              item.category
            )}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute right-3 top-3">
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) => !current
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-md bg-black/70 text-white hover:bg-black/85"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-md border border-border bg-background shadow-lg">
                <Link
                  href={`/portal/admin/gallery/${item.id}/edit`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            Order: {item.displayOrder ?? 0}
          </span>

          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {item.status}
          </span>
        </div>
      </div>
    </div>
  );
}