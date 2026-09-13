"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Plus,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  CalendarX2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UPCOMING_APPOINTMENTS,
  PAST_APPOINTMENTS,
  CANCELLED_APPOINTMENTS,
} from "@/lib/patient-mock-data";

export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: UPCOMING_APPOINTMENTS.length },
    { id: "past", label: "Past", count: PAST_APPOINTMENTS.length },
    { id: "cancelled", label: "Cancelled", count: CANCELLED_APPOINTMENTS.length },
  ];

  const appointments =
    tab === "upcoming"
      ? UPCOMING_APPOINTMENTS
      : tab === "past"
      ? PAST_APPOINTMENTS
      : CANCELLED_APPOINTMENTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ══════════ Header ══════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Appointments
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, reschedule, or book new appointments with your doctors.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/portal/patient/appointments/new">
             
            Book appointment
          </Link>
        </Button>
      </div>

      {/* ══════════ Tabs ══════════ */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Appointment filters">
          {tabs.map(({ id, label, count }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  active
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
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
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ══════════ Content ══════════ */}
      <div className="mt-8">
        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} tab={tab} />
            ))}
          </div>
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function AppointmentCard({ appointment, tab }) {
  const isUpcoming = tab === "upcoming";
  const isPast = tab === "past";
  const isCancelled = tab === "cancelled";

  const date = new Date(appointment.date);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Date box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isUpcoming
              ? "border-brand/20 bg-gradient-to-br from-brand-soft to-brand-soft/40"
              : isCancelled
              ? "border-destructive/20 bg-destructive/5"
              : "border-border bg-muted/40"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isUpcoming
                ? "text-brand-soft-foreground"
                : isCancelled
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {date.toLocaleString("en-IN", { month: "short" })}
          </p>
          <p
            className={cn(
              "text-2xl font-bold leading-none",
              isUpcoming
                ? "text-brand-soft-foreground"
                : isCancelled
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {date.getDate()}
          </p>
          <p
            className={cn(
              "mt-1 text-[9px] font-medium uppercase tracking-wider",
              isUpcoming
                ? "text-brand-soft-foreground/80"
                : isCancelled
                ? "text-destructive/80"
                : "text-muted-foreground"
            )}
          >
            {date.toLocaleString("en-IN", { weekday: "short" })}
          </p>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {appointment.doctorName}
            </h3>
            <StatusPill status={appointment.status} />
          </div>
          <p className="mt-1 text-sm font-medium text-brand">
            {appointment.specialty}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {appointment.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {appointment.department}
            </span>
          </div>

          {appointment.reason && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reason:</span>{" "}
              {appointment.reason}
            </p>
          )}

          {isCancelled && appointment.cancelledOn && (
            <p className="mt-2 text-xs text-muted-foreground">
              Cancelled on {appointment.cancelledOn}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isUpcoming && (
            <>
              <Button size="sm" asChild>
                <Link href={`/portal/patient/appointments/${appointment.id}`}>
                  View details
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                Reschedule
              </Button>
            </>
          )}

          {isPast && (
            <>
              <Button size="sm" variant="outline">
                View summary
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/portal/patient/appointments/new">
                  Book again
                </Link>
              </Button>
            </>
          )}

          {isCancelled && (
            <Button size="sm" variant="outline" asChild>
              <Link href="/portal/patient/appointments/new">
                Book new
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    confirmed: {
      label: "Confirmed",
      icon: CheckCircle2,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    pending: {
      label: "Pending",
      icon: AlertCircle,
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      class: "bg-muted text-muted-foreground",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      class: "bg-destructive/10 text-destructive",
    },
  };
  const config = map[status] || map.pending;
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

function EmptyState({ tab }) {
  const copy = {
    upcoming: {
      title: "No upcoming appointments",
      desc: "Book an appointment to get started.",
    },
    past: {
      title: "No past appointments",
      desc: "Your completed appointments will appear here.",
    },
    cancelled: {
      title: "No cancelled appointments",
      desc: "You haven't cancelled any appointments.",
    },
  };
  const c = copy[tab] || copy.upcoming;

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarX2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">{c.title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
      {tab !== "past" && (
        <Button asChild className="mt-6">
          <Link href="/portal/patient/appointments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Book appointment
          </Link>
        </Button>
      )}
    </div>
  );
}