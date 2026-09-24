"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  Plus,
  X,
  MapPin,
  FileText,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getAllHospitals } from "@/services/super-admin.service";

const PAGE_SIZE = 12;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function SuperAdminHospitalsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!accessToken) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getAllHospitals(
          accessToken,
          page,
          PAGE_SIZE,
          "createdAt",
          "desc"
        );

        setHospitals(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
        setTotalElements(result.data.totalElements || 0);
      } catch (err) {
        setError(err.message || "Failed to load hospitals.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [accessToken, page]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return hospitals.filter((hospital) => {
      const matchQuery =
        !q ||
        hospital.name?.toLowerCase().includes(q) ||
        hospital.city?.toLowerCase().includes(q) ||
        hospital.email?.toLowerCase().includes(q) ||
        hospital.licenseNumber?.toLowerCase().includes(q);

      const matchStatus =
        status === "all" || hospital.status === status;

      return matchQuery && matchStatus;
    });
  }, [hospitals, query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Platform
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Hospitals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalElements} hospitals registered on MedCore
          </p>
        </div>
        <Button asChild>
          <Link href="/super-admin/hospitals/create">
            <Plus className="mr-1.5 h-4 w-4" />
            Create hospital
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, email, or license..."
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

      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6" aria-label="Hospital status">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <GridSkeleton />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrevious={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            )}
          </>
        ) : (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        )}
      </div>
    </div>
  );
}

function HospitalCard({ hospital }) {
  const isActive = hospital.status === "ACTIVE";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {hospital.name?.charAt(0) || "H"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {hospital.name}
            </h3>
            <StatusPill status={hospital.status} />
          </div>

          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {hospital.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{hospital.city}</span>
              </div>
            )}
            {hospital.licenseNumber && (
              <div className="flex items-center gap-1.5">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate font-mono">
                  {hospital.licenseNumber}
                </span>
              </div>
            )}
            {hospital.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{hospital.email}</span>
              </div>
            )}
            {hospital.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{hospital.phone}</span>
              </div>
            )}
          </div>
        </div>
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

function Pagination({ page, totalPages, onPrevious, onNext }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page === 0}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No hospitals found" : "No hospitals yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or filters."
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  );
}