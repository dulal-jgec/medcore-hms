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
  MapPin,
  Plus,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getMyPatientProfile } from "@/services/patient.service";
import {
  cancelAppointment,
  getMyAppointments,
} from "@/services/appointment.service";

const PAGE_SIZE = 100;

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export default function PatientAppointmentsPage() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, appointmentsRes] = await Promise.all([
          getMyPatientProfile(),
          getMyAppointments({ page: 0, size: PAGE_SIZE }),
        ]);

        if (!mounted) return;

        setPatient(profileRes.data);
        setAppointments(
          appointmentsRes.data?.items ||
            appointmentsRes.data?.content ||
            []
        );
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
  }, []);

  const today = toIsoDate(new Date());

  const buckets = useMemo(() => {
    const upcoming = [];
    const past = [];
    const cancelled = [];

    for (const apt of appointments) {
      if (apt.status === "CANCELLED") {
        cancelled.push(apt);
      } else if (
        apt.appointmentDate >= today &&
        !["COMPLETED", "NO_SHOW"].includes(apt.status)
      ) {
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
    past.sort(desc);
    cancelled.sort(desc);

    return { upcoming, past, cancelled };
  }, [appointments, today]);

  const currentList = buckets[tab] || [];

  async function handleCancel(appointment) {
    if (
      !window.confirm(
        `Cancel your appointment with ${appointment.doctorName} on ${formatDate(
          appointment.appointmentDate
        )}?`
      )
    ) {
      return;
    }

    try {
      setCancellingId(appointment.id);
      await cancelAppointment(appointment.id);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: "CANCELLED" } : a
        )
      );
    } catch (err) {
      alert(err.message || "Unable to cancel the appointment.");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load appointments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Patient profile is missing."}
        </p>
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
            My appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, reschedule, or book new appointments with your doctors.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/hospitals">
            <Plus className="mr-1.5 h-4 w-4" />
            Book appointment
          </Link>
        </Button>
      </div>

      <div className="mt-8 border-b border-border">
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Appointment filters"
        >
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

      <div className="mt-8">
        {currentList.length > 0 ? (
          <div className="space-y-4">
            {currentList.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                tab={tab}
                cancelling={cancellingId === apt.id}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment, tab, cancelling, onCancel }) {
  const isUpcoming = tab === "upcoming";
  const isPast = tab === "past";
  const isCancelled = tab === "cancelled";

  const date = new Date(appointment.appointmentDate + "T00:00:00");

  return (
    <div
      id={`apt-${appointment.id}`}
      className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/30 hover:shadow-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
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

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {appointment.doctorName}
            </h3>
            <StatusPill status={appointment.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(appointment.startTime)} –{" "}
              {formatTime(appointment.endTime)}
            </span>
            {appointment.hospitalName && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.hospitalName}
              </span>
            )}
            {appointment.patientName && (
              <span className="flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5" />
                {appointment.patientName}
              </span>
            )}
          </div>

          {appointment.reason && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reason:</span>{" "}
              {appointment.reason}
            </p>
          )}

          <p className="mt-2 text-[11px] text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" />
            {date.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isUpcoming && (
            <Button
              size="sm"
              variant="outline"
              disabled={cancelling}
              onClick={() => onCancel(appointment)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel"
              )}
            </Button>
          )}

          {isPast && (
            <Button size="sm" variant="ghost" asChild>
              <Link href="/hospitals">Book again</Link>
            </Button>
          )}

          {isCancelled && (
            <Button size="sm" variant="outline" asChild>
              <Link href="/hospitals">Book new</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

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
          <Link href="/hospitals">
            <Plus className="mr-1.5 h-4 w-4" />
            Book appointment
          </Link>
        </Button>
      )}
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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}