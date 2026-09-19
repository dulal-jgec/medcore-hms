"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { createDepartment } from "@/services/department.service";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createDepartment(accessToken, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
      });

      router.push("/portal/admin/departments");
    } catch (err) {
      setError(
        err.message || "Failed to create department"
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
            router.push("/portal/admin/departments")
          }
          className="rounded-md border p-2 hover:bg-muted"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/20"
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
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() =>
              router.push("/portal/admin/departments")
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