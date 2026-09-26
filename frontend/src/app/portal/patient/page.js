"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Heart,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getMyPatientProfile } from "@/services/patient.service";
import { getPatientAppointments } from "@/services/appointment.service";

const PAGE_SIZE = 100;

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyPatientProfile();
        const me = profileRes.data;
        if (!mounted) return;
        setPatient(me);

        const result = await getPatientAppointments(me.id, {
          page: 0,
          size: PAGE_SIZE,
        });
        if (!mounted) return;

        setAppointments(result.data?.items || result.data?.content || []);
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
    const upcoming = appointments
      .filter(
        (a) =>
          a.appointmentDate >= today &&
          !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.status)
      )
      .sort((a, b) =>
        (a.appointmentDate + " " + (a.startTime || "")).localeCompare(
          b.appointmentDate + " " + (b.startTime || "")
        )
      );

    const past = appointments.filter(
      (a) =>
        a.status === "COMPLETED" ||
        (a.appointmentDate < today && a.status !== "CANCELLED")
    );

    const cancelled = appointments.filter((a) => a.status === "CANCELLED");

    const uniqueDoctors = new Set(
      appointments.map((a) => a.doctorId).filter(Boolean)
    );

    return {
      upcoming,
      past,
      cancelled,
      next: upcoming[0] || null,
      uniqueDoctors: uniqueDoctors.size,
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

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load your dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Patient profile is missing."}
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
              {greeting}, {patient.fullName || patient.user?.fullName || "there"} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.upcoming.length} upcoming appointment
                {stats.upcoming.length !== 1 ? "s" : ""}
              </span>{" "}
              and {stats.past.length} completed visit
              {stats.past.length !== 1 ? "s" : ""}.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-primary-foreground/70">
              {patient.bloodGroup && (
                <span className="inline-flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-brand" />
                  {patient.bloodGroup}
                </span>
              )}
              {patient.user?.email && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {patient.user.email}
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
              <Link href="/hospitals">
                <Plus className="mr-1.5 h-4 w-4" />
                Book appointment
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/patient/appointments">
                My appointments
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Upcoming"
          value={stats.upcoming.length}
          sub="scheduled visits"
          href="/portal/patient/appointments"
          accent
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.past.length}
          sub="all time"
          href="/portal/patient/appointments"
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors consulted"
          value={stats.uniqueDoctors}
          sub="unique doctors"
          href="/portal/patient/appointments"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={stats.cancelled.length}
          sub="all time"
          href="/portal/patient/appointments"
        />
      </div>

      {/* ══════════ NEXT APPOINTMENT ══════════ */}
      {stats.next && (
        <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand-soft/60 to-brand-soft/20">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-foreground/80">
                  {new Date(
                    stats.next.appointmentDate + "T00:00:00"
                  ).toLocaleString("en-IN", { month: "short" })}
                </p>
                <p className="text-xl font-bold leading-tight">
                  {new Date(
                    stats.next.appointmentDate + "T00:00:00"
                  ).getDate()}
                </p>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-brand" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                    Next appointment
                  </p>
                </div>
                <p className="mt-1.5 text-xl font-bold tracking-tight">
                  {stats.next.doctorName}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(stats.next.startTime)} –{" "}
                    {formatTime(stats.next.endTime)}
                  </span>
                  {stats.next.hospitalName && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {stats.next.hospitalName}
                    </span>
                  )}
                </div>
                {stats.next.reason && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Reason:
                    </span>{" "}
                    {stats.next.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button size="lg" asChild>
                <Link
                  href={`/portal/patient/appointments#apt-${stats.next.id}`}
                >
                  View details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ RECENT APPOINTMENTS ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Recent appointments
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Latest bookings and visits
                </p>
              </div>
              <Link
                href="/portal/patient/appointments"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {appointments.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-semibold">
                  No appointments yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Book your first appointment to get started.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/hospitals">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Browse hospitals
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {appointments.slice(0, 5).map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-brand/20 bg-brand-soft/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground/80">
                        {new Date(
                          apt.appointmentDate + "T00:00:00"
                        ).toLocaleString("en-IN", { month: "short" })}
                      </p>
                      <p className="text-base font-bold leading-tight text-brand-soft-foreground">
                        {new Date(
                          apt.appointmentDate + "T00:00:00"
                        ).getDate()}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {apt.doctorName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                        {apt.hospitalName && ` · ${apt.hospitalName}`}
                      </p>
                    </div>

                    <StatusPill status={apt.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Health profile peek */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Health profile
            </h2>
            <Link
              href="/portal/patient/profile"
              className="text-xs font-medium text-brand hover:underline"
            >
              Edit
            </Link>
          </div>

          <div className="space-y-4 p-5">
            <ProfileRow
              icon={Droplets}
              label="Blood group"
              value={patient.bloodGroup || "Not set"}
            />
            <ProfileRow
              icon={Heart}
              label="Allergies"
              value={patient.allergies || "None recorded"}
            />
            <ProfileRow
              icon={ShieldCheck}
              label="Chronic conditions"
              value={patient.chronicConditions || "None recorded"}
            />
            <ProfileRow
              icon={User}
              label="Emergency contact"
              value={
                patient.emergencyContactName
                  ? `${patient.emergencyContactName}${
                      patient.emergencyContactRelation
                        ? ` (${patient.emergencyContactRelation})`
                        : ""
                    }`
                  : "Not set"
              }
            />
          </div>
        </div>
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common tasks you can do from here
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={Plus}
            label="Book appointment"
            desc="Find a doctor"
            href="/hospitals"
            accent
          />
          <ActionTile
            icon={CalendarDays}
            label="My appointments"
            desc="View all visits"
            href="/portal/patient/appointments"
          />
          <ActionTile
            icon={User}
            label="My profile"
            desc="Update your details"
            href="/portal/patient/profile"
          />
          <ActionTile
            icon={Stethoscope}
            label="Browse doctors"
            desc="Find specialists"
            href="/hospitals"
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

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
      </div>
    </div>
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
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}