"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarX2,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { getMyDoctorProfile } from "@/services/doctor.service";
import { getDoctorAppointments } from "@/services/appointment.service";

const PAGE_SIZE = 100;

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const patientId = params.id;

  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [patientName, setPatientName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    if (!patientId) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyDoctorProfile();
        const doctor = profileRes.data;

        const res = await getDoctorAppointments(doctor.id, {
          page: 0,
          size: PAGE_SIZE,
        });

        if (!mounted) return;

        const all = res.data?.items || res.data?.content || [];
        const mine = all.filter(
          (a) => String(a.patientId) === String(patientId)
        );

        mine.sort((a, b) =>
          (b.appointmentDate + " " + (b.startTime || "")).localeCompare(
            a.appointmentDate + " " + (a.startTime || "")
          )
        );

        setAppointments(mine);
        setPatientName(mine[0]?.patientName || "Patient");
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load patient details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated, patientId]);

  const buckets = useMemo(() => {
    const today = toIsoDate(new Date());
    const upcoming = [];
    const past = [];
    const cancelled = [];

    for (const apt of appointments) {
      if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") {
        cancelled.push(apt);
      } else if (
        apt.appointmentDate >= today &&
        ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(apt.status)
      ) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    }

    return { upcoming, past, cancelled };
  }, [appointments]);

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
          Unable to load patient details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <UserRound className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">No appointments found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This patient has no appointments with you.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/portal/doctor/patients">Back to patients</Link>
        </Button>
      </div>
    );
  }

  const initials = patientName
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const lastReason = appointments.find((a) => a.reason)?.reason || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/doctor/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to patients
      </Link>

      {/* Patient header card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-brand-foreground">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {patientName}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Patient #{patientId}
            </p>

            {lastReason && (
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Latest reason:{" "}
                </span>
                {lastReason}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            {buckets.upcoming.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {buckets.upcoming.length} upcoming
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {appointments.length} total visit
              {appointments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20">
          <BigStat
            icon={Calendar}
            label="Total appointments"
            value={appointments.length}
          />
          <BigStat
            icon={Clock}
            label="Upcoming"
            value={buckets.upcoming.length}
            accent={buckets.upcoming.length > 0}
          />
          <BigStat
            icon={CheckCircle2}
            label="Completed"
            value={buckets.past.length}
          />
        </div>
      </div>

      {/* Upcoming */}
      {buckets.upcoming.length > 0 && (
        <Section
          title="Upcoming appointments"
          count={buckets.upcoming.length}
          icon={Calendar}
        >
          <ul className="divide-y divide-border">
            {buckets.upcoming.map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </ul>
        </Section>
      )}

      {/* Past */}
      {buckets.past.length > 0 && (
        <Section
          title="Past appointments"
          count={buckets.past.length}
          icon={CheckCircle2}
        >
          <ul className="divide-y divide-border">
            {buckets.past.map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </ul>
        </Section>
      )}

      {/* Cancelled */}
      {buckets.cancelled.length > 0 && (
        <Section
          title="Cancelled appointments"
          count={buckets.cancelled.length}
          icon={CalendarX2}
        >
          <ul className="divide-y divide-border">
            {buckets.cancelled.map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function BigStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            accent
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, count, icon: Icon, children }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand" />
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        </div>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function AppointmentRow({ appointment }) {
  const date = new Date(appointment.appointmentDate + "T00:00:00");
  const s = appointment.status;

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border",
          s === "CHECKED_IN"
            ? "border-brand bg-brand text-brand-foreground"
            : s === "CANCELLED" || s === "NO_SHOW"
            ? "border-destructive/20 bg-destructive/5"
            : "border-brand/20 bg-brand-soft"
        )}
      >
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            s === "CHECKED_IN"
              ? "text-brand-foreground/80"
              : s === "CANCELLED"
              ? "text-destructive"
              : "text-brand-soft-foreground/80"
          )}
        >
          {date.toLocaleString("en-IN", { month: "short" })}
        </p>
        <p
          className={cn(
            "text-base font-bold leading-tight",
            s === "CHECKED_IN"
              ? "text-brand-foreground"
              : s === "CANCELLED"
              ? "text-destructive"
              : "text-brand-soft-foreground"
          )}
        >
          {date.getDate()}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">
            {date.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <StatusPill status={s} />
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(appointment.startTime)} –{" "}
          {formatTime(appointment.endTime)}
        </p>

        {appointment.reason && (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Reason: </span>
            {appointment.reason}
          </p>
        )}
      </div>
    </li>
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
      icon: CalendarX2,
      class: "bg-destructive/10 text-destructive",
    },
  };
  const c = map[status] || map.SCHEDULED;
  const Icon = c.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        c.class
      )}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
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