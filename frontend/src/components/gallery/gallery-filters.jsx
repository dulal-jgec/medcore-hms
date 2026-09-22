"use client";

import {
  Search,
  RefreshCw,
} from "lucide-react";

import {
  GALLERY_CATEGORIES,
} from "@/features/gallery/gallery.constants";

export default function GalleryFilters({
  search,
  category,
  onSearchChange,
  onCategoryChange,
  onRefresh,
  loading,
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search gallery..."
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(event) =>
            onCategoryChange(
              event.target.value
            )
          }
          className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        >
          <option value="ALL">
            All Categories
          </option>

          {GALLERY_CATEGORIES.map(
            (category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            )
          )}
        </select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            loading ? "animate-spin" : ""
          }`}
        />

        Refresh
      </button>
    </div>
  );
}