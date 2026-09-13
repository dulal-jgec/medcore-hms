"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Users,
  FlaskConical,
  FileText,
  Clock,
  Activity,
  ChevronRight,
  Stethoscope,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Sparkles,
  Plus,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DOCTOR_PROFILE,
  TODAYS_APPOINTMENTS,
  ASSIGNED_PATIENTS,
  PENDING_LAB_REPORTS,
  RECENT_PRESCRIPTIONS,
  WEEKLY_SCHEDULE,
  getDoctorStats,
} from "@/lib/doctor-mock-data";

export default function DoctorDashboard() {
  const stats = getDoctorStats();
  const currentAppointment = TODAYS_APPOINTMENTS.find(
    (a) => a.status === "in_progress"
  );
  const upcomingToday = TODAYS_APPOINTMENTS.filter(
    (a) => a.status === "confirmed"
  );
  const criticalPatients = ASSIGNED_PATIENTS.filter(
    (p) => p.status === "critical"
  );

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
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {DOCTOR_PROFILE.fullName.replace("Dr. ", "")} 🩺
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.todayUpcoming} more appointments
              </span>{" "}
              today and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.pendingReports} lab reports
              </span>{" "}
              waiting for your review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/doctor/appointments">
                 
                Today's schedule
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/doctor/patients">
                My patients
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ STATS ROW ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Today's appointments"
          value={stats.todayTotal}
          sub={`${stats.todayCompleted} completed`}
          href="/portal/doctor/appointments"
          accent
        />
        <StatCard
          icon={Users}
          label="Active patients"
          value={stats.activePatients}
          sub={`${criticalPatients.length} critical`}
          href="/portal/doctor/patients"
          alert={criticalPatients.length > 0}
        />
        <StatCard
          icon={FlaskConical}
          label="Reports to review"
          value={stats.pendingReports}
          sub="Awaiting your input"
          href="/portal/doctor/lab-reports"
        />
        <StatCard
          icon={Award}
          label="Rating"
          value={DOCTOR_PROFILE.rating}
          sub={`${DOCTOR_PROFILE.totalPatients} patients treated`}
          href="/portal/doctor/profile"
        />
      </div>

      {/* ══════════ CURRENT CONSULTATION (if any) ══════════ */}
      {currentAppointment && (
        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand-soft/60 to-brand-soft/20">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <PlayCircle className="h-7 w-7" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                    In consultation
                  </p>
                </div>
                <p className="mt-1.5 text-xl font-bold tracking-tight">
                  {currentAppointment.patientName}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {currentAppointment.age} yrs · {currentAppointment.gender} ·{" "}
                  {currentAppointment.reason}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="lg">
                <FileText className="mr-1.5 h-4 w-4" />
                Write prescription
              </Button>
              <Button size="lg" variant="outline">
                View history
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's schedule (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Today's schedule
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stats.todayTotal} appointments ·{" "}
                  {stats.todayCompleted} completed
                </p>
              </div>
              <Link
                href="/portal/doctor/appointments"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <ul className="divide-y divide-border">
              {upcomingToday.slice(0, 5).map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-hover/40 sm:p-5"
                >
                  {/* Time */}
                  <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {apt.time.split(" ")[1]}
                    </p>
                    <p className="text-base font-bold leading-tight">
                      {apt.time.split(" ")[0]}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {apt.patientName}
                      </p>
                      <TypeBadge type={apt.type} />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {apt.age} yrs · {apt.gender} · {apt.reason}
                    </p>
                  </div>

                  {/* Action */}
                  <Button size="sm" variant="outline" className="shrink-0">
                    Start
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Weekly schedule peek (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              This week
            </h2>
            <Link
              href="/portal/doctor/schedule"
              className="text-xs font-medium text-brand hover:underline"
            >
              Full schedule
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {WEEKLY_SCHEDULE.map((day) => {
              const isOff = day.slots === 0;
              const isToday =
                day.day === new Date().toLocaleString("en-IN", { weekday: "long" });
              return (
                <li
                  key={day.day}
                  className={cn(
                    "flex items-center justify-between gap-3 px-5 py-3",
                    isToday && "bg-brand-soft/40"
                  )}
                >
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isToday && "text-brand-soft-foreground"
                      )}
                    >
                      {day.day}
                      {isToday && (
                        <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground">
                          Today
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {day.hours}
                    </p>
                  </div>
                  {!isOff ? (
                    <div className="flex shrink-0 flex-col items-end">
                      <p className="text-xs font-semibold">
                        {day.booked}/{day.slots}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        slots
                      </p>
                    </div>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Off
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ══════════ TWO COLUMNS: Reports + Recent Rx ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Pending lab reports */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Lab reports to review
              </h2>
            </div>
            <Link
              href="/portal/doctor/lab-reports"
              className="text-xs font-medium text-brand hover:underline"
            >
              All
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {PENDING_LAB_REPORTS.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="flex items-start gap-3 p-5 transition-colors hover:bg-hover/40"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    r.priority === "urgent"
                      ? "bg-destructive/10 text-destructive"
                      : r.status === "ready"
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "bg-highlight-soft text-highlight-soft-foreground"
                  )}
                >
                  <FlaskConical className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {r.testName}
                    </p>
                    {r.priority === "urgent" && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {r.patientName} · Ordered {r.orderedOn}
                  </p>
                </div>
                {r.status === "ready" ? (
                  <Button size="sm" variant="outline" className="shrink-0">
                    Review
                  </Button>
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Processing
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Recent prescriptions */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Recent prescriptions
              </h2>
            </div>
            <Link
              href="/portal/doctor/prescriptions"
              className="text-xs font-medium text-brand hover:underline"
            >
              All
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {RECENT_PRESCRIPTIONS.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 p-5 transition-colors hover:bg-hover/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {p.patientName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {p.diagnosis} · {p.medicineCount} medicines
                  </p>
                </div>
                <p className="shrink-0 text-[11px] text-muted-foreground">
                  {p.issuedOn}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══════════ CRITICAL PATIENTS (if any) ══════════ */}
      {criticalPatients.length > 0 && (
        <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Needs attention
              </p>
              <p className="mt-1 text-sm">
                <span className="font-semibold">
                  {criticalPatients.length} critical patient
                  {criticalPatients.length > 1 ? "s" : ""}
                </span>{" "}
                in your care —{" "}
                {criticalPatients.map((p) => p.name).join(", ")}
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/portal/doctor/patients">View</Link>
            </Button>
          </div>
        </div>
      )}

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common tasks during your shift
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={Plus}
            label="Write prescription"
            desc="For current patient"
            href="/portal/doctor/prescriptions/new"
            accent
          />
          <ActionTile
            icon={FlaskConical}
            label="Order lab test"
            desc="New diagnostic request"
            href="/portal/doctor/lab-reports"
          />
          <ActionTile
            icon={Users}
            label="Patient history"
            desc="Look up any patient"
            href="/portal/doctor/patients"
          />
          <ActionTile
            icon={Clock}
            label="Manage schedule"
            desc="Set availability"
            href="/portal/doctor/schedule"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, alert }) {
  const iconStyle = alert
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
            iconStyle
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {sub}
      </p>
    </Link>
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