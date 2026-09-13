"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  AlertCircle,
  X,
  Phone,
  Calendar,
  Activity,
  ChevronRight,
  Droplets,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ASSIGNED_PATIENTS } from "@/lib/doctor-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "critical", label: "Critical" },
];

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ASSIGNED_PATIENTS.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q);
      const matchStatus = status === "all" || p.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const criticalCount = ASSIGNED_PATIENTS.filter(
    (p) => p.status === "critical"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Patients
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My patients
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ASSIGNED_PATIENTS.length} patients currently under your care.
        </p>
      </div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">
              {criticalCount} critical patient{criticalCount > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              require{criticalCount === 1 ? "s" : ""} immediate attention.
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
            placeholder="Search by patient name or condition..."
            className="h-11 pl-10"
          />
        </div>

        {/* Status segmented */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          {STATUS_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setStatus(id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                status === id
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Count */}
      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "patient" : "patients"} found
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
              <Search className="h-6 w-6 text-muted-foreground" />
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
  const isCritical = patient.status === "critical";
  const lastVisit = new Date(patient.lastVisit);
  const nextAppt = new Date(patient.nextAppointment);

  return (
    <Link
      href={`/portal/doctor/patients/${patient.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isCritical
          ? "border-destructive/30 hover:border-destructive/60"
          : "border-border hover:border-brand/40"
      )}
    >
      {/* Top section */}
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isCritical
              ? "bg-destructive/10 text-destructive"
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
            {isCritical && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                <AlertCircle className="h-3 w-3" />
                Critical
              </span>
            )}
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

          <p className="mt-3 text-xs font-medium text-foreground">
            {patient.condition}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
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
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Next visit
          </p>
          <p className="mt-1 text-xs font-semibold text-brand">
            {nextAppt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={(e) => e.preventDefault()}
        >
          <Phone className="mr-1.5 h-3.5 w-3.5" />
          Call
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={(e) => e.preventDefault()}
        >
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          Book
        </Button>
      </div>
    </Link>
  );
}