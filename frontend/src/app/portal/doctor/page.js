"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getMyDoctorProfile, getDoctorSchedules } from "@/services/doctor.service";
import { getDoctorAppointments } from "@/services/appointment.service";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_SHORT = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const DAY_LABEL = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default function DoctorDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyDoctorProfile();
        const doctor = profileRes.data;
        if (!mounted) return;
        setProfile(doctor);

        const [scheduleRes, apptRes] = await Promise.all([
          getDoctorSchedules(doctor.id).catch(() => ({ data: [] })),
          getDoctorAppointments(doctor.id, { page: 0, size: 100 }).catch(
            () => ({ data: { items: [] } })
          ),
        ]);

        if (!mounted) return;

        setSchedules(
          Array.isArray(scheduleRes.data) ? scheduleRes.data : []
        );
        setAppointments(
          apptRes.data?.items || apptRes.data?.content || []
        );
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load your dashboard.");
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

  const stats = useMemo(() => {
    const todayList = appointments
      .filter((a) => a.appointmentDate === today)
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

    const upcoming = appointments.filter(
      (a) =>
        a.appointmentDate > today &&
        !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.status)
    );

    const inConsult = todayList.find((a) => a.status === "CHECKED_IN");

    const uniquePatients = new Set(appointments.map((a) => a.patientId));

    const todayCompleted = todayList.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    return {
      todayList,
      todayCount: todayList.length,
      todayCompleted,
      upcoming: upcoming.length,
      patients: uniquePatients.size,
      scheduleSlots: schedules.filter((s) => s.available).length,
      inConsult,
    };
  }, [appointments, schedules, today]);

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
          Unable to load your dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Doctor profile is missing."}
        </p>
      </div>
    );
  }

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
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {stripDrPrefix(profile.doctorName)} 🩺
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.todayCount} appointment
                {stats.todayCount !== 1 ? "s" : ""}
              </span>{" "}
              today, {stats.todayCompleted} already completed.
              {stats.upcoming > 0 && (
                <>
                  {" "}
                  {stats.upcoming} upcoming this week.
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-primary-foreground/70">
              {profile.specialization && (
                <span className="inline-flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-brand" />
                  {profile.specialization}
                </span>
              )}
              {profile.hospitalName && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {profile.hospitalName}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/doctor/appointments">
                Today&apos;s schedule
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link
                href={`/hospitals/${profile.hospitalId}/doctors/${profile.id}`}
                target="_blank"
              >
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Public profile
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
          value={stats.todayCount}
          sub={`${stats.todayCompleted} completed`}
          href="/portal/doctor/appointments"
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Upcoming"
          value={stats.upcoming}
          sub="this week"
          href="/portal/doctor/appointments"
        />
        <StatCard
          icon={Users}
          label="Patients treated"
          value={stats.patients}
          sub="unique patients"
          href="/portal/doctor/appointments"
        />
        <StatCard
          icon={Award}
          label="Weekly slots"
          value={stats.scheduleSlots}
          sub="active availability"
          href="/portal/doctor/schedule"
        />
      </div>

      {/* ══════════ CURRENT CONSULTATION ══════════ */}
      {stats.inConsult && (
        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand-soft/60 to-brand-soft/20">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <Stethoscope className="h-7 w-7" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                    In consultation
                  </p>
                </div>
                <p className="mt-1.5 text-xl font-bold tracking-tight">
                  {stats.inConsult.patientName}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatTime(stats.inConsult.startTime)} –{" "}
                  {formatTime(stats.inConsult.endTime)}
                  {stats.inConsult.reason && ` · ${stats.inConsult.reason}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link
                  href={`/portal/doctor/appointments#apt-${stats.inConsult.id}`}
                >
                  <FileText className="mr-1.5 h-4 w-4" />
                  Open consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Today&apos;s schedule
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stats.todayCount} appointment
                  {stats.todayCount !== 1 ? "s" : ""} · {stats.todayCompleted}{" "}
                  completed
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

            {stats.todayList.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-semibold">
                  No appointments today
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enjoy the quiet day or update your schedule.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {stats.todayList.slice(0, 5).map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"
                  >
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 px-2 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {getMeridiem(apt.startTime)}
                      </p>
                      <p className="text-base font-bold leading-tight">
                        {formatTime(apt.startTime)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {apt.patientName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                        {apt.reason && ` · ${apt.reason}`}
                      </p>
                    </div>

                    <StatusPill status={apt.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Weekly schedule preview */}
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
            {DAY_ORDER.map((day) => {
              const daySchedules = schedules.filter(
                (s) => s.dayOfWeek === day && s.available
              );

              const isToday =
                new Date().toLocaleString("en-IN", {
                  weekday: "long",
                }) === DAY_LABEL[day];

              return (
                <li
                  key={day}
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
                      {DAY_SHORT[day]}
                      {isToday && (
                        <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground">
                          Today
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {daySchedules.length === 0
                        ? "Off"
                        : daySchedules
                            .map(
                              (s) =>
                                `${formatTime(s.startTime)}–${formatTime(
                                  s.endTime
                                )}`
                            )
                            .join(", ")}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      daySchedules.length === 0
                        ? "bg-muted text-muted-foreground"
                        : "bg-brand-soft text-brand-soft-foreground"
                    )}
                  >
                    {daySchedules.length === 0
                      ? "Off"
                      : `${daySchedules.length} block${
                          daySchedules.length > 1 ? "s" : ""
                        }`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

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
            icon={CalendarDays}
            label="All appointments"
            desc="Today, upcoming & past"
            href="/portal/doctor/appointments"
            accent
          />
          <ActionTile
            icon={CalendarClock}
            label="Manage schedule"
            desc="Set weekly availability"
            href="/portal/doctor/schedule"
          />
          <ActionTile
            icon={Users}
            label="My patients"
            desc="Look up patient records"
            href="/portal/doctor/patients"
          />
          <ActionTile
            icon={FileText}
            label="Prescriptions"
            desc="Recently issued"
            href="/portal/doctor/prescriptions"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
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
      icon: AlertCircle,
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
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/* ══════════ Helpers ══════════ */

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
  const minute = m ?? "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${minute} ${suffix}`;
}

function getMeridiem(time) {
  if (!time) return "";
  const [h] = time.split(":");
  return Number(h) >= 12 ? "PM" : "AM";
}

function stripDrPrefix(name) {
  if (!name) return "Doctor";
  return name.replace(/^Dr\.?\s*/i, "");
}