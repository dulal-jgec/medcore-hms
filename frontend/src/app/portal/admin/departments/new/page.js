"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  X,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

import {
  createDepartment,
  uploadDepartmentImage,
} from "@/services/department.service";

export default function CreateDepartmentPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Client-side validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    // 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5 MB."
      );
      return;
    }

    setError("");
    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeImage() {
    setImageFile(null);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      /*
       * Step 1:
       * Create the department.
       */
      const result = await createDepartment(
        accessToken,
        {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
        }
      );

      /*
       * Backend response contains
       * the newly created department.
       */
      const department = result.data;

      /*
       * Step 2:
       * Upload image only after department
       * has been successfully created.
       */
      if (imageFile && department?.id) {
        await uploadDepartmentImage(
          department.id,
          imageFile,
          accessToken
        );
      }

      /*
       * Step 3:
       * Go back to department list.
       */
      router.push("/portal/admin/departments");
    } catch (err) {
      setError(
        err.message ||
          "Failed to create department"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/portal/admin/departments"
            )
          }
          disabled={loading}
          className="rounded-md border p-2 hover:bg-muted disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold">
            Create Department
          </h1>

          <p className="text-sm text-muted-foreground">
            Add a new department to your hospital
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-background p-6"
      >
        {/* Error */}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Department Image */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">
              Department Image
            </label>

            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG or WebP. Maximum size 5 MB.
            </p>
          </div>

          {imagePreview ? (
            <div className="relative w-fit">
              <img
                src={imagePreview}
                alt="Department preview"
                className="h-40 w-64 rounded-lg border object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute right-2 top-2 rounded-full border bg-background p-1.5 shadow-sm hover:bg-muted disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="department-image"
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 transition hover:bg-muted/40"
            >
              <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />

              <span className="text-sm font-medium">
                Upload department image
              </span>

              <span className="mt-1 text-xs text-muted-foreground">
                Click to select an image
              </span>
            </label>
          )}

          <input
            id="department-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={loading}
            className="hidden"
          />
        </div>

        {/* Department Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium"
          >
            Department Name
          </label>

          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Cardiology"
            required
            minLength={2}
            maxLength={100}
            disabled={loading}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Department Code */}
        <div className="space-y-2">
          <label
            htmlFor="code"
            className="text-sm font-medium"
          >
            Department Code
          </label>

          <input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. CARD"
            required
            minLength={2}
            maxLength={20}
            disabled={loading}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="text-xs text-muted-foreground">
            Use a short unique code for this department.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe this department..."
            maxLength={500}
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/portal/admin/departments"
              )
            }
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create Department"}
          </button>
        </div>
      </form>
    </div>
  );
}