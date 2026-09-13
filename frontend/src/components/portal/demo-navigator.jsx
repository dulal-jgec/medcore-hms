"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  FlaskConical,
  Pill,
  Wallet,
  ShieldCheck,
  LayoutDashboard,
  X,
  Sparkles,
  Home,
} from "lucide-react";

const ROLES = [
  {
    slug: "patient",
    label: "Patient",
    desc: "Patient portal & records",
    icon: Users,
  },
  {
    slug: "doctor",
    label: "Doctor",
    desc: "Consultations & prescriptions",
    icon: Stethoscope,
  },
  {
    slug: "nurse",
    label: "Nurse",
    desc: "Vitals, medications, tasks",
    icon: HeartPulse,
  },
  {
    slug: "reception",
    label: "Receptionist",
    desc: "Front desk & appointments",
    icon: ClipboardList,
  },
  {
    slug: "lab",
    label: "Lab Technician",
    desc: "Diagnostic orders & reports",
    icon: FlaskConical,
  },
  {
    slug: "pharmacy",
    label: "Pharmacist",
    desc: "Prescriptions & inventory",
    icon: Pill,
  },
  {
    slug: "accounts",
    label: "Accountant",
    desc: "Billing & financial reports",
    icon: Wallet,
  },
  {
    slug: "admin",
    label: "Hospital Admin",
    desc: "Full hospital administration",
    icon: ShieldCheck,
  },
];

export function DemoNavigator() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        aria-label="Open demo navigator"
      >
        <Sparkles className="h-4 w-4 text-brand" />
        <span>Demo Mode</span>
      </button>

      {/* Panel + backdrop */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border bg-primary px-5 py-4">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  <Sparkles className="h-3 w-3" />
                  Demo Navigator
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-foreground">
                  Explore all dashboards
                </p>
                <p className="mt-0.5 text-[11px] text-primary-foreground/70">
                  Jump into any role in one click
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Role list */}
            <div className="max-h-96 overflow-y-auto p-2">
              {ROLES.map(({ slug, label, desc, icon: Icon }) => (
                <Link
                  key={slug}
                  href={`/portal/${slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-hover"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{label}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-muted/30 p-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" />
                Back to public website
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}