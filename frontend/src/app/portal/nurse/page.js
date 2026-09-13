"use client";

import Link from "next/link";
import {
  Users,
  Activity,
  Pill,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Heart,
  Bell,
  PlayCircle,
  BedDouble,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NURSE_PROFILE,
  ASSIGNED_PATIENTS,
  VITALS_QUEUE,
  MEDICATION_ROUNDS,
  NURSING_TASKS,
  DOCTOR_REQUESTS,
  getNurseStats,
} from "@/lib/nurse-mock-data";

const PRIORITY_STYLES = {
  HIGH: { label: "High", class: "bg-destructive/10 text-destructive" },
  URGENT: { label: "Urgent", class: "bg-destructive/10 text-destructive" },
  MEDIUM: {
    label: "Medium",
    class: "bg-highlight-soft text-highlight-soft-foreground",
  },
  NORMAL: { label: "Normal", class: "bg-muted text-muted-foreground" },
  LOW: { label: "Low", class: "bg-muted text-muted-foreground" },
};

export default function NurseDashboard() {
  const stats = getNurseStats();

  const criticalPatients = ASSIGNED_PATIENTS.filter(
    (p) => p.status === "CRITICAL"
  );
  const topVitals = VITALS_QUEUE.filter(
    (v) => v.overdue || v.priority === "URGENT"
  ).slice(0, 3);
  const upcomingMeds = MEDICATION_ROUNDS.filter(
    (m) =>
      m.status === "PENDING" ||
      m.status === "IN_PROGRESS" ||
      m.status === "OVERDUE"
  ).slice(0, 3);
  const highPriorityTasks = NURSING_TASKS.filter(
    (t) => t.priority === "HIGH" && t.status !== "COMPLETED"
  ).slice(0, 3);

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
              <span>
                {NURSE_PROFILE.shift} shift · {NURSE_PROFILE.ward}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {NURSE_PROFILE.fullName.split(" ")[0]} 💉
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.vitalsOverdue} overdue vitals
              </span>
              ,{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.medicationsOverdue} overdue medication
                {stats.medicationsOverdue !== 1 ? "s" : ""}
              </span>
              , and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.tasksHighPriority} high-priority task
                {stats.tasksHighPriority !== 1 ? "s" : ""}
              </span>{" "}
              right now.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/nurse/vitals">
                <Activity className="mr-1.5 h-4 w-4" />
                Record vitals
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/nurse/patients">My patients</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ DOCTOR REQUESTS ══════════ */}
      {DOCTOR_REQUESTS.length > 0 && (
        <div className="mt-6 space-y-3">
          {DOCTOR_REQUESTS.map((req) => (
            <div
              key={req.id}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4",
                req.priority === "URGENT"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border bg-muted/30"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  req.priority === "URGENT"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-brand-soft text-brand-soft-foreground"
                )}
              >
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{req.doctorName}</p>
                  {req.priority === "URGENT" && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                      Urgent
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    · {req.time}
                  </span>
                </div>
                <p className="mt-1 text-sm">{req.message}</p>
                {req.patientName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Patient: {req.patientName} · Bed {req.bed}
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                Acknowledge
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ TOP STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Assigned patients"
          value={stats.assignedPatients}
          sub={`${stats.criticalPatients} critical`}
          href="/portal/nurse/patients"
          alert={stats.criticalPatients > 0}
        />
        <StatCard
          icon={Activity}
          label="Vitals due"
          value={stats.vitalsPending}
          sub={`${stats.vitalsOverdue} overdue`}
          href="/portal/nurse/vitals"
          accent
        />
        <StatCard
          icon={Pill}
          label="Medications due"
          value={stats.medicationsDue}
          sub={`${stats.medicationsOverdue} overdue`}
          href="/portal/nurse/medications"
        />
        <StatCard
          icon={ClipboardList}
          label="Tasks pending"
          value={stats.tasksPending}
          sub={`${stats.tasksHighPriority} high priority`}
          href="/portal/nurse/tasks"
        />
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Vitals queue (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Vitals to record
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {VITALS_QUEUE.length}
                </span>
              </div>
              <Link
                href="/portal/nurse/vitals"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <ul className="divide-y divide-border">
              {topVitals.map((v) => (
                <li
                  key={v.id}
                  className={cn(
                    "flex items-center gap-4 p-4 sm:p-5",
                    v.overdue && "bg-destructive/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      v.overdue
                        ? "bg-destructive/10 text-destructive"
                        : "bg-brand-soft text-brand-soft-foreground"
                    )}
                  >
                    <Heart className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {v.patientName}
                      </p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {v.bed}
                      </span>
                      {v.overdue && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Due at {v.dueAt}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span>
                        Last BP:{" "}
                        <span className="font-medium text-foreground">
                          {v.lastRecorded.bp}
                        </span>
                      </span>
                      <span>
                        Pulse:{" "}
                        <span className="font-medium text-foreground">
                          {v.lastRecorded.pulse}
                        </span>
                      </span>
                      <span>
                        SpO₂:{" "}
                        <span className="font-medium text-foreground">
                          {v.lastRecorded.spo2}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <Button size="sm" asChild className="shrink-0">
                    <Link
                      href={`/portal/nurse/vitals/record?patientId=${v.patientId}`}
                    >
                      Record
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Critical patients (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h2 className="text-base font-semibold tracking-tight">
                Critical patients
              </h2>
            </div>
          </div>

          {criticalPatients.length > 0 ? (
            <ul className="divide-y divide-border">
              {criticalPatients.map((p) => (
                <li key={p.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <BedDouble className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {p.bed} · {p.age} yrs · {p.gender}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {p.condition}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                  >
                    <Link href={`/portal/nurse/patients/${p.id}`}>
                      View patient
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-brand" />
              <p className="mt-3 text-sm font-medium">No critical patients</p>
              <p className="mt-1 text-xs text-muted-foreground">
                All patients stable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ MEDICATIONS + TASKS ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Medications */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Medication rounds
              </h2>
            </div>
            <Link
              href="/portal/nurse/medications"
              className="text-xs font-medium text-brand hover:underline"
            >
              All rounds
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {upcomingMeds.map((round) => (
              <li
                key={round.id}
                className={cn(
                  "p-5 transition-colors hover:bg-hover/40",
                  round.status === "OVERDUE" && "bg-destructive/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      round.status === "OVERDUE"
                        ? "bg-destructive/10 text-destructive"
                        : round.status === "IN_PROGRESS"
                        ? "bg-brand text-brand-foreground"
                        : "bg-brand-soft text-brand-soft-foreground"
                    )}
                  >
                    <Pill className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {round.patientName}
                      </p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {round.bed}
                      </span>
                      <RoundStatus status={round.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {round.timeSlot} · {round.medications.length} medicine
                      {round.medications.length > 1 ? "s" : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {round.medications.slice(0, 2).map((m) => (
                        <span
                          key={m.name}
                          className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground"
                        >
                          {m.name}
                        </span>
                      ))}
                      {round.medications.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{round.medications.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" asChild className="shrink-0">
                    <Link href={`/portal/nurse/medications/${round.id}`}>
                      {round.status === "IN_PROGRESS" ? "Continue" : "Start"}
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Tasks */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                High priority tasks
              </h2>
            </div>
            <Link
              href="/portal/nurse/tasks"
              className="text-xs font-medium text-brand hover:underline"
            >
              All tasks
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {highPriorityTasks.map((task) => (
              <li key={task.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {task.title}
                      </p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      {task.patientName && (
                        <span>
                          <span className="font-medium text-foreground">
                            {task.patientName}
                          </span>{" "}
                          · Bed {task.bed}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {task.dueAt}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                    Start
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common nursing tasks
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={Activity}
            label="Record vitals"
            desc={`${stats.vitalsPending} due`}
            href="/portal/nurse/vitals"
            accent
          />
          <ActionTile
            icon={Pill}
            label="Medication round"
            desc={`${stats.medicationsDue} patients`}
            href="/portal/nurse/medications"
          />
          <ActionTile
            icon={Users}
            label="My patients"
            desc={`${stats.assignedPatients} assigned`}
            href="/portal/nurse/patients"
          />
          <ActionTile
            icon={ClipboardList}
            label="My tasks"
            desc={`${stats.tasksPending} pending`}
            href="/portal/nurse/tasks"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, alert }) {
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

function RoundStatus({ status }) {
  const map = {
    OVERDUE: { label: "Overdue", class: "bg-destructive/10 text-destructive" },
    IN_PROGRESS: {
      label: "In progress",
      class: "bg-brand text-brand-foreground",
    },
    PENDING: {
      label: "Pending",
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    COMPLETED: { label: "Completed", class: "bg-muted text-muted-foreground" },
  };
  const config = map[status] || map.PENDING;

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

function PriorityBadge({ priority }) {
  const config = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;

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