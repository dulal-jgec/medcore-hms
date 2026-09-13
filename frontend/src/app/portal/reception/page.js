"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Phone,
  MapPin,
  PlayCircle,
  XCircle,
  FileText,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RECEPTIONIST_PROFILE,
  TODAY_APPOINTMENTS,
  RECENT_REGISTRATIONS,
  getReceptionStats,
} from "@/lib/reception-mock-data";

export default function ReceptionDashboard() {
  const stats = getReceptionStats();
  const waitingQueue = TODAY_APPOINTMENTS.filter(
    (a) => a.status === "CHECKED_IN"
  );
  const nextUp = TODAY_APPOINTMENTS.filter(
    (a) => a.status === "CONFIRMED" || a.status === "SCHEDULED"
  ).slice(0, 4);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>{today}</span>
              <span className="opacity-40">·</span>
              <span>{RECEPTIONIST_PROFILE.desk}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {RECEPTIONIST_PROFILE.fullName.split(" ")[0]} 👋
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.waiting} patient{stats.waiting !== 1 ? "s" : ""} waiting
              </span>{" "}
              and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.confirmed + stats.scheduled} more
              </span>{" "}
              appointments today.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/reception/patients/new">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Register patient
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/reception/appointments/new">
                <CalendarCheck className="mr-1.5 h-4 w-4" />
                Book appointment
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Today's appointments"
          value={stats.totalToday}
          sub={`${stats.completed} completed`}
          href="/portal/reception/appointments"
          accent
        />
        <StatCard
          icon={Clock}
          label="Waiting in queue"
          value={stats.waiting}
          sub="Checked in"
          href="/portal/reception/queue"
          alert={stats.waiting > 0}
        />
        <StatCard
          icon={UserPlus}
          label="New registrations"
          value={stats.registrations}
          sub="Today"
          href="/portal/reception/patients"
          trend="up"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          sub="Visits finished"
          href="/portal/reception/appointments"
        />
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Live queue (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Live queue
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {waitingQueue.length}
                </span>
              </div>
              <Link
                href="/portal/reception/queue"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                Manage queue
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {waitingQueue.length > 0 ? (
              <ul className="divide-y divide-border">
                {waitingQueue.map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-hover/40 sm:p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-bold text-brand-foreground">
                      {apt.patientName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {apt.patientName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {apt.doctorName} · {apt.department}
                      </p>
                      <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Checked in {apt.checkedInAt}
                        </span>
                        <span className="font-medium text-brand-soft-foreground">
                          Slot {apt.slot}
                        </span>
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Details
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">No one waiting</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Checked-in patients will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent registrations (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                New registrations
              </h2>
            </div>
          </div>

          {RECENT_REGISTRATIONS.length > 0 ? (
            <ul className="divide-y divide-border">
              {RECENT_REGISTRATIONS.map((reg) => (
                <li key={reg.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                    {reg.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{reg.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {reg.phone}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {reg.registeredAt}
                    </p>
                    <p className="mt-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {reg.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No registrations yet today.
            </div>
          )}

          <div className="border-t border-border p-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/portal/reception/patients/new">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Register new patient
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ NEXT UP ══════════ */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Upcoming appointments
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Next patients expected at the desk
            </p>
          </div>
          <Link
            href="/portal/reception/appointments"
            className="text-xs font-medium text-brand hover:underline"
          >
            View all
          </Link>
        </div>

        <ul className="divide-y divide-border">
          {nextUp.map((apt) => (
            <li
              key={apt.id}
              className="flex flex-col gap-3 p-4 transition-colors hover:bg-hover/40 sm:flex-row sm:items-center sm:p-5"
            >
              {/* Time */}
              <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 px-2 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {apt.slot.split(" ")[1]}
                </p>
                <p className="text-base font-bold leading-tight">
                  {apt.slot.split(" ")[0]}
                </p>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {apt.patientName}
                  </p>
                  <StatusPill status={apt.status} />
                  <TypeBadge type={apt.type} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {apt.doctorName} · {apt.department}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {apt.reason}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2">
                {apt.status === "SCHEDULED" && (
                  <>
                    <Button size="sm" variant="outline">
                      Confirm
                    </Button>
                    <Button size="sm">
                      <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                      Check in
                    </Button>
                  </>
                )}
                {apt.status === "CONFIRMED" && (
                  <Button size="sm">
                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                    Check in
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common front desk tasks
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={UserPlus}
            label="Register patient"
            desc="New patient record"
            href="/portal/reception/patients/new"
            accent
          />
          <ActionTile
            icon={CalendarCheck}
            label="Book appointment"
            desc="Schedule a visit"
            href="/portal/reception/appointments/new"
          />
          <ActionTile
            icon={Clock}
            label="Live queue"
            desc={`${stats.waiting} waiting`}
            href="/portal/reception/queue"
          />
          <ActionTile
            icon={Phone}
            label="Patient lookup"
            desc="Find existing record"
            href="/portal/reception/patients"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, alert, trend }) {
  const style = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            style
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 flex items-center gap-1 truncate text-[11px]",
          trend === "up" ? "text-brand" : "text-muted-foreground"
        )}
      >
        {trend === "up" && <CheckCircle2 className="h-3 w-3 shrink-0" />}
        {sub}
      </p>
    </Link>
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
  const config = map[status] || map.SCHEDULED;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
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

function ActionTile({ icon: Icon, label, desc, href, accent }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}