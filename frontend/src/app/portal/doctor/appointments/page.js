"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  User,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  CalendarX2,
  Calendar,
  FileText,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TODAYS_APPOINTMENTS,
  UPCOMING_APPOINTMENTS,
  PAST_APPOINTMENTS,
  CANCELLED_APPOINTMENTS,
} from "@/lib/doctor-mock-data";

export default function DoctorAppointmentsPage() {
  const [tab, setTab] = useState("today");

  const tabs = [
    { id: "today", label: "Today", count: TODAYS_APPOINTMENTS.length },
    { id: "upcoming", label: "Upcoming", count: UPCOMING_APPOINTMENTS.length },
    { id: "past", label: "Past", count: PAST_APPOINTMENTS.length },
    { id: "cancelled", label: "Cancelled", count: CANCELLED_APPOINTMENTS.length },
  ];

  const appointments =
    tab === "today"
      ? TODAYS_APPOINTMENTS
      : tab === "upcoming"
      ? UPCOMING_APPOINTMENTS
      : tab === "past"
      ? PAST_APPOINTMENTS
      : CANCELLED_APPOINTMENTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Appointments
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All consultations — today, upcoming, and past.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/doctor/appointments/new">
            
            Schedule appointment
          </Link>
        </Button>
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MiniStat
          label="Today"
          value={TODAYS_APPOINTMENTS.length}
          sub="appointments"
          accent
        />
        <MiniStat
          label="Upcoming"
          value={UPCOMING_APPOINTMENTS.length}
          sub="this week"
        />
        <MiniStat
          label="Completed"
          value={PAST_APPOINTMENTS.length}
          sub="all time"
        />
        <MiniStat
          label="Cancelled"
          value={CANCELLED_APPOINTMENTS.length}
          sub="all time"
          muted
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Appointment filters">
          {tabs.map(({ id, label, count }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
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
        {appointments.length > 0 ? (
          appointments.map((apt) => (
            <AppointmentCard key={apt.id} apt={apt} tab={tab} />
          ))
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function AppointmentCard({ apt, tab }) {
  const date = new Date(apt.date);
  const isToday = tab === "today";
  const isUpcoming = tab === "upcoming";
  const isPast = tab === "past";
  const isCancelled = tab === "cancelled";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Date / time box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isToday && apt.status === "in_progress"
              ? "border-brand bg-brand text-brand-foreground"
              : isToday
              ? "border-brand/20 bg-brand-soft"
              : isCancelled
              ? "border-destructive/20 bg-destructive/5"
              : "border-border bg-muted/40"
          )}
        >
          {isToday ? (
            <>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  apt.status === "in_progress"
                    ? "text-brand-foreground/80"
                    : "text-brand-soft-foreground/80"
                )}
              >
                {apt.time.split(" ")[1]}
              </p>
              <p
                className={cn(
                  "text-lg font-bold leading-tight",
                  apt.status === "in_progress"
                    ? "text-brand-foreground"
                    : "text-brand-soft-foreground"
                )}
              >
                {apt.time.split(" ")[0]}
              </p>
            </>
          ) : (
            <>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isCancelled ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {date.toLocaleString("en-IN", { month: "short" })}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold leading-none",
                  isCancelled ? "text-destructive" : "text-foreground"
                )}
              >
                {date.getDate()}
              </p>
              <p
                className={cn(
                  "mt-1 text-[9px] font-medium uppercase tracking-wider",
                  isCancelled ? "text-destructive/80" : "text-muted-foreground"
                )}
              >
                {date.toLocaleString("en-IN", { weekday: "short" })}
              </p>
            </>
          )}
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
              <User className="h-3.5 w-3.5" />
              {apt.age} yrs · {apt.gender}
            </span>
            {!isToday && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {apt.time}
              </span>
            )}
            {apt.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {apt.duration}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">
            <span className="text-muted-foreground">Reason: </span>
            <span className="font-medium">{apt.reason}</span>
          </p>

          {isPast && apt.notes && (
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Consultation notes
              </p>
              <p className="mt-1 text-xs text-foreground">{apt.notes}</p>
            </div>
          )}

          {isCancelled && (
            <p className="mt-2 text-xs text-muted-foreground">
              Cancelled on {apt.cancelledOn} by {apt.cancelledBy}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isToday && apt.status === "confirmed" && (
            <>
              <Button size="sm">
                <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                Start
              </Button>
              <Button size="sm" variant="outline">
                Reschedule
              </Button>
            </>
          )}

          {isToday && apt.status === "in_progress" && (
            <Button size="sm">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Continue
            </Button>
          )}

          {isToday && apt.status === "completed" && (
            <Button size="sm" variant="outline">
              <History className="mr-1.5 h-3.5 w-3.5" />
              Notes
            </Button>
          )}

          {isUpcoming && (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link
                  href={`/portal/doctor/patients/${apt.patientId}`}
                >
                  View patient
                </Link>
              </Button>
              <Button size="sm" variant="ghost">
                Reschedule
              </Button>
            </>
          )}

          {isPast && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portal/doctor/patients/${apt.patientId}`}>
                Patient file
              </Link>
            </Button>
          )}

          {isCancelled && (
            <Button size="sm" variant="outline">
              Follow up
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
    in_progress: {
      label: "In progress",
      icon: PlayCircle,
      class: "bg-brand text-brand-foreground",
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

function MiniStat({ label, value, sub, accent, muted }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tracking-tight",
          accent && "text-brand",
          muted && "text-muted-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function EmptyState({ tab }) {
  const copy = {
    today: { title: "No appointments today", desc: "Enjoy your free day." },
    upcoming: {
      title: "No upcoming appointments",
      desc: "New bookings will appear here.",
    },
    past: {
      title: "No past appointments",
      desc: "Completed consultations will appear here.",
    },
    cancelled: {
      title: "No cancelled appointments",
      desc: "You haven't cancelled any appointments.",
    },
  };
  const c = copy[tab] || copy.today;

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarX2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">{c.title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
    </div>
  );
}