"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { createHospital } from "@/services/super-admin.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateHospitalPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    city: "",
    logo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!accessToken) {
      setError("Authentication required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createHospital(
        accessToken,
        formData
      );

      router.push("/super-admin/hospitals");
    } catch (err) {
      setError(
        err.message || "Failed to create hospital."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push("/super-admin/hospitals")
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Hospital
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Add a new hospital to the MedCore platform.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft">
            <Building2 className="h-5 w-5 text-brand" />
          </div>

          <div>
            <h2 className="font-semibold">
              Hospital Information
            </h2>

            <p className="text-sm text-muted-foreground">
              Enter the basic details of the hospital.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Hospital Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Hospital Name
            </Label>

            <Input
              id="name"
              name="name"
              placeholder="Enter hospital name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email + Phone */}
          <div className="grid gap-5 sm:grid-cols-2">

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="hospital@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone
              </Label>

              <Input
                id="phone"
                name="phone"
                placeholder="10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </div>

          </div>

          {/* License + City */}
          <div className="grid gap-5 sm:grid-cols-2">

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                License Number
              </Label>

              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="Enter license number"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City
              </Label>

              <Input
                id="city"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">
              Logo URL
              <span className="ml-1 text-muted-foreground">
                (Optional)
              </span>
            </Label>

            <Input
              id="logo"
              name="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/super-admin/hospitals")
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Hospital"}
            </Button>

          </div>

        </form>
      </div>
    </div>
  );
}