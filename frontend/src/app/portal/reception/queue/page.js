"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { getAppointments, updateAppointmentStatus } from "@/services/appointment.service";

const PAGE_SIZE = 100;
const REFRESH_MS = 30_000;

export default function ReceptionQueuePage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await getAppointments({
        page: 0,
        size: PAGE_SIZE,
        sortBy: "appointmentDate",
        sortDir: "asc",
      });
      setAppointments(result.data?.items || result.data?.content || []);
    } catch (err) {
      setError(err.message || "Unable to load queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, [initialized, isAuthenticated, load]);

  const today = toIsoDate(new Date());

  const todaysAppointments = useMemo(
    () => appointments.filter((a) => a.appointmentDate === today),
    [appointments, today]
  );

  const waiting = useMemo(
    () =>
      todaysAppointments
        .filter((a) => a.status === "CHECKED_IN")
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    [todaysAppointments]
  );

  const justCompleted = useMemo(
    () =>
      todaysAppointments
        .filter((a) => a.status === "COMPLETED")
        .sort((a, b) => (b.startTime || "").localeCompare(a.startTime || "")),
    [todaysAppointments]
  );

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
          Unable to load queue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
            Live
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Waiting queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who&apos;s waiting and mark visits as completed.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <Clock className="mr-1.5 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QueueStat
          icon={Users}
          label="Waiting now"
          value={waiting.length}
          sub="Checked in, awaiting doctor"
          accent
        />
        <QueueStat
          icon={CheckCircle2}
          label="Completed today"
          value={justCompleted.length}
          sub="Visits finished"
        />
        <QueueStat
          icon={Clock}
          label="Total today"
          value={todaysAppointments.length}
          sub="All appointments"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Currently waiting
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {waiting.length}
                </span>
              </div>
            </div>

            {waiting.length > 0 ? (
              <ul className="divide-y divide-border">
                {waiting.map((apt, index) => (
                  <QueueRow
                    key={apt.id}
                    apt={apt}
                    position={index + 1}
                    updating={updatingId === apt.id}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </ul>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-5 text-base font-semibold">Queue is empty</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  No patients waiting right now.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold tracking-tight">
                  Recently completed
                </h2>
              </div>
            </div>

            {justCompleted.length > 0 ? (
              <ul className="divide-y divide-border">
                {justCompleted.slice(0, 5).map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {apt.patientName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {apt.doctorName}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                      {formatTime(apt.startTime)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">
                No completed visits yet
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Queue refreshes every 30 seconds. Order is based on check-in
              time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueueRow({ apt, position, updating, onStatusChange }) {
  return (
    <li
      className={cn(
        "relative p-4 sm:p-5",
        position === 1 && "bg-brand-soft/30"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold",
              position === 1
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {position}
          </div>
          {position === 1 && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand">
              Next
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {apt.patientName}
            </h3>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
            </span>
            <span>Doctor: {apt.doctorName}</span>
          </div>

          {apt.reason && (
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{apt.reason}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button
            size="sm"
            disabled={updating}
            onClick={() => onStatusChange(apt, "COMPLETED")}
          >
            {updating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Mark complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={updating}
            onClick={() => onStatusChange(apt, "NO_SHOW")}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            No show
          </Button>
        </div>
      </div>
    </li>
  );
}

function QueueStat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
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
    case "COMPLETED": return "Mark this visit as completed?";
    case "NO_SHOW": return "Mark this patient as no-show?";
    case "CANCELLED": return "Cancel this appointment?";
    case "CHECKED_IN": return "Check in this patient?";
    case "CONFIRMED": return "Confirm this appointment?";
    default: return null;
  }
}