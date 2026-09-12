"use client";

import { useState } from "react";
import {
  Stethoscope,
  HeartPulse,
  ClipboardList,
  ShieldCheck,
  UserRound,
  Calendar,
  FileText,
  Pill,
  Activity,
  Users,
  Building2,
  Receipt,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "patient",
    label: "Patient",
    icon: UserRound,
    tagline: "Your care, in your hands",
    description:
      "Book appointments, view prescriptions, download lab reports, and track bills — all from one dashboard.",
    preview: [
      { icon: Calendar, label: "Upcoming appointments", value: "2 scheduled" },
      { icon: FileText, label: "Lab reports ready", value: "1 new" },
      { icon: Pill, label: "Active prescriptions", value: "3 medicines" },
      { icon: Receipt, label: "Pending bill", value: "₹1,240" },
    ],
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: Stethoscope,
    tagline: "Focus on care, not paperwork",
    description:
      "See today's appointments, review patient history, write prescriptions, and order lab tests — without switching screens.",
    preview: [
      { icon: Calendar, label: "Today's appointments", value: "12 patients" },
      { icon: Users, label: "Assigned patients", value: "48 active" },
      { icon: FileText, label: "Pending reports", value: "5 to review" },
      { icon: Activity, label: "Consultations this week", value: "61" },
    ],
  },
  {
    id: "nurse",
    label: "Nurse",
    icon: HeartPulse,
    tagline: "Every patient, every check-in",
    description:
      "Record vitals, track medication rounds, update patient status, and coordinate with doctors in real time.",
    preview: [
      { icon: Users, label: "Assigned patients", value: "18 today" },
      { icon: Activity, label: "Vitals to record", value: "6 pending" },
      { icon: Pill, label: "Medication rounds", value: "3 upcoming" },
      { icon: Bell, label: "Doctor requests", value: "2 active" },
    ],
  },
  {
    id: "receptionist",
    label: "Receptionist",
    icon: ClipboardList,
    tagline: "The front desk, simplified",
    description:
      "Register patients, book appointments, manage queues, and handle billing — fast, at the front desk.",
    preview: [
      { icon: UserRound, label: "New registrations", value: "8 today" },
      { icon: Calendar, label: "Appointments booked", value: "24 today" },
      { icon: Receipt, label: "Payments received", value: "₹42,300" },
      { icon: Users, label: "Queue length", value: "5 waiting" },
    ],
  },
  {
    id: "admin",
    label: "Hospital Admin",
    icon: ShieldCheck,
    tagline: "The whole hospital, one view",
    description:
      "Manage staff, departments, and roles. Track revenue, monitor operations, and configure your hospital's workspace.",
    preview: [
      { icon: Users, label: "Active staff", value: "142 users" },
      { icon: Building2, label: "Departments", value: "11 units" },
      { icon: Receipt, label: "Revenue this month", value: "₹18.4L" },
      { icon: Activity, label: "System uptime", value: "99.98%" },
    ],
  },
];

export function RoleOverview() {
  const [activeId, setActiveId] = useState("doctor");
  const active = ROLES.find((r) => r.id === activeId);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="h-px w-6 bg-brand" />
            Every Role
            <span className="h-px w-6 bg-brand" />
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            One platform, five workspaces
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Each role sees exactly what they need — nothing more, nothing less.
            The backend enforces it; the UI respects it.
          </p>
        </div>

        {/* Selector + Preview */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {/* LEFT — role selector */}
          <div className="lg:col-span-4">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {ROLES.map(({ id, label, icon: Icon }) => {
                const isActive = id === activeId;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveId(id)}
                    className={cn(
                      "flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all lg:w-full",
                      isActive
                        ? "border-brand/30 bg-brand-soft text-brand-soft-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-brand/20 hover:bg-hover hover:text-hover-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                        isActive
                          ? "bg-brand text-brand-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT — preview panel */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
              {/* Header strip */}
              <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-highlight/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand/60" />
                </div>
                <p className="ml-2 truncate text-xs font-medium text-muted-foreground">
                  medcore / {active.id} / dashboard
                </p>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Role header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {active.label} view
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                      {active.tagline}
                    </h3>
                  </div>
                  <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-foreground">
                    Live preview
                  </span>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {active.description}
                </p>

                {/* Metric grid */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {active.preview.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-brand/30 hover:bg-hover/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-1 truncate text-base font-semibold tracking-tight">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                  <Button asChild size="sm">
                    <Link href="/login">Sign in as {active.label}</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Access is granted by your hospital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
