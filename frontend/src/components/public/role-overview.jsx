"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "patient",
    label: "Patient",
    icon: UserRound,
    tagline: "Your care, in your hands",
    description:
      "Book appointments, view prescriptions, download lab reports, and track bills from one dashboard.",
    image: "/images/role-patient.jpg",
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
      "See today's appointments, review patient history, write prescriptions, and order lab tests.",
    image: "/images/role-doctor.jpg",
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
      "Record vitals, track medication rounds, update patient status, and coordinate with doctors.",
    image: "/images/role-nurse.jpg",
    preview: [
      { icon: Users, label: "Assigned patients", value: "18 today" },
      { icon: Activity, label: "Vitals to record", value: "6 pending" },
      { icon: Pill, label: "Medication rounds", value: "3 upcoming" },
      { icon: Calendar, label: "Handover due", value: "5:00 PM" },
    ],
  },
  {
    id: "receptionist",
    label: "Receptionist",
    icon: ClipboardList,
    tagline: "The front desk, simplified",
    description:
      "Register patients, book appointments, manage queues, and handle billing at the front desk.",
    image: "/images/role-receptionist.jpg",
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
      "Manage staff, departments, and roles. Track revenue and monitor operations.",
    image: "/images/role-admin.jpg",
    preview: [
      { icon: Users, label: "Active staff", value: "142 users" },
      { icon: ClipboardList, label: "Departments", value: "11 units" },
      { icon: Receipt, label: "Revenue this month", value: "₹18.4L" },
      { icon: Activity, label: "System uptime", value: "99.98%" },
    ],
  },
];

export function RoleOverview() {
  const [activeId, setActiveId] = useState("doctor");
  const active = ROLES.find((r) => r.id === activeId);

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
            <span className="h-px w-5 bg-brand sm:w-6" />
            Every Role
            <span className="h-px w-5 bg-brand sm:w-6" />
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            One platform, five workspaces.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Each role sees exactly what they need — nothing more, nothing less.
          </p>
        </div>

        {/* Role tabs — horizontal scroll on mobile, vertical on desktop */}
        <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-10 sm:px-0 lg:overflow-visible lg:pb-0">
          <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col lg:gap-2">
            {ROLES.map(({ id, label, icon: Icon }) => {
              const isActive = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveId(id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all sm:gap-3 sm:px-4 sm:py-3 lg:w-full lg:py-3.5",
                    isActive
                      ? "border-brand/40 bg-brand-soft text-brand-soft-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-brand/20 hover:bg-hover hover:text-hover-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8",
                      isActive
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                  <span className="whitespace-nowrap text-xs sm:text-sm lg:whitespace-normal">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview panel */}
        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-12 lg:gap-6">
          {/* Image */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-xl sm:aspect-[16/10] lg:aspect-[4/5]">
              <Image
                src={active.image}
                alt={active.label}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary-darker/85 via-primary-darker/25 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-[11px] sm:tracking-[0.18em]">
                  {active.label} view
                </p>
                <p className="mt-2 text-base font-bold leading-tight tracking-tight text-white sm:text-lg lg:text-xl">
                  {active.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:p-8">
              <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                {active.description}
              </p>

              <div className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3 sm:grid-cols-2">
                {active.preview.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-brand/30 sm:p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-tight text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold tracking-tight sm:text-base">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6">
                <Button
                  asChild
                  size="lg"
                  className="h-11 w-full sm:h-12 sm:w-auto"
                >
                  <Link href="/login">Sign in as {active.label}</Link>
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-right">
                  Access is granted by your hospital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
