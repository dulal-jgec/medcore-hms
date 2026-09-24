"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ImagePlus,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import {
  createDepartment,
  uploadDepartmentImage,
} from "@/services/department.service";

const INITIAL_FORM = {
  name: "",
  code: "",
  description: "",
};

export default function CreateDepartmentPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!accessToken) {
      setError("Authentication required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await createDepartment(accessToken, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
      });

      const department = result.data;

      if (imageFile && department?.id) {
        await uploadDepartmentImage(
          department.id,
          imageFile,
          accessToken
        );
      }

      setSuccess("Department created successfully.");

      setTimeout(() => {
        router.push("/portal/admin/departments");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/admin/departments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to departments
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hospital Setup
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Create department
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new department to your hospital.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Unable to create department
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm font-medium text-brand-soft-foreground">
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold tracking-tight">
              Department image
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Optional cover image shown on the hospital's public page.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {imagePreview ? (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Department preview"
                  className="h-44 w-72 rounded-xl border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={submitting}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm transition hover:bg-muted disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="department-image"
                className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 transition hover:border-brand/40 hover:bg-hover/40"
              >
                <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Upload department image
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WebP · Max 5 MB
                </span>
              </label>
            )}

            <input
              id="department-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={submitting}
              className="hidden"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold tracking-tight">
              Department information
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Name, code and a brief description.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Department name <span className="text-destructive">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
                className="h-11"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Department code <span className="text-destructive">*</span>
              </label>
              <Input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. CARD"
                className="h-11 uppercase"
                required
                minLength={2}
                maxLength={20}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                A short unique code for this department.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Briefly describe this department..."
                maxLength={500}
                rows={4}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            The department will be created inside your current hospital. You
            can upload or change the image later.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/admin/departments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            <Building2 className="mr-1.5 h-4 w-4" />
            {submitting ? "Creating..." : "Create department"}
          </Button>
        </div>
      </form>
    </div>
  );
}