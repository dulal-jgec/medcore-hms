"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Loader2,
  Pill,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMyNurseProfile } from "@/services/nurse.service";

export default function NurseDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getMyNurseProfile();
        if (!mounted) return;
        setProfile(res.data);
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
          {error || "Nurse profile is missing."}
        </p>
      </div>
    );
  }

  const greeting = getGreeting();
  const firstName = (profile.name || "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-darker p-6 sm:p-10 lg:p-12">
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
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              {profile.department && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{profile.department}</span>
                </>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {greeting}, {firstName} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Your nurse workspace is being set up. Everything you need —
              patients, vitals, medications, and tasks — will appear here the
              moment the integration is complete.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-white/70">
              {profile.ward && (
                <span className="inline-flex items-center gap-1.5">
                  <HeartPulse className="h-3.5 w-3.5 text-brand" />
                  {profile.ward}
                </span>
              )}
              {profile.designation && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {profile.designation}
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
              className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/nurse/profile">
                <User className="mr-1.5 h-4 w-4" />
                My profile
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link href="/portal/nurse/patients">My patients</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════ DEV NOTE ══════════ */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-brand/20 bg-brand-soft/40 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
              A note from the team
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground">
              The nursing backend — patients, vitals, medications, and tasks —
              is partially ready. I&apos;m connecting it to this dashboard now.
              Everything you need will appear here without opening each sidebar
              item.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ MODULE TILES ══════════ */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ModuleTile
          icon={User}
          label="Assigned patients"
          desc="Patients under your care"
          href="/portal/nurse/patients"
          accent
        />
        <ModuleTile
          icon={Activity}
          label="Vitals"
          desc="Record and track readings"
          href="/portal/nurse/vitals"
        />
        <ModuleTile
          icon={Pill}
          label="Medications"
          desc="Medication rounds"
          href="/portal/nurse/medications"
        />
        <ModuleTile
          icon={ClipboardList}
          label="Tasks"
          desc="Nursing tasks for your shift"
          href="/portal/nurse/tasks"
        />
      </section>

      {/* ══════════ PROFILE SNAPSHOT ══════════ */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Your profile
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Information managed by your hospital
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoRow label="Full name" value={profile.name} />
              <InfoRow label="Role" value={profile.designation || "Nurse"} />
              <InfoRow label="Department" value={profile.department} />
              <InfoRow label="Ward" value={profile.ward} />
              <InfoRow label="Hospital" value={profile.hospitalName} />
              <InfoRow label="License no." value={profile.licenseNumber} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
              <Button asChild variant="outline">
                <Link href="/portal/nurse/profile">View full profile</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Shift info
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Today&apos;s schedule
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Ward</span>
              <span className="truncate text-right font-medium">
                {profile.ward || "Not assigned"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Department</span>
              <span className="truncate text-right font-medium">
                {profile.department || "Not assigned"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {profile.status || "Active"}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs leading-5 text-muted-foreground">
              Your shift timings and ward assignment are managed by hospital
              administration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function ModuleTile({ icon: Icon, label, desc, href, accent }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>

        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-soft-foreground">
          Soon
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold tracking-tight">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>

      <ArrowUpRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}