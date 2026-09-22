"use client";

import { useState } from "react";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";

import {
  createGalleryImage,
} from "@/services/gallery.service";

import {
  GALLERY_CATEGORIES,
} from "@/features/gallery/gallery.constants";

export default function GalleryForm({
  initialData = null,
  mode = "create",
}) {
  const router = useRouter();

  const { accessToken } = useAuthStore();

  const isEditMode = mode === "edit";

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category:
      initialData?.category || "EXTERIOR",
    description:
      initialData?.description || "",
    displayOrder:
      initialData?.displayOrder ?? 0,
  });

  const [file, setFile] = useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(initialData?.imageUrl || "");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /**
   * Input change
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /**
   * Image selection
   */
  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        "Image size must not exceed 5MB."
      );

      return;
    }

    setError("");

    setFile(selectedFile);

    setPreviewUrl(
      URL.createObjectURL(selectedFile)
    );
  };

  /**
   * Submit
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!accessToken) {
      setError(
        "Authentication session not found."
      );

      return;
    }

    if (!form.title.trim()) {
      setError("Title is required.");

      return;
    }

    if (!isEditMode && !file) {
      setError("Please select an image.");

      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEditMode) {
        // Edit implementation will use
        // updateGalleryImage + replaceGalleryImage.
        return;
      }

      await createGalleryImage(
        {
          file,
          title: form.title.trim(),
          category: form.category,
          description:
            form.description.trim() || null,
          displayOrder: Number(
            form.displayOrder || 0
          ),
        },
        accessToken
      );

      router.push("/portal/admin/gallery");
      router.refresh();
    } catch (error) {
      console.error(
        "Failed to create gallery image:",
        error
      );

      setError(
        error?.message ||
          "Failed to upload gallery image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-background"
    >
      <div className="space-y-6 p-5 sm:p-6">
        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Image */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Image
            <span className="text-destructive">
              {" "}
              *
            </span>
          </label>

          <label className="block cursor-pointer">
            <div className="overflow-hidden rounded-lg border border-dashed border-border bg-muted/20">
              {previewUrl ? (
                <div className="relative aspect-video">
                  <img
                    src={previewUrl}
                    alt="Gallery preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    Choose an image
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG or WebP · Maximum 5MB
                  </p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium"
          >
            Title
            <span className="text-destructive">
              {" "}
              *
            </span>
          </label>

          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Main Reception Area"
            maxLength={150}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
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

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={1000}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe this image..."
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />

          <div className="mt-1 text-right text-xs text-muted-foreground">
            {form.description.length}/1000
          </div>
        </div>

        {/* Display order */}
        <div>
          <label
            htmlFor="displayOrder"
            className="mb-2 block text-sm font-medium"
          >
            Display Order
          </label>

          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={handleChange}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />

          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers appear first.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-border px-5 py-4 sm:px-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {loading
            ? "Uploading..."
            : "Upload Image"}
        </button>
      </div>
    </form>
  );
}