"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Images,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import {
  getHospitalGallery,
} from "@/services/gallery.service";

import GalleryCard from "@/components/gallery/gallery-card";
import GalleryFilters from "@/components/gallery/gallery-filters";
import GalleryEmptyState from "@/components/gallery/gallery-empty-state";

export default function GalleryPage() {
  const { accessToken } = useAuthStore();

  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const PAGE_SIZE = 20;

  /**
   * Fetch gallery images
   */
  const fetchGallery = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError("");

      const result = await getHospitalGallery(
        accessToken,
        page,
        PAGE_SIZE
      );

      const data = result?.data;

      setGallery(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      console.error(
        "Failed to fetch hospital gallery:",
        error
      );

      setError(
        error?.message ||
          "Failed to load hospital gallery."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [accessToken, page]);

  /**
   * Local filtering
   */
  const filteredGallery = useMemo(() => {
    let result = gallery;

    if (category !== "ALL") {
      result = result.filter(
        (item) => item.category === category
      );
    }

    if (search.trim()) {
      const keyword = search
        .trim()
        .toLowerCase();

      result = result.filter((item) => {
        return (
          item.title
            ?.toLowerCase()
            .includes(keyword) ||
          item.description
            ?.toLowerCase()
            .includes(keyword)
        );
      });
    }

    return result;
  }, [gallery, category, search]);

  /**
   * Reset page when filters change
   */
  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  /**
   * Pagination
   */
  const handlePrevious = () => {
    if (page > 0) {
      setPage((current) => current - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((current) => current + 1);
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-brand" />

                <h1 className="text-xl font-semibold tracking-tight">
                  Hospital Gallery
                </h1>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage images that showcase your
                hospital and facilities.
              </p>
            </div>

            <Link
              href="/portal/admin/gallery/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />

              Add Image
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Filters */}
        <GalleryFilters
          search={search}
          category={category}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onRefresh={fetchGallery}
          loading={loading}
        />

        {/* Count */}
        {!loading && (
          <div className="mb-5 text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredGallery.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {totalElements}
            </span>{" "}
            images
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading gallery...
            </div>
          </div>
        ) : filteredGallery.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <>
            {/* Gallery */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredGallery.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onDeleted={fetchGallery}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={page === 0}
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      page >= totalPages - 1
                    }
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}