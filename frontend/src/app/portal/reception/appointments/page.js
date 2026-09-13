"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  CalendarCheck,
  Clock,
  Plus,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ban,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TODAY_APPOINTMENTS } from "@/lib/reception-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "CHECKED_IN", label: "Checked in" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function ReceptionAppointmentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TODAY_APPOINTMENTS.filter((a) => {
      const matchQuery =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.patientPhone.includes(q);
      const matchStatus = status === "all" || a.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: TODAY_APPOINTMENTS.length,
    SCHEDULED: TODAY_APPOINTMENTS.filter((a) => a.status === "SCHEDULED").length,
    CONFIRMED: TODAY_APPOINTMENTS.filter((a) => a.status === "CONFIRMED").length,
    CHECKED_IN: TODAY_APPOINTMENTS.filter((a) => a.status === "CHECKED_IN").length,
    COMPLETED: TODAY_APPOINTMENTS.filter((a) => a.status === "COMPLETED").length,
    CANCELLED: TODAY_APPOINTMENTS.filter((a) => a.status === "CANCELLED").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Front Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Today's appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage check-ins, confirmations, and cancellations for today.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/reception/appointments/new">
             
            Book appointment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient, doctor, or phone..."
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Appointment status">
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
        {filtered.length} appointment{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((apt) => <AppointmentRow key={apt.id} apt={apt} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CalendarCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">
              No appointments found
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Row ══════════ */

function AppointmentRow({ apt }) {
  const isCheckedIn = apt.status === "CHECKED_IN";
  const isScheduled = apt.status === "SCHEDULED";
  const isConfirmed = apt.status === "CONFIRMED";
  const isCompleted = apt.status === "COMPLETED";
  const isCancelled = apt.status === "CANCELLED";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isCheckedIn
          ? "border-brand/40 bg-brand-soft/20"
          : isCancelled
          ? "border-border opacity-70"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Time box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isCheckedIn
              ? "border-brand bg-brand text-brand-foreground"
              : isCompleted
              ? "border-border bg-muted/40"
              : "border-border bg-muted/40"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isCheckedIn
                ? "text-brand-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {apt.slot.split(" ")[1]}
          </p>
          <p
            className={cn(
              "text-base font-bold leading-tight",
              isCheckedIn ? "text-brand-foreground" : "text-foreground"
            )}
          >
            {apt.slot.split(" ")[0]}
          </p>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {apt.patientName}
            </h3>
            <StatusPill status={apt.status} />
            <TypeBadge type={apt.type} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {apt.patientPhone}
            </span>
            <span>{apt.doctorName}</span>
            <span>{apt.department}</span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span>{" "}
            {apt.reason}
          </p>

          {apt.checkedInAt && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-brand">
              <Clock className="h-3 w-3" />
              Checked in at {apt.checkedInAt}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isScheduled && (
            <>
              <Button size="sm">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Confirm
              </Button>
              <Button size="sm" variant="outline">
                <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                Check in
              </Button>
            </>
          )}

          {isConfirmed && (
            <>
              <Button size="sm">
                <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                Check in
              </Button>
              <Button size="sm" variant="ghost">
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                No show
              </Button>
            </>
          )}

          {isCheckedIn && (
            <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              In queue
            </span>
          )}

          {isCompleted && (
            <Button size="sm" variant="outline">
              View notes
            </Button>
          )}

          {isCancelled && (
            <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cancelled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    SCHEDULED: { label: "Scheduled", icon: Clock, class: "bg-muted text-muted-foreground" },
    CONFIRMED: { label: "Confirmed", icon: CheckCircle2, class: "bg-brand-soft text-brand-soft-foreground" },
    CHECKED_IN: { label: "Checked in", icon: PlayCircle, class: "bg-brand text-brand-foreground" },
    COMPLETED: { label: "Completed", icon: CheckCircle2, class: "bg-muted text-muted-foreground" },
    CANCELLED: { label: "Cancelled", icon: XCircle, class: "bg-destructive/10 text-destructive" },
    NO_SHOW: { label: "No show", icon: AlertCircle, class: "bg-destructive/10 text-destructive" },
  };
  const config = map[status] || map.SCHEDULED;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    New: "bg-highlight-soft text-highlight-soft-foreground",
    "Follow-up": "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[type] || map["Follow-up"]
      )}
    >
      {type}
    </span>
  );
}