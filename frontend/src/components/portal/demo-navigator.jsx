"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  FlaskConical,
  Pill,
  Wallet,
  ShieldCheck,
  Crown,
  X,
  Sparkles,
  Home,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

const DEMO_PASSWORD = "Demo@1234";

const ROLES = [
  {
    slug: "superadmin",
    label: "Super Admin",
    desc: "Platform-wide administration",
    icon: Crown,
    email: "super_admin@medcore.demo",
    route: "/super-admin",
    roles: null,
  },
  {
    slug: "admin",
    label: "Hospital Admin",
    desc: "Full hospital administration",
    icon: ShieldCheck,
    email: "hospital_admin@medcore.demo",
    route: "/portal/admin",
    roles: ["HOSPITAL_ADMIN", "SUPER_ADMIN"],
  },
  {
    slug: "doctor",
    label: "Doctor",
    desc: "Consultations & prescriptions",
    icon: Stethoscope,
    email: "doctor@medcore.demo",
    route: "/portal/doctor",
    roles: ["DOCTOR", "SUPER_ADMIN"],
  },
  {
    slug: "nurse",
    label: "Nurse",
    desc: "Vitals, medications, tasks",
    icon: HeartPulse,
    email: "nurse@medcore.demo",
    route: "/portal/nurse",
    roles: ["NURSE", "SUPER_ADMIN"],
  },
  {
    slug: "reception",
    label: "Receptionist",
    desc: "Front desk & appointments",
    icon: ClipboardList,
    email: "receptionist@medcore.demo",
    route: "/portal/reception",
    roles: ["RECEPTIONIST", "SUPER_ADMIN"],
  },
  {
    slug: "lab",
    label: "Lab Technician",
    desc: "Diagnostic orders & reports",
    icon: FlaskConical,
    email: "lab_technician@medcore.demo",
    route: "/portal/lab",
    roles: ["LAB_TECHNICIAN", "SUPER_ADMIN"],
  },
  {
    slug: "pharmacy",
    label: "Pharmacist",
    desc: "Prescriptions & inventory",
    icon: Pill,
    email: "pharmacist@medcore.demo",
    route: "/portal/pharmacy",
    roles: ["PHARMACIST", "SUPER_ADMIN"],
  },
  {
    slug: "accounts",
    label: "Accountant",
    desc: "Billing & financial reports",
    icon: Wallet,
    email: "accountant@medcore.demo",
    route: "/portal/accounts",
    roles: ["ACCOUNTANT", "SUPER_ADMIN"],
  },
  {
    slug: "patient",
    label: "Patient",
    desc: "Patient portal & records",
    icon: Users,
    email: "patient@medcore.demo",
    route: "/portal/patient",
    roles: ["PATIENT", "SUPER_ADMIN"],
  },
];

export function DemoNavigator() {
  const [open, setOpen] = useState(false);
  const [busySlug, setBusySlug] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  async function handleLogin(role) {
    if (busySlug) return;
    setBusySlug(role.slug);
    setError("");

    try {
      if (isAuthenticated) {
        await logout();
      }

      const user = await login({
        email: role.email,
        password: DEMO_PASSWORD,
      });

      const actualRole = user?.role;

      if (role.roles && !role.roles.includes(actualRole)) {
        throw new Error(
          `Logged in as ${actualRole}, but this demo slot expects ${role.label}.`,
        );
      }

      setOpen(false);
      router.push(role.route);
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to sign in to demo.");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        aria-label="Open demo navigator"
      >
        <Sparkles className="h-4 w-4 text-brand" />
        <span>Demo Mode</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
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
                  Sign in to any role in one click
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

            {error && (
              <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto p-2">
              {ROLES.map((role) => {
                const { label, desc, icon: Icon } = role;
                const isBusy = busySlug === role.slug;

                return (
                  <button
                    key={role.slug}
                    type="button"
                    onClick={() => handleLogin(role)}
                    disabled={Boolean(busySlug)}
                    className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-hover disabled:opacity-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{label}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {isBusy ? "Signing in..." : desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

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
