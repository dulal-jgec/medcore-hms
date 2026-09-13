"use client";

import { useState } from "react";
import {
  Pill,
  User,
  Calendar,
  ChevronDown,
  Download,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRESCRIPTIONS } from "@/lib/patient-mock-data";

export default function PatientPrescriptionsPage() {
  const [tab, setTab] = useState("active");
  const [openId, setOpenId] = useState(null);

  const active = PRESCRIPTIONS.filter((p) => p.status === "active");
  const completed = PRESCRIPTIONS.filter((p) => p.status === "completed");

  const prescriptions = tab === "active" ? active : completed;

  const tabs = [
    { id: "active", label: "Active", count: active.length },
    { id: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Prescriptions
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My prescriptions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All medicines prescribed by your doctors, organised by status.
        </p>
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

      {/* Content */}
      <div className="mt-8 space-y-4">
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              isOpen={openId === prescription.id}
              onToggle={() =>
                setOpenId(openId === prescription.id ? null : prescription.id)
              }
            />
          ))
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function PrescriptionCard({ prescription, isOpen, onToggle }) {
  const isActive = prescription.status === "active";
  const issuedDate = new Date(prescription.issuedOn);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        isOpen
          ? "border-brand/40 shadow-md"
          : "border-border hover:border-brand/30 hover:shadow-sm"
      )}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Pill className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {prescription.diagnosis}
            </h3>
            <StatusPill status={prescription.status} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {prescription.doctorName}
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
              <FileText className="h-3.5 w-3.5" />
              {prescription.medicines.length} medicine
              {prescription.medicines.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Chevron */}
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
          {/* Medicines table */}
          <div className="p-5 sm:p-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prescribed medicines
            </h4>

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {/* Table header */}
              <div className="hidden bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-3">
                <span className="sm:col-span-4">Medicine</span>
                <span className="sm:col-span-3">Dosage</span>
                <span className="sm:col-span-3">Timing</span>
                <span className="sm:col-span-2">Duration</span>
              </div>

              {/* Rows */}
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

            {/* Doctor notes */}
            {prescription.notes && (
              <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Doctor's notes
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-foreground">
                      {prescription.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
              {isActive && (
                <Button size="sm" variant="outline">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  Set reminder
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

function EmptyState({ tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Pill className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {tab === "active"
          ? "No active prescriptions"
          : "No completed prescriptions"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {tab === "active"
          ? "Your active medicines will appear here after your next visit."
          : "Past prescriptions will appear here."}
      </p>
    </div>
  );
}