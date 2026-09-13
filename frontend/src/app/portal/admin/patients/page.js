"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Users,
  AlertCircle,
  Droplets,
  MapPin,
  Phone,
  Calendar,
  UserRound,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_PATIENTS, getAdminPatientStats } from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "CRITICAL", label: "Critical" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminPatientsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const stats = getAdminPatientStats();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_PATIENTS.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.city.toLowerCase().includes(q);
      const matchStatus = status === "all" || p.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: stats.total,
    ACTIVE: stats.active,
    CRITICAL: stats.critical,
    INACTIVE: stats.inactive,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Patient Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            All patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.total} registered patients across the hospital.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/patients/new">
            
            Register patient
          </Link>
        </Button>
      </div>

      {/* Critical alert */}
      {stats.critical > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">
              {stats.critical} critical patient
              {stats.critical > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              currently under intensive care.
            </span>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or city..."
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

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Patient status">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
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

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No patients found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-5">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function PatientCard({ patient }) {
  const isCritical = patient.status === "CRITICAL";
  const isInactive = patient.status === "INACTIVE";

  const lastVisit = new Date(patient.lastVisit);
  const registeredOn = new Date(patient.registeredOn);

  return (
    <Link
      href={`/portal/admin/patients/${patient.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isCritical
          ? "border-destructive/30 hover:border-destructive/60"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isCritical
              ? "bg-destructive/10 text-destructive"
              : isInactive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {patient.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {patient.name}
            </h3>
            <StatusBadge status={patient.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{patient.age} yrs</span>
            <span>·</span>
            <span>{patient.gender}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {patient.bloodGroup}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {patient.city}
          </div>
        </div>
      </div>

      {/* Primary doctor strip */}
      <div className="mx-5 mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand-soft-foreground">
          {patient.primaryDoctor.replace("Dr. ", "").charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Primary doctor
          </p>
          <p className="truncate text-xs font-medium">
            {patient.primaryDoctor}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Registered
          </p>
          <p className="mt-1 text-xs font-semibold">
            {registeredOn.toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Last visit
          </p>
          <p className="mt-1 text-xs font-semibold">
            {lastVisit.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    CRITICAL: {
      label: "Critical",
      class: "bg-destructive/10 text-destructive",
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
  };
  const config = map[status] || map.INACTIVE;

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}