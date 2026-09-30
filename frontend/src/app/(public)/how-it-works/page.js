import Link from "next/link";
import Image from "next/image";
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
    desc: "Start registering patients, booking appointments, and running your hospital.",
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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[560px]">
          <Image
            src="/images/how-it-works-hero.jpg"
            alt="How MedCore works"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-darker/85 to-primary-darker/50"
          />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur">
                How It Works
              </p>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                From finding a hospital to{" "}
                <span className="text-brand">running one.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                MedCore connects two worlds: patients who need care, and
                hospitals that provide it. Both sides use the same secure
                platform — with complete data isolation between tenants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOR PATIENTS */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              For Patients
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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
            <Button
              asChild
              className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/hospitals">Find your hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FOR HOSPITALS */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              For Hospitals
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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
            <Button
              asChild
              className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/for-hospitals">Onboard your hospital</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Roles
              <span className="h-px w-6 bg-brand" />
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/40"
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
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/images/cta-hospital.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-primary-darker via-primary-darker/85 to-primary-darker/40"
            />

            <div className="relative flex flex-col items-start justify-between gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Find your hospital or onboard your own — in minutes.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/hospitals">Find hospital</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
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