"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  X,
  Stethoscope,
  Mail,
  Award,
  Building2,
  IndianRupee,
  Calendar,
  Pencil,
  Ban,
  CheckCircle2,
  GraduationCap,
  FileText,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getDoctors,
  searchDoctors,
  updateDoctorStatus,
} from "@/services/doctor.service";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "SUSPENDED", label: "Suspended" },
];

export default function AdminDoctorsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDoctor, setViewDoctor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!accessToken) return;
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function loadDoctors() {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const result = await getDoctors({
        page: 0,
        size: PAGE_SIZE,
        sortBy: "id",
        sortDir: "asc",
      });

      if (requestId !== requestIdRef.current) return;
      setDoctors(result.data?.items || []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Failed to load doctors");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  async function runSearch(keyword) {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const result = await searchDoctors(keyword, {
        page: 0,
        size: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;
      setDoctors(result.data?.items || []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Search failed");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  function handleSearch(value) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const keyword = value.trim();
      if (!keyword) {
        loadDoctors();
      } else {
        runSearch(keyword);
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setStatus("all");
    loadDoctors();
  }

  async function handleToggleStatus(doctor) {
    const nextStatus =
      doctor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const confirmMessage =
      nextStatus === "SUSPENDED"
        ? `Suspend ${doctor.doctorName}? Patients won't be able to book this doctor.`
        : `Reactivate ${doctor.doctorName}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(doctor.id);
      const result = await updateDoctorStatus(doctor.id, nextStatus);
      const updated = result.data;

      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctor.id ? { ...d, ...updated } : d
        )
      );

      setViewDoctor((prev) =>
        prev && prev.id === doctor.id ? { ...prev, ...updated } : prev
      );
    } catch (err) {
      alert(err.message || "Failed to update doctor status");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (status === "all") return doctors;
    return doctors.filter((d) => d.status === status);
  }, [doctors, status]);

  const counts = useMemo(
    () => ({
      all: doctors.length,
      ACTIVE: doctors.filter((d) => d.status === "ACTIVE").length,
      INACTIVE: doctors.filter((d) => d.status === "INACTIVE").length,
      SUSPENDED: doctors.filter((d) => d.status === "SUSPENDED").length,
    }),
    [doctors]
  );

  const hasFilters = query.trim() !== "" || status !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ══════════ Header ══════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Doctors
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hospital&apos;s medical staff and credentials.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/doctors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Link>
        </Button>
      </div>

      {/* ══════════ Search bar ══════════ */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by specialization..."
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

      {/* ══════════ Status tabs ══════════ */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Doctor status">
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

      {/* ══════════ Error ══════════ */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              Unable to load doctors
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDoctors}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* ══════════ Content ══════════ */}
      {loading ? (
        <DoctorGridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onView={() => setViewDoctor(doctor)}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}

      {/* ══════════ Modal ══════════ */}
      {viewDoctor && (
        <DoctorModal
          doctor={viewDoctor}
          onClose={() => setViewDoctor(null)}
          onToggleStatus={handleToggleStatus}
          updating={updatingId === viewDoctor.id}
        />
      )}
    </div>
  );
}

/* ══════════ Doctor Card ══════════ */

function DoctorCard({ doctor, onView }) {
  const isActive = doctor.status === "ACTIVE";
  const isSuspended = doctor.status === "SUSPENDED";

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isSuspended
          ? "border-destructive/30"
          : "border-border hover:border-brand/40"
      )}
    >
      <button
        type="button"
        onClick={onView}
        className="flex items-start gap-4 p-5 text-left"
      >
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isSuspended
              ? "bg-destructive/10 text-destructive"
              : !isActive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {doctor.doctorName?.charAt(0)?.toUpperCase() || "D"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {doctor.doctorName}
            </h3>
            <StatusBadge status={doctor.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {doctor.specialization}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {doctor.departmentName}
            </span>
            <span>·</span>
            <span>{doctor.experienceYears} yrs</span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Fee
          </p>
          <p className="mt-1 flex items-center justify-center gap-0.5 text-xs font-semibold">
            <IndianRupee className="h-3 w-3" />
            {formatCurrency(doctor.consultationFee)}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Experience
          </p>
          <p className="mt-1 text-xs font-semibold">
            {doctor.experienceYears} yrs
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onView}
        >
          View
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/doctors/${doctor.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </div>
  );
}

/* ══════════ Status Badge ══════════ */

function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-brand-soft text-brand-soft-foreground",
    INACTIVE: "bg-muted text-muted-foreground",
    SUSPENDED: "bg-destructive/10 text-destructive",
  };

  const label = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status] || map.INACTIVE
      )}
    >
      {label[status] || "Unknown"}
    </span>
  );
}

/* ══════════ Doctor Modal ══════════ */

function DoctorModal({ doctor, onClose, onToggleStatus, updating }) {
  const isActive = doctor.status === "ACTIVE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-soft-foreground">
              {doctor.doctorName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {doctor.doctorName}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {doctor.specialization}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge status={doctor.status} />
                <span className="text-xs text-muted-foreground">
                  {doctor.departmentName}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <SectionTitle>Contact</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox icon={Mail} label="Email" value={doctor.email} />
            <InfoBox
              icon={FileText}
              label="Doctor ID"
              value={`#${doctor.id}`}
            />
          </div>

          <SectionTitle className="mt-6">Professional</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={GraduationCap}
              label="Qualification"
              value={doctor.qualification}
            />
            <InfoBox
              icon={Award}
              label="Experience"
              value={`${doctor.experienceYears} years`}
            />
            <InfoBox
              icon={IndianRupee}
              label="Consultation fee"
              value={`₹${formatCurrency(doctor.consultationFee)}`}
            />
            <InfoBox
              icon={Building2}
              label="Department"
              value={doctor.departmentName}
            />
            <InfoBox
              icon={Calendar}
              label="Joined on"
              value={formatDate(doctor.createdAt)}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials are managed by hospital administration.
              Doctors cannot edit these fields themselves.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href={`/portal/admin/doctors/${doctor.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          {isActive ? (
            <Button
              variant="outline"
              onClick={() => onToggleStatus(doctor)}
              disabled={updating}
              className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
            >
              {updating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-1.5 h-4 w-4" />
              )}
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => onToggleStatus(doctor)}
              disabled={updating}
              className="flex-1 sm:flex-none"
            >
              {updating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
              )}
              Reactivate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Small components ══════════ */

function SectionTitle({ children, className }) {
  return (
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </h3>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Stethoscope className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No doctors found" : "No doctors yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters."
          : "Add your first doctor to get started."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/doctors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Link>
        </Button>
      )}
    </div>
  );
}

function DoctorGridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl border border-border bg-muted/30"
        />
      ))}
    </div>
  );
}

/* ══════════ Helpers ══════════ */

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}