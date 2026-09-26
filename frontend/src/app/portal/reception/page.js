"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  PlayCircle,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { getMyReceptionistProfile } from "@/services/receptionist.service";
import { getAppointments } from "@/services/appointment.service";

const PAGE_SIZE = 100;

export default function ReceptionDashboardPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, appointmentsRes] = await Promise.all([
          getMyReceptionistProfile(),
          getAppointments({
            page: 0,
            size: PAGE_SIZE,
            sortBy: "appointmentDate",
            sortDir: "asc",
          }),
        ]);

        if (!mounted) return;

        setProfile(profileRes.data);
        setAppointments(appointmentsRes.data?.items || appointmentsRes.data?.content || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load dashboard.");
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

  const stats = useMemo(() => {
    const todayList = [];
    const waiting = [];
    const completed = [];
    const upcoming = [];
    const cancelled = [];

    for (const apt of appointments) {
      if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") {
        cancelled.push(apt);
        continue;
      }
      if (apt.appointmentDate === today) {
        todayList.push(apt);
        if (apt.status === "CHECKED_IN") waiting.push(apt);
        if (apt.status === "COMPLETED") completed.push(apt);
      } else if (apt.appointmentDate > today) {
        upcoming.push(apt);
      }
    }

    const asc = (a, b) =>
      (a.appointmentDate + " " + (a.startTime || "")).localeCompare(
        b.appointmentDate + " " + (b.startTime || "")
      );

    todayList.sort(asc);
    waiting.sort(asc);
    completed.sort(asc);
    upcoming.sort(asc);

    return {
      today: todayList,
      waiting,
      completed,
      upcoming,
      cancelled,
      totalToday: todayList.length,
    };
  }, [appointments, today]);

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Receptionist profile is missing."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* HERO */}
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
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              {profile.hospitalName && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{profile.hospitalName}</span>
                </>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {profile.fullName?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.waiting.length} patient
                {stats.waiting.length !== 1 ? "s" : ""} waiting
              </span>{" "}
              and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.totalToday} appointment
                {stats.totalToday !== 1 ? "s" : ""}
              </span>{" "}
              today.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/reception/appointments/new">
                <CalendarCheck className="mr-1.5 h-4 w-4" />
                New appointment
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/reception/patients">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Patients
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Today's appointments"
          value={stats.totalToday}
          sub={`${stats.completed.length} completed`}
          href="/portal/reception/appointments"
          accent
        />
        <StatCard
          icon={Clock}
          label="Waiting in queue"
          value={stats.waiting.length}
          sub="Checked in"
          href="/portal/reception/queue"
          alert={stats.waiting.length > 0}
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming (future)"
          value={stats.upcoming.length}
          sub="Beyond today"
          href="/portal/reception/appointments"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed today"
          value={stats.completed.length}
          sub="Visits finished"
          href="/portal/reception/appointments"
        />
      </div>

      {/* MAIN */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Live queue
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {stats.waiting.length}
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

            {stats.waiting.length > 0 ? (
              <ul className="divide-y divide-border">
                {stats.waiting.slice(0, 5).map((apt) => (
                  <li key={apt.id} className="flex items-center gap-4 p-4 sm:p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-bold text-brand-foreground">
                      {apt.patientName?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {apt.patientName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {apt.doctorName}
                      </p>
                      <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(apt.startTime)}
                        </span>
                      </p>
                    </div>
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

          {/* Today's schedule preview */}
          <div className="mt-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Today&apos;s schedule
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stats.totalToday} appointment
                  {stats.totalToday !== 1 ? "s" : ""} today
                </p>
              </div>
              <Link
                href="/portal/reception/appointments"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {stats.today.length > 0 ? (
              <ul className="divide-y divide-border">
                {stats.today.slice(0, 6).map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center gap-4 p-4 sm:p-5"
                  >
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {getMeridiem(apt.startTime)}
                      </p>
                      <p className="text-base font-bold leading-tight">
                        {formatTimeShort(apt.startTime)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {apt.patientName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {apt.doctorName}
                      </p>
                    </div>

                    <StatusPill status={apt.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  No appointments today
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Upcoming
              </h2>
            </div>
          </div>

          {stats.upcoming.length > 0 ? (
            <ul className="divide-y divide-border">
              {stats.upcoming.slice(0, 6).map((apt) => (
                <li key={apt.id} className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                    {apt.patientName?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {apt.patientName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {formatDate(apt.appointmentDate)} ·{" "}
                      {formatTime(apt.startTime)}
                    </p>
                  </div>
                  <StatusPill status={apt.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No upcoming appointments.
            </div>
          )}

          <div className="border-t border-border p-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/portal/reception/appointments">
                View all appointments
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common front desk tasks
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={CalendarCheck}
            label="Book appointment"
            desc="Schedule a visit"
            href="/portal/reception/appointments/new"
            accent
          />
          <ActionTile
            icon={Clock}
            label="Live queue"
            desc={`${stats.waiting.length} waiting`}
            href="/portal/reception/queue"
          />
          <ActionTile
            icon={Users}
            label="Patients"
            desc="Lookup or register"
            href="/portal/reception/patients"
          />
          <ActionTile
            icon={PlayCircle}
            label="Check in"
            desc="Mark arrival"
            href="/portal/reception/queue"
          />
        </div>
      </div>
    </div>
  );
}

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
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>
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

function StatusPill({ status }) {
  const map = {
    SCHEDULED: { label: "Scheduled", class: "bg-muted text-muted-foreground" },
    CONFIRMED: {
      label: "Confirmed",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    CHECKED_IN: { label: "Checked in", class: "bg-brand text-brand-foreground" },
    COMPLETED: { label: "Completed", class: "bg-muted text-muted-foreground" },
    CANCELLED: {
      label: "Cancelled",
      class: "bg-destructive/10 text-destructive",
    },
    NO_SHOW: { label: "No show", class: "bg-destructive/10 text-destructive" },
  };
  const c = map[status] || map.SCHEDULED;

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        c.class
      )}
    >
      {c.label}
    </span>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}