"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Plus,
  Search,
  X,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  FileText,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getAllHospitals } from "@/services/super-admin.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "DELETED", label: "Deleted" },
];

export default function SuperAdminHospitalsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await getAllHospitals(0, 100, "createdAt", "desc");

        if (cancelled) return;
        setHospitals(res.data?.content || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load hospitals.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const counts = useMemo(
    () => ({
      all: hospitals.length,
      ACTIVE: hospitals.filter((h) => h.status === "ACTIVE").length,
      INACTIVE: hospitals.filter((h) => h.status === "INACTIVE").length,
      DELETED: hospitals.filter((h) => h.status === "DELETED").length,
    }),
    [hospitals]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return hospitals.filter((h) => {
      if (status !== "all" && h.status !== status) return false;
      if (!q) return true;

      return (
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q) ||
        h.licenseNumber?.toLowerCase().includes(q)
      );
    });
  }, [hospitals, query, status]);

  const hasFilters = query.trim() !== "" || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Platform
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Hospitals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all hospitals registered on MedCore.
          </p>
        </div>

        <Button asChild>
          <Link href="/super-admin/hospitals/create">
            <Plus className="mr-1.5 h-4 w-4" />
            Create hospital
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, or license number..."
            className="h-11 pl-10"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground">
            {filtered.length} hospital{filtered.length !== 1 ? "s" : ""} found
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════ Hospital Card ══════════ */

function HospitalCard({ hospital }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground">
          {hospital.name?.charAt(0)?.toUpperCase() || "H"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {hospital.name || "—"}
            </h3>
            <StatusPill status={hospital.status} />
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[hospital.city, hospital.state].filter(Boolean).join(", ") ||
                "—"}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {hospital.licenseNumber || "No license"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="flex items-center gap-2 p-3 text-xs">
          <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground">
            {hospital.email || "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-3 text-xs">
          <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground">
            {hospital.phone || "—"}
          </span>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link href={`/super-admin/hospitals/${hospital.id}`}>
            View
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link href={`/super-admin/admins/create?hospitalId=${hospital.id}`}>
            <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
            Add admin
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ACTIVE: "bg-brand-soft text-brand-soft-foreground",
    INACTIVE: "bg-muted text-muted-foreground",
    DELETED: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status] || map.INACTIVE
      )}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No hospitals match your filters" : "No hospitals yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try clearing filters or a different search."
          : "Create the first hospital to get started."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/super-admin/hospitals/create">
            <Plus className="mr-1.5 h-4 w-4" />
            Create hospital
          </Link>
        </Button>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-2xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}