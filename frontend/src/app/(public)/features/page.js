import Link from "next/link";
import Image from "next/image";
import {
  Users,
  CalendarCheck,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  Wallet,
  BarChart3,
  FileText,
  Bell,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Features — MedCore",
  description:
    "Complete hospital management features: patients, appointments, EMR, laboratory, pharmacy, billing, and reports.",
};

const FEATURE_GROUPS = [
  {
    title: "Clinical",
    headline: "Care that stays connected",
    image: "/images/feature-clinical.jpg",
    items: [
      {
        icon: Users,
        name: "Patient Management",
        desc: "Complete patient records, medical history, demographics, and visit tracking.",
      },
      {
        icon: Stethoscope,
        name: "Doctor Workflows",
        desc: "Consultation notes, diagnosis, prescriptions, and clinical decision support.",
      },
      {
        icon: HeartPulse,
        name: "Nursing & Vitals",
        desc: "Record vitals, manage medication rounds, and coordinate patient care in real time.",
      },
      {
        icon: FileText,
        name: "Electronic Medical Records",
        desc: "Structured EMR capturing diagnoses, procedures, lab results, and prescriptions.",
      },
    ],
  },
  {
    title: "Operations",
    headline: "Daily workflows, simplified",
    image: "/images/feature-operations.jpg",
    items: [
      {
        icon: CalendarCheck,
        name: "Appointments",
        desc: "Book, reschedule, and track appointments across doctors and departments.",
      },
      {
        icon: FlaskConical,
        name: "Laboratory",
        desc: "Order lab tests, manage samples, and publish reports directly into patient records.",
      },
      {
        icon: Pill,
        name: "Pharmacy",
        desc: "Prescriptions, inventory, batch tracking, and dispense history per visit.",
      },
      {
        icon: Building2,
        name: "Departments",
        desc: "Configure departments, assign consultants, and manage inter-department referrals.",
      },
    ],
  },
  {
    title: "Revenue & Administration",
    headline: "Run the business side of care",
    image: "/images/feature-revenue.jpg",
    items: [
      {
        icon: Wallet,
        name: "Billing & Payments",
        desc: "Generate invoices, record payments, and track balances with a full audit trail.",
      },
      {
        icon: BarChart3,
        name: "Reports & Analytics",
        desc: "Operational dashboards for departments, doctors, and administrators.",
      },
      {
        icon: Bell,
        name: "Notifications",
        desc: "Real-time alerts for appointments, lab results, and critical events.",
      },
      {
        icon: ShieldCheck,
        name: "Security & Audit",
        desc: "Multi-tenant isolation, encrypted data, and complete audit logging.",
      },
    ],
  },
];

const ROLES = [
  { role: "Doctors", desc: "Focus on patient care with everything on one screen." },
  { role: "Nurses", desc: "Record vitals, manage medication, coordinate with doctors." },
  { role: "Receptionists", desc: "Register patients, book appointments, handle billing." },
  { role: "Lab Technicians", desc: "Track samples, run tests, publish reports." },
  { role: "Pharmacists", desc: "Fulfill prescriptions, manage inventory." },
  { role: "Administrators", desc: "Oversee staff, departments, revenue, operations." },
];

export default function FeaturesPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[560px]">
          <Image
            src="/images/features-hero.jpg"
            alt="MedCore features"
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
                Features
              </p>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Everything a hospital needs,{" "}
                <span className="text-brand">in one platform.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                MedCore replaces fragmented tools with one integrated system.
                From patient registration to lab reports, pharmacy, and
                billing — every module is built for real hospital workflows.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/for-hospitals">See pricing</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href="/contact">Request a demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GROUPS */}
      {FEATURE_GROUPS.map((group, idx) => (
        <section
          key={group.title}
          className={`border-b border-border ${
            idx % 2 === 1 ? "bg-muted/30" : ""
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div
                className={`lg:col-span-5 ${
                  idx % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-xl">
                  <Image
                    src={group.image}
                    alt={group.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-primary-darker/60 via-transparent to-transparent"
                  />
                </div>
              </div>

              <div
                className={`lg:col-span-7 ${
                  idx % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  <span className="h-px w-6 bg-brand" />
                  {group.title}
                </p>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  {group.headline}
                </h2>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {group.items.map(({ icon: Icon, name, desc }) => (
                    <div
                      key={name}
                      className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-sm font-semibold tracking-tight">
                        {name}
                      </h3>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ROLES STRIP */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Built for every role
              <span className="h-px w-6 bg-brand" />
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              One platform, tailored to each person
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map(({ role, desc }) => (
              <div
                key={role}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-sm font-semibold">{role}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {desc}
                  </p>
                </div>
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
                  See MedCore in action.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Book a 30-minute walkthrough with our team. We&apos;ll tailor
                  the demo to your hospital&apos;s size and specialty.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/contact">Request a demo</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <a href="tel:+919000000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Talk to sales
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}