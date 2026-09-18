"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { getAllHospitals } from "@/services/super-admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HospitalsPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function loadHospitals() {
      try {
        setLoading(true);
        setError("");

        const result = await getAllHospitals(
          accessToken
        );

        setHospitals(result.data.content || []);
      } catch (err) {
        setError(
          err.message || "Failed to load hospitals"
        );
      } finally {
        setLoading(false);
      }
    }

    loadHospitals();
  }, [accessToken]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hospitals
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage hospitals registered on the MedCore platform.
          </p>
        </div>

        <Button onClick={() =>
  router.push("/super-admin/hospitals/create")
}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search hospitals..."
          className="pl-9"
        />
      </div>

      {/* Content */}
      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading hospitals...
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    Hospital
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    City
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {hospitals.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-muted-foreground"
                    >
                      No hospitals found.
                    </td>
                  </tr>
                ) : (
                  hospitals.map((hospital) => (
                    <tr
                      key={hospital.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
                            <Building2 className="h-4 w-4 text-brand" />
                          </div>

                          <div>
                            <p className="font-medium">
                              {hospital.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              ID: {hospital.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {hospital.email}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {hospital.phone}
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {hospital.city}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium">
                          {hospital.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>
      )}
    </div>
  );
}