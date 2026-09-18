"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import {
  getAllHospitals,
  createHospitalAdmin,
} from "@/services/super-admin.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateHospitalAdminPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    hospitalId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function loadHospitals() {
      try {
        setLoadingHospitals(true);

        const result = await getAllHospitals(
          accessToken,
          0,
          100
        );

        setHospitals(result.data.content || []);
      } catch (err) {
        setError(
          err.message || "Failed to load hospitals."
        );
      } finally {
        setLoadingHospitals(false);
      }
    }

    loadHospitals();
  }, [accessToken]);

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

    if (!formData.hospitalId) {
      setError("Please select a hospital.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createHospitalAdmin(accessToken, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        hospitalId: Number(formData.hospitalId),
      });

      router.push("/super-admin/admins");
    } catch (err) {
      setError(
        err.message || "Failed to create hospital admin."
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
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push("/super-admin/admins")
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Hospital Admin
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Assign an administrator to a hospital.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft">
            <UserPlus className="h-5 w-5 text-brand" />
          </div>

          <div>
            <h2 className="font-semibold">
              Administrator Information
            </h2>

            <p className="text-sm text-muted-foreground">
              Login credentials will be sent to the provided email.
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
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name
            </Label>

            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
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
                placeholder="admin@example.com"
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

          {/* Hospital */}
          <div className="space-y-2">
            <Label htmlFor="hospitalId">
              Hospital
            </Label>

            <select
              id="hospitalId"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              disabled={loadingHospitals}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {loadingHospitals
                  ? "Loading hospitals..."
                  : "Select a hospital"}
              </option>

              {hospitals
                .filter(
                  (hospital) =>
                    hospital.status === "ACTIVE"
                )
                .map((hospital) => (
                  <option
                    key={hospital.id}
                    value={hospital.id}
                  >
                    {hospital.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/super-admin/admins")
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                loading || loadingHospitals
              }
            >
              {loading
                ? "Creating..."
                : "Create Hospital Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}