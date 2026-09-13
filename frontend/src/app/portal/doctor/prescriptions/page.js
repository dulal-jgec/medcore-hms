"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Pill,
  Plus,
  Search,
  User,
  Calendar,
  ChevronDown,
  Download,
  Printer,
  FileText,
  X,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DOCTOR_PRESCRIPTIONS } from "@/lib/doctor-mock-data";

export default function DoctorPrescriptionsPage() {
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const active = DOCTOR_PRESCRIPTIONS.filter((p) => p.status === "active");
  const completed = DOCTOR_PRESCRIPTIONS.filter((p) => p.status === "completed");

  const baseList = tab === "active" ? active : completed;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return baseList;
    return baseList.filter(
      (p) =>
        p.patientName.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q)
    );
  }, [query, baseList]);

  const hasFilters = query.length > 0;

  function clearFilters() {
    setQuery("");
  }

  const tabs = [
    { id: "active", label: "Active", count: active.length },
    { id: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Prescriptions
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Prescriptions I've written
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All prescriptions issued to your patients.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/doctor/prescriptions/new">
            
            New prescription
          </Link>
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Active" value={active.length} sub="ongoing treatments" accent />
        <MiniStat label="Completed" value={completed.length} sub="all time" />
        <MiniStat
          label="Total medicines prescribed"
          value={DOCTOR_PRESCRIPTIONS.reduce((s, p) => s + p.medicines.length, 0)}
          sub="across all prescriptions"
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Prescription filters">
          {tabs.map(({ id, label, count }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setOpenId(null);
                }}
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
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or diagnosis..."
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

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} prescription{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Content */}
      <div className="mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              isOpen={openId === rx.id}
              onToggle={() => setOpenId(openId === rx.id ? null : rx.id)}
            />
          ))
        ) : (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function PrescriptionCard({ prescription, isOpen, onToggle }) {
  const isActive = prescription.status === "active";
  const issuedDate = new Date(prescription.issuedOn);
  const followUpDate = new Date(prescription.followUpDate);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        isOpen
          ? "border-brand/40 shadow-md"
          : "border-border hover:border-brand/30 hover:shadow-sm"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
        aria-expanded={isOpen}
      >
        {/* Patient avatar */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {prescription.patientName.charAt(0)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {prescription.patientName}
            </h3>
            <StatusPill status={prescription.status} />
          </div>

          <p className="mt-1 truncate text-sm font-medium text-brand">
            {prescription.diagnosis}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {prescription.patientAge} yrs · {prescription.patientGender}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {issuedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5" />
              {prescription.medicines.length} medicine
              {prescription.medicines.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-border">
          <div className="p-5 sm:p-6">
            {/* Medicines table */}
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prescribed medicines
            </h4>

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <div className="hidden bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-3">
                <span className="sm:col-span-4">Medicine</span>
                <span className="sm:col-span-3">Dosage</span>
                <span className="sm:col-span-3">Timing</span>
                <span className="sm:col-span-2">Duration</span>
              </div>

              <div className="divide-y divide-border">
                {prescription.medicines.map((med) => (
                  <div
                    key={med.name}
                    className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-12 sm:gap-3"
                  >
                    <div className="sm:col-span-4">
                      <p className="font-medium">{med.name}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
                        Dosage:
                      </span>
                      <span className="text-muted-foreground">{med.dosage}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
                        Timing:
                      </span>
                      <span className="text-muted-foreground">{med.timing}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
                        Duration:
                      </span>
                      <span className="text-muted-foreground">{med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta boxes */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {prescription.notes && (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Notes for patient
                      </p>
                      <p className="mt-1.5 text-sm leading-6">
                        {prescription.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
                      Follow-up
                    </p>
                    <p className="mt-1.5 text-sm font-medium">
                      {followUpDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline">
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
              {isActive && (
                <Button size="sm" asChild>
                  <Link
                    href={`/portal/doctor/prescriptions/${prescription.id}/edit`}
                  >
                    Edit prescription
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    completed: {
      label: "Completed",
      class: "bg-muted text-muted-foreground",
    },
  };
  const config = map[status] || map.completed;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}

function MiniStat({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-3xl font-bold tracking-tight",
          accent && "text-brand"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Pill className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No prescriptions found" : "No prescriptions yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search."
          : "Prescriptions you write will appear here."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear search
        </Button>
      )}
    </div>
  );
}