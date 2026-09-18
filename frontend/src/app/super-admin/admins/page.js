"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { getAllHospitalAdmins } from "@/services/super-admin.service";
import { Button } from "@/components/ui/button";

export default function HospitalAdminsPage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function loadAdmins() {
      try {
        setLoading(true);
        setError("");

        const result = await getAllHospitalAdmins(
          accessToken
        );

        setAdmins(result.data.content || []);
      } catch (err) {
        setError(
          err.message || "Failed to load hospital admins."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdmins();
  }, [accessToken]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hospital Admins
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage administrators assigned to MedCore hospitals.
          </p>
        </div>

        <Button
          onClick={() =>
            router.push("/super-admin/admins/create")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital Admin
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Loading hospital admins...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    Admin
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Hospital
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <Users className="mb-3 h-8 w-8 text-muted-foreground" />

                        <p className="font-medium">
                          No hospital admins found
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Create your first hospital admin.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr
                      key={admin.userId}
                      className="border-b border-border last:border-0"
                    >
                      {/* Admin */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-soft-foreground">
                            {admin.fullName
                              ?.slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium">
                              {admin.fullName}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              ID: {admin.userId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-muted-foreground">
                        {admin.email}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-muted-foreground">
                        {admin.phone}
                      </td>

                      {/* Hospital */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">
                            {admin.hospitalName}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID: {admin.hospitalId}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium">
                          {admin.status}
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