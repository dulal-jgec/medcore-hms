"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { createHospital } from "@/services/super-admin.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  licenseNumber: "",
  city: "",
  logo: "",
};

export default function CreateHospitalPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      await createHospital(accessToken, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        city: formData.city.trim(),
        logo: formData.logo.trim() || null,
      });

      router.push("/super-admin/hospitals");
    } catch (err) {
      setError(err.message || "Failed to create hospital.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/super-admin/hospitals")}
          aria-label="Back to hospitals"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Platform
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Create hospital
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new hospital to the MedCore platform.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft">
            <Building2 className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Hospital information
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Login credentials will be sent to the provided email.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">
              Hospital name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hospital name"
              required
              minLength={3}
              maxLength={150}
              className="h-11"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hospital@example.com"
                required
                maxLength={100}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                required
                className="h-11"
              />
              <p className="text-[11px] text-muted-foreground">
                10 digits, starting with 6, 7, 8, or 9.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                License number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Enter license number"
                required
                minLength={5}
                maxLength={50}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
                maxLength={100}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              maxLength={500}
              className="h-11"
            />
            <p className="text-[11px] text-muted-foreground">
              Optional. You can also upload a logo later from hospital settings.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/super-admin/hospitals")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create hospital"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}