"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  PlayCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getAppointments } from "@/services/appointment.service";

const PAGE_SIZE = 100;

const TABS = [
  { id: "today", label: "Today" },
  { id: "in_progress", label: "In progress" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

export default function AdminAppointmentsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("today");
  const [query, setQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");

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
          sortDir: "desc",
        });

        if (!mounted) return;
        setAppointments(result.data?.items || result.data?.content || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load appointments.");
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

  const doctors = useMemo(() => {
    const map = new Map();
    for (const apt of appointments) {
      if (apt.doctorId && !map.has(apt.doctorId)) {
        map.set(apt.doctorId, {
          id: apt.doctorId,
          name: apt.doctorName || `Doctor #${apt.doctorId}`,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [appointments]);

  const stats = useMemo(() => {
    const todayList = appointments.filter(
      (a) => a.appointmentDate === today
    );
    const inProgress = appointments.filter((a) => a.status === "CHECKED_IN");
    const upcoming = appointments.filter(
      (a) =>
        a.appointmentDate > today &&
        !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status)
    );
    const completed = appointments.filter((a) => a.status === "COMPLETED");
    const cancelled = appointments.filter(
      (a) => a.status === "CANCELLED" || a.status === "NO_SHOW"
    );

    return { todayList, inProgress, upcoming, completed, cancelled };
  }, [appointments, today]);

  const buckets = useMemo(() => {
    const byDateDesc = (a, b) =>
      (b.appointmentDate + " " + (b.startTime || "")).localeCompare(
        a.appointmentDate + " " + (a.startTime || "")
      );
    const byDateAsc = (a, b) => -byDateDesc(a, b);

    return {
      today: [...stats.todayList].sort(byDateAsc),
      in_progress: [...stats.inProgress].sort(byDateAsc),
      upcoming: [...stats.upcoming].sort(byDateAsc),
      completed: [...stats.completed].sort(byDateDesc),
      cancelled: [...stats.cancelled].sort(byDateDesc),
      all: [...appointments].sort(byDateDesc),
    };
  }, [appointments, stats]);

  const filtered = useMemo(() => {
    const list = buckets[tab] || [];
    const q = query.trim().toLowerCase();

    return list.filter((apt) => {
      const matchesQuery =
        !q ||
        apt.patientName?.toLowerCase().includes(q) ||
        apt.doctorName?.toLowerCase().includes(q);

      const matchesDoctor =
        doctorFilter === "all" || String(apt.doctorId) === doctorFilter;

      return matchesQuery && matchesDoctor;
    });
  }, [buckets, tab, query, doctorFilter]);

  const counts = useMemo(
    () => ({
      today: buckets.today.length,
      in_progress: buckets.in_progress.length,
      upcoming: buckets.upcoming.length,
      completed: buckets.completed.length,
      cancelled: buckets.cancelled.length,
      all: buckets.all.length,
    }),
    [buckets]
  );

  const hasFilters = query.trim() !== "" || doctorFilter !== "all";

  function clearFilters() {
    setQuery("");
    setDoctorFilter("all");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hospital Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            All appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View every appointment scheduled across your hospital.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          View-only · Admin cannot modify
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          icon={CalendarCheck}
          label="Today's appointments"
          value={counts.today}
          sub={`${counts.in_progress} in progress`}
          accent
        />
        <MiniStat
          icon={PlayCircle}
          label="In progress"
          value={counts.in_progress}
          sub="currently with doctors"
        />
        <MiniStat
          icon={Calendar}
          label="Upcoming"
          value={counts.upcoming}
          sub="future appointments"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Completed"
          value={counts.completed}
          sub={`${counts.cancelled} cancelled`}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient or doctor..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
        >
          <option value="all">All doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Appointment filters"
        >
          {TABS.map(({ id, label }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground"
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
          filtered.map((apt) => (
            <AppointmentRow
              key={apt.id}
              apt={apt}
              isToday={apt.appointmentDate === today}
            />
          ))
        ) : (
          <EmptyState tab={tab} hasFilters={hasFilters} onClear={clearFilters} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Appointment Row ══════════ */

function AppointmentRow({ apt, isToday }) {
  const date = new Date(apt.appointmentDate + "T00:00:00");
  const isInProgress = apt.status === "CHECKED_IN";
  const isCancelled =
    apt.status === "CANCELLED" || apt.status === "NO_SHOW";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Date / Time box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isInProgress
              ? "border-brand bg-brand text-brand-foreground"
              : isCancelled
              ? "border-destructive/20 bg-destructive/5"
              : isToday
              ? "border-brand/20 bg-brand-soft"
              : "border-border bg-muted/40"
          )}
        >
          {isToday ? (
            <>
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isInProgress
                    ? "text-brand-foreground/80"
                    : "text-brand-soft-foreground/80"
                )}
              >
                {getMeridiem(apt.startTime)}
              </p>
              <p
                className={cn(
                  "text-base font-bold leading-tight",
                  isInProgress
                    ? "text-brand-foreground"
                    : "text-brand-soft-foreground"
                )}
              >
                {formatTimeShort(apt.startTime)}
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
              <p className="mt-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                {date.toLocaleString("en-IN", { weekday: "short" })}
              </p>
            </>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {apt.patientName || "Unknown patient"}
            </h3>
            <StatusPill status={apt.status} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              {apt.doctorName || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {apt.hospitalName || "—"}
            </span>
          </div>

          {apt.reason && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Reason:</span>{" "}
              {apt.reason}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/portal/admin/appointments/${apt.id}`}>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Status Pill ══════════ */

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
      label: "In progress",
      icon: PlayCircle,
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

/* ══════════ Mini Stat ══════════ */

function MiniStat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ══════════ Empty State ══════════ */

function EmptyState({ tab, hasFilters, onClear }) {
  const copy = {
    today: "No appointments today",
    in_progress: "No appointments in progress",
    upcoming: "No upcoming appointments",
    completed: "No completed appointments",
    cancelled: "No cancelled appointments",
    all: "No appointments yet",
  };

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <CalendarX2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No appointments match your filters" : copy[tab]}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Appointments will appear here as they are booked."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      )}
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
  const display = ((hour + 11) % 12) + 1;
  return `${display}:${m}`;
}

function getMeridiem(time) {
  if (!time) return "";
  const [h] = time.split(":");
  return Number(h) >= 12 ? "PM" : "AM";
}