"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getAppointmentById } from "@/services/appointment.service";

export default function AdminAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id;

  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    if (!appointmentId) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getAppointmentById(appointmentId);
        if (!mounted) return;
        setAppointment(result.data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load appointment.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated, appointmentId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load appointment
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This appointment does not exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/admin/appointments">Back to appointments</Link>
        </Button>
      </div>
    );
  }

  const date = new Date(appointment.appointmentDate + "T00:00:00");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Header card */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative overflow-hidden bg-primary p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">
                Appointment
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                #{appointment.id}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/70">
                Booked on {formatDate(appointment.createdAt)}
              </p>
            </div>

            <StatusPill status={appointment.status} />
          </div>
        </div>

        {/* Schedule */}
        <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
          <div className="bg-card p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Date
            </div>
            <p className="mt-2 text-sm font-semibold">
              {date.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-card p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3 w-3" />
              Time
            </div>
            <p className="mt-2 text-sm font-semibold">
              {formatTime(appointment.startTime)} –{" "}
              {formatTime(appointment.endTime)}
            </p>
          </div>

          <div className="bg-card p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Status
            </div>
            <p className="mt-2 text-sm font-semibold">
              {formatStatus(appointment.status)}
            </p>
          </div>
        </div>
      </div>

      {/* Patient + Doctor */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <DetailCard
          icon={UserRound}
          eyebrow="Patient"
          title={appointment.patientName || "Unknown patient"}
          rows={[
            { label: "Patient ID", value: `#${appointment.patientId}` },
          ]}
        />

        <DetailCard
          icon={Stethoscope}
          eyebrow="Doctor"
          title={appointment.doctorName || "—"}
          rows={[
            { label: "Doctor ID", value: `#${appointment.doctorId}` },
          ]}
        />
      </div>

      {/* Hospital */}
      <div className="mt-4">
        <DetailCard
          icon={Building2}
          eyebrow="Hospital"
          title={appointment.hospitalName || "—"}
          rows={[
            { label: "Hospital ID", value: `#${appointment.hospitalId}` },
          ]}
        />
      </div>

      {/* Reason */}
      {appointment.reason && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Reason for visit
          </div>
          <p className="mt-3 text-sm leading-6">{appointment.reason}</p>
        </div>
      )}

      {/* Admin notice */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          Administrators have view-only access to appointment records. Status
          changes, check-ins, and cancellations are handled by the assigned
          doctor or receptionist.
        </p>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function DetailCard({ icon: Icon, eyebrow, title, rows }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-brand">
        <Icon className="h-3 w-3" />
        {eyebrow}
      </div>
      <p className="mt-3 truncate text-base font-semibold tracking-tight">
        {title}
      </p>
      <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    SCHEDULED: "bg-muted text-muted-foreground",
    CONFIRMED: "bg-brand-soft text-brand-soft-foreground",
    CHECKED_IN: "bg-brand text-brand-foreground",
    COMPLETED: "bg-muted text-muted-foreground",
    CANCELLED: "bg-destructive/10 text-destructive",
    NO_SHOW: "bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider",
        map[status] || map.SCHEDULED
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      {formatStatus(status)}
    </span>
  );
}

/* ══════════ Helpers ══════════ */

function formatStatus(status) {
  if (!status) return "—";
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}