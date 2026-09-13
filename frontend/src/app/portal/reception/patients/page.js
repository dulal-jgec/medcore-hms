"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  UserPlus,
  Users,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_PATIENTS } from "@/lib/admin-mock-data";

export default function ReceptionPatientsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return ALL_PATIENTS;
    return ALL_PATIENTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }, [query]);

  const hasFilters = query.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Front Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Look up registered patients or register a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/reception/patients/new">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Register patient
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat icon={Users} label="Total patients" value={ALL_PATIENTS.length} accent />
        <MiniStat
          icon={AlertCircle}
          label="Critical"
          value={ALL_PATIENTS.filter((p) => p.status === "CRITICAL").length}
          alert
        />
        <MiniStat
          icon={Calendar}
          label="Active"
          value={ALL_PATIENTS.filter((p) => p.status === "ACTIVE").length}
        />
      </div>

      {/* Search */}
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
          <Button
            variant="ghost"
            onClick={() => setQuery("")}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
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
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No patients found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try a different search or register a new patient.
            </p>
            <Button asChild className="mt-5">
              <Link href="/portal/reception/patients/new">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Register patient
              </Link>
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
  const lastVisit = new Date(patient.lastVisit);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
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
              <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
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
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {patient.city}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Registered
          </p>
          <p className="mt-1 text-xs font-semibold">
            {new Date(patient.registeredOn).toLocaleDateString("en-IN", {
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

      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link href={`/portal/reception/patients/${patient.id}`}>
            View
          </Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link
            href={`/portal/reception/appointments/new?patientId=${patient.id}`}
          >
            Book
          </Link>
        </Button>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent, alert }) {
  const style = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          style
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
    </div>
  );
}