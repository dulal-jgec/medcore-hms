"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  CalendarCheck,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ALL_APPOINTMENTS,
  DEPARTMENTS_LIST,
  getAdminAppointmentStats,
} from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminAppointmentsPage() {
  const [tab, setTab] = useState("today");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  const stats = getAdminAppointmentStats();

  const baseList = useMemo(() => {
    if (tab === "today")
      return ALL_APPOINTMENTS.filter((a) => a.date === "2026-09-13");
    if (tab === "upcoming")
      return ALL_APPOINTMENTS.filter(
        (a) => a.status === "CONFIRMED" || a.status === "PENDING"
      );
    if (tab === "completed")
      return ALL_APPOINTMENTS.filter((a) => a.status === "COMPLETED");
    if (tab === "cancelled")
      return ALL_APPOINTMENTS.filter((a) => a.status === "CANCELLED");
    return ALL_APPOINTMENTS;
  }, [tab]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return baseList.filter((a) => {
      const matchQuery =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q);
      const matchDept = dept === "all" || a.department === dept;
      return matchQuery && matchDept;
    });
  }, [baseList, query, dept]);

  const hasFilters = query || dept !== "all";

  function clearFilters() {
    setQuery("");
    setDept("all");
  }

  const counts = {
    today: stats.today,
    upcoming: stats.upcoming,
    all: ALL_APPOINTMENTS.length,
    completed: ALL_APPOINTMENTS.filter((a) => a.status === "COMPLETED").length,
    cancelled: ALL_APPOINTMENTS.filter((a) => a.status === "CANCELLED").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hospital Overview
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            All appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every appointment scheduled across all departments today and beyond.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MiniStat
          icon={CalendarCheck}
          label="Today's appointments"
          value={stats.today}
          sub={`${stats.completed} completed`}
          accent
        />
        <MiniStat
          icon={PlayCircle}
          label="In progress"
          value={stats.inProgress}
          sub="currently with doctors"
        />
        <MiniStat
          icon={TrendingUp}
          label="Total scheduled"
          value={stats.upcoming}
          sub="confirmed + pending"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Completed all time"
          value={counts.completed}
          sub="this month"
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
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS_LIST.map((d) => (
            <option key={d.id} value={d.name}>
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Appointment filters">
          {STATUS_TABS.map(({ id, label }) => {
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

/* ══════════ Sub-components ══════════ */

function AppointmentRow({ apt }) {
  const date = new Date(apt.date);
  const isToday = apt.date === "2026-09-13";
  const isInProgress = apt.status === "IN_PROGRESS";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Date/Time box */}
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border",
            isInProgress
              ? "border-brand bg-brand text-brand-foreground"
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
                {apt.time.split(" ")[1]}
              </p>
              <p
                className={cn(
                  "text-base font-bold leading-tight",
                  isInProgress
                    ? "text-brand-foreground"
                    : "text-brand-soft-foreground"
                )}
              >
                {apt.time.split(" ")[0]}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {date.toLocaleString("en-IN", { month: "short" })}
              </p>
              <p className="text-2xl font-bold leading-none">
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
              {apt.patientName}
            </h3>
            <StatusPill status={apt.status} />
            <TypeBadge type={apt.type} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              {apt.doctorName}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {apt.department}
            </span>
            {!isToday && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {apt.time}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span>{" "}
            {apt.reason}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isInProgress && (
            <Button size="sm">
              <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
          )}
          {apt.status === "CONFIRMED" && (
            <Button size="sm" variant="outline">
              Reschedule
            </Button>
          )}
          {(apt.status === "COMPLETED" || apt.status === "CANCELLED") && (
            <Button size="sm" variant="outline">
              View details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    CONFIRMED: {
      label: "Confirmed",
      icon: CheckCircle2,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    PENDING: {
      label: "Pending",
      icon: AlertCircle,
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    IN_PROGRESS: {
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
  };
  const config = map[status] || map.PENDING;
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