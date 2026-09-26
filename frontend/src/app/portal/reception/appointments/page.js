"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  Plus,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import {
  getAppointments,
  updateAppointmentStatus,
} from "@/services/appointment.service";

const PAGE_SIZE = 100;

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export default function ReceptionAppointmentsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getAppointments({
          page: 0,
          size: PAGE_SIZE,
          sortBy: "appointmentDate",
          sortDir: "asc",
        });

        if (!mounted) return;
        setAppointments(result.data?.items || result.data?.content || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load appointments.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated]);

  const today = toIsoDate(new Date());

  const buckets = useMemo(() => {
    const todayList = [];
    const upcoming = [];
    const past = [];
    const cancelled = [];

    for (const apt of appointments) {
      if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") {
        cancelled.push(apt);
      } else if (apt.appointmentDate === today) {
        todayList.push(apt);
      } else if (apt.appointmentDate > today) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    }

    const asc = (a, b) =>
      (a.appointmentDate + " " + (a.startTime || "")).localeCompare(
        b.appointmentDate + " " + (b.startTime || "")
      );
    const desc = (a, b) => asc(b, a);

    upcoming.sort(asc);
    todayList.sort(asc);
    past.sort(desc);
    cancelled.sort(desc);

    return { upcoming, today: todayList, past, cancelled };
  }, [appointments, today]);

  const currentList = buckets[tab] || [];

  async function handleStatusChange(appointment, nextStatus) {
    const msg = getConfirmMessage(nextStatus);
    if (msg && !window.confirm(msg)) return;

    try {
      setUpdatingId(appointment.id);
      const result = await updateAppointmentStatus(appointment.id, nextStatus);
      const updated = result.data;

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? { ...a, ...updated } : a))
      );
    } catch (err) {
      alert(err.message || "Unable to update appointment.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load appointments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Appointments
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All appointments for your hospital.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/portal/reception/appointments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New appointment
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MiniStat label="Today" value={buckets.today.length} accent />
        <MiniStat label="Upcoming" value={buckets.upcoming.length} />
        <MiniStat label="Past" value={buckets.past.length} />
        <MiniStat label="Cancelled" value={buckets.cancelled.length} muted />
      </div>

      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map(({ id, label }) => {
            const active = tab === id;
            const count = (buckets[id] || []).length;
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

      <div className="mt-8 space-y-4">
        {currentList.length > 0 ? (
          currentList.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              isToday={apt.appointmentDate === today}
              updating={updatingId === apt.id}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, isToday, updating, onStatusChange }) {
  const date = new Date(appointment.appointmentDate + "T00:00:00");
  const s = appointment.status;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isToday && s === "CHECKED_IN"
              ? "border-brand bg-brand text-brand-foreground"
              : isToday
              ? "border-brand/20 bg-brand-soft"
              : s === "CANCELLED" || s === "NO_SHOW"
              ? "border-destructive/20 bg-destructive/5"
              : "border-border bg-muted/40"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isToday && s === "CHECKED_IN"
                ? "text-brand-foreground/80"
                : isToday
                ? "text-brand-soft-foreground/80"
                : s === "CANCELLED"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {date.toLocaleString("en-IN", { month: "short" })}
          </p>
          <p
            className={cn(
              "text-2xl font-bold leading-none",
              isToday && s === "CHECKED_IN"
                ? "text-brand-foreground"
                : isToday
                ? "text-brand-soft-foreground"
                : s === "CANCELLED"
                ? "text-destructive"
                : "text-foreground"
            )}
          >
            {date.getDate()}
          </p>
          <p className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            {date.toLocaleString("en-IN", { weekday: "short" })}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {appointment.patientName}
            </h3>
            <StatusPill status={appointment.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              {appointment.doctorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {appointment.patientId && (
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                #{appointment.patientId}
              </span>
            )}
          </div>

          {appointment.reason && (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{appointment.reason}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {s === "SCHEDULED" && (
            <>
              <Button
                size="sm"
                disabled={updating}
                onClick={() => onStatusChange(appointment, "CONFIRMED")}
              >
                {updating ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={updating}
                onClick={() => onStatusChange(appointment, "CANCELLED")}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel
              </Button>
            </>
          )}

          {s === "CONFIRMED" && (
            <>
              <Button
                size="sm"
                disabled={updating}
                onClick={() => onStatusChange(appointment, "CHECKED_IN")}
              >
                {updating ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                )}
                Check in
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={updating}
                onClick={() => onStatusChange(appointment, "NO_SHOW")}
              >
                No show
              </Button>
            </>
          )}

          {s === "CHECKED_IN" && (
            <Button
              size="sm"
              disabled={updating}
              onClick={() => onStatusChange(appointment, "COMPLETED")}
            >
              {updating ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              Mark complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    SCHEDULED: { label: "Scheduled", class: "bg-muted text-muted-foreground" },
    CONFIRMED: { label: "Confirmed", class: "bg-brand-soft text-brand-soft-foreground" },
    CHECKED_IN: { label: "Checked in", class: "bg-brand text-brand-foreground" },
    COMPLETED: { label: "Completed", class: "bg-muted text-muted-foreground" },
    CANCELLED: { label: "Cancelled", class: "bg-destructive/10 text-destructive" },
    NO_SHOW: { label: "No show", class: "bg-destructive/10 text-destructive" },
  };
  const c = map[status] || map.SCHEDULED;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        c.class
      )}
    >
      {c.label}
    </span>
  );
}

function MiniStat({ label, value, accent, muted }) {
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
    </div>
  );
}

function EmptyState({ tab }) {
  const copy = {
    upcoming: { title: "No upcoming appointments", desc: "New bookings will appear here." },
    today: { title: "No appointments today", desc: "Today's schedule is clear." },
    past: { title: "No past appointments", desc: "Past visits will appear here." },
    cancelled: { title: "No cancelled appointments", desc: "Cancellations will appear here." },
  };
  const c = copy[tab] || copy.upcoming;
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarDays className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">{c.title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
      <Button asChild className="mt-6">
        <Link href="/portal/reception/appointments/new">
          <Plus className="mr-1.5 h-4 w-4" />
          New appointment
        </Link>
      </Button>
    </div>
  );
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}

function getConfirmMessage(nextStatus) {
  switch (nextStatus) {
    case "CANCELLED": return "Cancel this appointment?";
    case "NO_SHOW": return "Mark this patient as no-show?";
    case "COMPLETED": return "Mark this visit as completed?";
    case "CHECKED_IN": return "Check in this patient?";
    case "CONFIRMED": return "Confirm this appointment?";
    default: return null;
  }
}