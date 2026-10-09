"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Tag,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { createGalleryImage } from "@/services/gallery.service";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const CATEGORIES = [
  { value: "RECEPTION", label: "Reception" },
  { value: "WARD", label: "Ward" },
  { value: "ICU", label: "ICU" },
  { value: "OPERATION_THEATRE", label: "Operation Theatre" },
  { value: "LABORATORY", label: "Laboratory" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "CANTEEN", label: "Canteen" },
  { value: "PARKING", label: "Parking" },
  { value: "EXTERIOR", label: "Exterior" },
  { value: "OTHER", label: "Other" },
];

const schema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title is too long"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Select a category"),
});

export default function GalleryForm() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFileChange(event) {
    const selected = event.target.files?.[0];
    setFileError("");
    setServerError("");

    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
      event.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setFileError("");
  }

  async function onSubmit(data) {
    setServerError("");

    if (!file) {
      setFileError("Please select an image before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", data.title.trim());
      formData.append("category", data.category);
      if (data.description?.trim()) {
        formData.append("description", data.description.trim());
      }

      await createGalleryImage(formData);

      setSuccess(true);

      setTimeout(() => {
        router.replace("/portal/admin/gallery");
      }, 1200);
    } catch (err) {
      setServerError(err.message || "Failed to upload image.");
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight">
          Image added to gallery
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Redirecting back to the gallery...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {(serverError || fileError) && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError || fileError}</span>
        </div>
      )}

      {/* Upload section */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
            <ImageIcon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Image</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              JPG, PNG or WEBP · Max {MAX_FILE_SIZE_MB} MB
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={preview}
                alt="Preview"
                className="h-64 w-full object-cover"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="truncate text-xs text-white">{file?.name}</p>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 py-14 transition-colors hover:border-brand/40 hover:bg-brand-soft/20">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
                <Upload className="h-5 w-5" />
              </span>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload an image</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  or drag and drop
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Details section */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Details</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Shown on the public gallery page
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="e.g. Main Reception Area"
              className="h-11"
              maxLength={120}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Category <span className="text-destructive">*</span>
            </label>
            <select
              {...register("category")}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Brief description of this image"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <a href="/portal/admin/gallery">Cancel</a>
        </Button>

        <Button type="submit" disabled={isSubmitting || !file}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Add to gallery
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
