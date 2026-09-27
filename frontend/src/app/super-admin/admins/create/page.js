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

  const accessToken = useAuthStore((state) => state.accessToken);

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

    let cancelled = false;

    async function loadHospitals() {
      try {
        setLoadingHospitals(true);
        setError("");

        const result = await getAllHospitals(0, 100, "createdAt", "desc");

        if (cancelled) return;

        setHospitals(result.data?.content || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load hospitals.");
        }
      } finally {
        if (!cancelled) setLoadingHospitals(false);
      }
    }

    loadHospitals();

    return () => {
      cancelled = true;
    };
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

    if (!formData.hospitalId) {
      setError("Please select a hospital.");
      return;
    }

    const selected = hospitals.find(
      (h) => String(h.id) === String(formData.hospitalId)
    );

    if (selected && selected.status !== "ACTIVE") {
      setError(
        `"${selected.name}" is not active. Activate the hospital before assigning an admin.`
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createHospitalAdmin({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        hospitalId: Number(formData.hospitalId),
      });

      router.push("/super-admin/admins");
    } catch (err) {
      setError(err.message || "Failed to create hospital admin.");
    } finally {
      setLoading(false);
    }
  }

  const noHospitals =
    !loadingHospitals && hospitals.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/super-admin/admins")}
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

      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft">
            <UserPlus className="h-5 w-5 text-brand" />
          </div>

          <div>
            <h2 className="font-semibold">Administrator Information</h2>

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

        {noHospitals && !error && (
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            No hospitals found. Create a hospital first, then come back to
            assign an admin.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>

            <Input
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

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
              <Label htmlFor="phone">Phone</Label>

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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalId">Hospital</Label>

            <select
              id="hospitalId"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              disabled={loadingHospitals || hospitals.length === 0}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {loadingHospitals
                  ? "Loading hospitals..."
                  : hospitals.length === 0
                  ? "No hospitals available"
                  : "Select a hospital"}
              </option>

              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                  {hospital.status && hospital.status !== "ACTIVE"
                    ? ` — ${hospital.status}`
                    : ""}
                  {hospital.city ? ` (${hospital.city})` : ""}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-muted-foreground">
              Only hospitals with status <strong>ACTIVE</strong> can have an
              administrator assigned.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/super-admin/admins")}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading || loadingHospitals || hospitals.length === 0}
            >
              {loading ? "Creating..." : "Create Hospital Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}