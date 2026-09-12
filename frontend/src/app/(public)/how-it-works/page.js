import Link from "next/link";
import {
  Search,
  LogIn,
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Pill,
  Wallet,
  UserRound,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works — MedCore",
  description:
    "See how MedCore connects patients and hospitals through a simple, secure workflow.",
};

const PATIENT_STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Find your hospital",
    desc: "Browse the MedCore directory and select the hospital you're registered with.",
  },
  {
    n: "02",
    icon: LogIn,
    title: "Sign in securely",
    desc: "Use the credentials issued by your hospital. Your role is set by them.",
  },
  {
    n: "03",
    icon: LayoutDashboard,
    title: "Use your dashboard",
    desc: "Land on a workspace built for your role — book appointments, view reports, track bills.",
  },
];

const HOSPITAL_STEPS = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Onboard your hospital",
    desc: "Create your hospital account. Import existing patient data and configure departments.",
  },
  {
    n: "02",
    icon: UserRound,
    title: "Invite your staff",
    desc: "Add doctors, nurses, receptionists, and admins. Assign roles and permissions.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Go live securely",
    desc: "Start registering patients, booking appointments, and running your hospital — isolated from every other tenant.",
  },
];

const ROLES = [
  { icon: UserRound, name: "Patient", gets: "Bookings, prescriptions, reports, bills" },
  { icon: Stethoscope, name: "Doctor", gets: "Appointments, patients, EMR, prescriptions" },
  { icon: HeartPulse, name: "Nurse", gets: "Vitals, medication, tasks" },
  { icon: ClipboardList, name: "Receptionist", gets: "Registration, appointments, billing" },
  { icon: FileText, name: "Lab Technician", gets: "Orders, samples, reports" },
  { icon: Pill, name: "Pharmacist", gets: "Prescriptions, inventory" },
  { icon: Wallet, name: "Accountant", gets: "Invoices, payments, reports" },
  { icon: ShieldCheck, name: "Admin", gets: "Staff, departments, revenue, settings" },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              How It Works
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              From finding a hospital to{" "}
              <span className="text-brand">running one</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              MedCore connects two worlds: patients who need care, and hospitals
              that provide it. Both sides use the same secure platform — with
              complete data isolation between tenants.
            </p>
          </div>
        </div>
      </section>

      {/* For Patients */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              For Patients
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Three steps to your care
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PATIENT_STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div
                key={n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-brand">{n}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button asChild>
              <Link href="/hospitals">Find your hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Hospitals */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              For Hospitals
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Onboard in days, not months
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOSPITAL_STEPS.map(({ n, icon: Icon, title, desc }) => (
              <div
                key={n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-brand">{n}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button asChild>
              <Link href="/for-hospitals">Onboard your hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Roles
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Everyone sees exactly what they should
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Role-based access control is enforced at the backend, not the UI.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ icon: Icon, name, gets }) => (
              <div
                key={name}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:bg-hover/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold tracking-tight">
                  {name}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {gets}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-8 sm:p-12 lg:p-16">
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Find your hospital or onboard your own — in minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/hospitals">Find hospital</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/for-hospitals">For hospitals</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}