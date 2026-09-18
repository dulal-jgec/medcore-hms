"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, XCircle, Trash2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { getDashboard } from "@/services/super-admin.service";

const stats = [
  {
    key: "totalHospitals",
    label: "Total Hospitals",
    icon: Building2,
  },
  {
    key: "activeHospitals",
    label: "Active Hospitals",
    icon: CheckCircle2,
  },
  {
    key: "inactiveHospitals",
    label: "Inactive Hospitals",
    icon: XCircle,
  },
  {
    key: "deletedHospitals",
    label: "Deleted Hospitals",
    icon: Trash2,
  },
];

export default function SuperAdminPage() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard(accessToken);

        setDashboard(result.data);
      } catch (err) {
        setError(
          err.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of the MedCore platform.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of the MedCore platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>

                <Icon className="h-5 w-5 text-brand" />
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {dashboard?.[item.key] ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}