"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Stethoscope,
  Mail,
  Phone,
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  getDoctors,
  searchDoctors,
} from "@/services/doctor.service";

import { useAuthStore } from "@/store/auth-store";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "SUSPENDED", label: "Suspended" },
];

export default function AdminDoctorsPage() {
  const { accessToken } = useAuthStore();

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDoctor, setViewDoctor] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    loadDoctors();
  }, [accessToken]);

  async function loadDoctors() {
    try {
      setLoading(true);
      setError("");

      const result = await getDoctors(accessToken, {
        page: 0,
        size: 100,
        sortBy: "id",
        sortDir: "asc",
      });

      setDoctors(result.data?.items || []);
    } catch (error) {
      setError(error.message || "Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(value) {
    setQuery(value);

    const keyword = value.trim();

    if (!keyword) {
      loadDoctors();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await searchDoctors(
        accessToken,
        keyword,
        {
          page: 0,
          size: 100,
        }
      );

      setDoctors(result.data?.items || []);
    } catch (error) {
      setError(error.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  const filteredDoctors = useMemo(() => {
    if (status === "all") {
      return doctors;
    }

    return doctors.filter(
      (doctor) => doctor.status === status
    );
  }, [doctors, status]);

  const counts = useMemo(
    () => ({
      all: doctors.length,

      ACTIVE: doctors.filter(
        (doctor) => doctor.status === "ACTIVE"
      ).length,

      INACTIVE: doctors.filter(
        (doctor) => doctor.status === "INACTIVE"
      ).length,

      SUSPENDED: doctors.filter(
        (doctor) => doctor.status === "SUSPENDED"
      ).length,
    }),
    [doctors]
  );

  function clearFilters() {
    setQuery("");
    setStatus("all");
    loadDoctors();
  }

  const hasFilters =
    query.trim() !== "" || status !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Doctors
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hospital's medical staff and their credentials.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/doctors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
            placeholder="Search by specialization..."
            className="h-11 pl-10"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto">
          {STATUS_TABS.map(({ id, label }) => {
            const active = status === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
                  active
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent"
                )}
              >
                {label}

                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active
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

      <p className="mt-4 text-xs text-muted-foreground">
        {filteredDoctors.length} doctor
        {filteredDoctors.length !== 1 ? "s" : ""} found
      </p>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">
            Unable to load doctors
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-56 animate-pulse rounded-2xl border bg-muted/30"
            />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onView={() => setViewDoctor(doctor)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Stethoscope className="h-6 w-6 text-muted-foreground" />
          </div>

          <p className="mt-5 text-base font-semibold">
            No doctors found
          </p>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Try adjusting your filters or add a new doctor.
          </p>

          <Button asChild className="mt-5">
            <Link href="/portal/admin/doctors/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Add doctor
            </Link>
          </Button>
        </div>
      )}

      {viewDoctor && (
        <DoctorModal
          doctor={viewDoctor}
          onClose={() => setViewDoctor(null)}
        />
      )}
    </div>
  );
}

function DoctorCard({ doctor, onView }) {
  const active = doctor.status === "ACTIVE";
  const suspended = doctor.status === "SUSPENDED";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        suspended
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
            suspended
              ? "bg-destructive/10 text-destructive"
              : !active
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {doctor.doctorName?.charAt(0)?.toUpperCase() || "D"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold">
              {doctor.doctorName}
            </h3>

            <StatusBadge status={doctor.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {doctor.specialization}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {doctor.departmentName}
            </span>

            <span>·</span>

            <span>
              {doctor.experienceYears} yrs exp
            </span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x border-t bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Fee
          </p>

          <p className="mt-1 flex items-center justify-center text-xs font-semibold">
            <IndianRupee className="h-3 w-3" />
            {doctor.consultationFee}
          </p>
        </div>

        <div className="p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Experience
          </p>

          <p className="mt-1 text-xs font-semibold">
            {doctor.experienceYears} yrs
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onView}
        >
          View
        </Button>

        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/doctors/${doctor.id}/edit`}>
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
    SUSPENDED: {
      label: "Suspended",
      class: "bg-destructive/10 text-destructive",
    },
  };

  const config = map[status] || map.INACTIVE;

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}

function DoctorModal({ doctor, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-soft-foreground">
              {doctor.doctorName?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-bold">
                {doctor.doctorName}
              </h2>

              <p className="text-sm font-medium text-brand">
                {doctor.specialization}
              </p>

              <div className="mt-1.5 flex gap-2">
                <StatusBadge status={doctor.status} />

                <span className="text-xs text-muted-foreground">
                  {doctor.departmentName}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={Mail}
                label="Email"
                value={doctor.email}
              />

              <InfoBox
                icon={Phone}
                label="Phone"
                value="Managed through user account"
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Professional
            </h3>

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
                value={`₹${doctor.consultationFee}`}
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

              <InfoBox
                icon={FileText}
                label="Doctor ID"
                value={`#${doctor.id}`}
              />
            </div>
          </section>

          <div className="mt-6 flex gap-3 rounded-xl border bg-muted/30 p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials are managed by hospital
              administration.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t bg-card px-6 py-4">
          <Button variant="outline" asChild>
            <Link href={`/portal/admin/doctors/${doctor.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          {doctor.status === "ACTIVE" ? (
            <Button
              variant="outline"
              className="text-destructive"
            >
              <Ban className="mr-1.5 h-4 w-4" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Reactivate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p className="mt-1 text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}