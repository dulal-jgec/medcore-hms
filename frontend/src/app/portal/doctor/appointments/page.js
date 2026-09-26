"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CalendarX2,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  RefreshCw,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getMyDoctorProfile } from "@/services/doctor.service";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "@/services/appointment.service";

import { useAuthStore } from "@/store/auth-store";

const PAGE_SIZE = 100;

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export default function DoctorAppointmentsPage() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [tab, setTab] = useState("today");

  const initialized = useAuthStore((s) => s.initialized);
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

 useEffect(() => {
  if (!initialized || !isAuthenticated) return;

  let mounted = true;

  async function load() {
    try {
      setLoading(true);
      setError("");

      const profileRes = await getMyDoctorProfile();
      const doc = profileRes.data;
      if (!mounted) return;
      setDoctor(doc);

      const result = await getDoctorAppointments(doc.id, {
        page: 0,
        size: PAGE_SIZE,
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
      if (apt.status === "CANCELLED") {
        cancelled.push(apt);
      } else if (apt.appointmentDate === today) {
        todayList.push(apt);
      } else if (apt.appointmentDate > today) {
        if (apt.status !== "COMPLETED" && apt.status !== "NO_SHOW") {
          upcoming.push(apt);
        } else {
          past.push(apt);
        }
      } else {
        past.push(apt);
      }
    }

    const byTimeAsc = (a, b) =>
      (a.appointmentDate + " " + (a.startTime || "")).localeCompare(
        b.appointmentDate + " " + (b.startTime || "")
      );

    const byTimeDesc = (a, b) => byTimeAsc(b, a);

    todayList.sort(byTimeAsc);
    upcoming.sort(byTimeAsc);
    past.sort(byTimeDesc);
    cancelled.sort(byTimeDesc);

    return { today: todayList, upcoming, past, cancelled };
  }, [appointments, today]);

  const currentList = buckets[tab] || [];

  async function handleStatusChange(appointment, nextStatus) {
    const confirmMessage = getConfirmMessage(nextStatus);
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(appointment.id);
      const result = await updateAppointmentStatus(
        appointment.id,
        nextStatus
      );
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

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load appointments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Doctor profile is missing."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
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

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MiniStat
          label="Today"
          value={buckets.today.length}
          sub="appointments"
          accent
        />
        <MiniStat
          label="Upcoming"
          value={buckets.upcoming.length}
          sub="scheduled ahead"
        />
        <MiniStat
          label="Completed"
          value={buckets.past.length}
          sub="all time"
        />
        <MiniStat
          label="Cancelled"
          value={buckets.cancelled.length}
          sub="all time"
          muted
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Appointment filters"
        >
          {TABS.map(({ id, label }) => {
            const isActive = tab === id;
            const count = (buckets[id] || []).length;

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
        {currentList.length > 0 ? (
          currentList.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              tab={tab}
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

/* ══════════ Appointment Card ══════════ */

function AppointmentCard({ appointment, tab, updating, onStatusChange }) {
  const isToday = tab === "today";
  const isPast = tab === "past";
  const isCancelled = tab === "cancelled";
  const isUpcoming = tab === "upcoming";

  const date = new Date(appointment.appointmentDate + "T00:00:00");

  return (
    <div
      id={`apt-${appointment.id}`}
      className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/30 hover:shadow-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Date / time box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isToday && appointment.status === "CHECKED_IN"
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
                  appointment.status === "CHECKED_IN"
                    ? "text-brand-foreground/80"
                    : "text-brand-soft-foreground/80"
                )}
              >
                {getMeridiem(appointment.startTime)}
              </p>
              <p
                className={cn(
                  "text-lg font-bold leading-tight",
                  appointment.status === "CHECKED_IN"
                    ? "text-brand-foreground"
                    : "text-brand-soft-foreground"
                )}
              >
                {formatTimeShort(appointment.startTime)}
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
              {appointment.patientName}
            </h3>
            <StatusPill status={appointment.status} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.startTime)} –{" "}
              {formatTime(appointment.endTime)}
            </span>

            {!isToday && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              #{appointment.patientId}
            </span>
          </div>

          {appointment.reason && (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{appointment.reason}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isToday && appointment.status === "SCHEDULED" && (
            <>
              <Button
                size="sm"
                disabled={updating}
                onClick={() =>
                  onStatusChange(appointment, "CONFIRMED")
                }
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
              >
                Cancel
              </Button>
            </>
          )}

          {appointment.status === "CONFIRMED" && (
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

          {appointment.status === "CHECKED_IN" && (
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

          {isUpcoming && (
            <Button
              size="sm"
              variant="outline"
              disabled={updating}
              onClick={() => onStatusChange(appointment, "CANCELLED")}
            >
              Cancel
            </Button>
          )}

          {isPast && (
            <Button size="sm" variant="outline" asChild>
              <Link
                href={`/portal/doctor/patients/${appointment.patientId}`}
              >
                Patient file
              </Link>
            </Button>
          )}

          {isCancelled && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatusPill({ status }) {
  const map = {
    SCHEDULED: {
      label: "Scheduled",
      icon: Clock,
      class: "bg-muted text-muted-foreground",
    },
    CONFIRMED: {
      label: "Confirmed",
      icon: CheckCircle2,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    CHECKED_IN: {
      label: "Checked in",
      icon: Stethoscope,
      class: "bg-brand text-brand-foreground",
    },
    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      class: "bg-muted text-muted-foreground",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: XCircle,
      class: "bg-destructive/10 text-destructive",
    },
    NO_SHOW: {
      label: "No show",
      icon: AlertCircle,
      class: "bg-destructive/10 text-destructive",
    },
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
    today: {
      title: "No appointments today",
      desc: "Enjoy your free day.",
    },
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

/* ══════════ Helpers ══════════ */

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

function formatTimeShort(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${display}:${m}`;
}

function getMeridiem(time) {
  if (!time) return "";
  const [h] = time.split(":");
  return Number(h) >= 12 ? "PM" : "AM";
}

function getConfirmMessage(nextStatus) {
  switch (nextStatus) {
    case "CANCELLED":
      return "Cancel this appointment? This cannot be undone.";
    case "NO_SHOW":
      return "Mark this patient as no-show?";
    case "COMPLETED":
      return "Mark this consultation as completed?";
    case "CHECKED_IN":
      return "Check in this patient for consultation?";
    case "CONFIRMED":
      return "Confirm this appointment?";
    default:
      return null;
  }
}