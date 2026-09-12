import Link from "next/link";
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
    items: [
      {
        icon: Users,
        name: "Patient Management",
        desc: "Complete patient records, medical history, demographics, and visit tracking in one place.",
      },
      {
        icon: Stethoscope,
        name: "Doctor Workflows",
        desc: "Consultation notes, diagnosis, prescriptions, and clinical decision support for every visit.",
      },
      {
        icon: HeartPulse,
        name: "Nursing & Vitals",
        desc: "Record vitals, manage medication rounds, and coordinate patient care with doctors in real time.",
      },
      {
        icon: FileText,
        name: "Electronic Medical Records",
        desc: "Structured EMR capturing diagnoses, procedures, lab results, and prescriptions over time.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        icon: CalendarCheck,
        name: "Appointments",
        desc: "Book, reschedule, and track appointments across doctors, departments, and time slots.",
      },
      {
        icon: FlaskConical,
        name: "Laboratory",
        desc: "Order lab tests, manage samples, and publish reports directly into patient records.",
      },
      {
        icon: Pill,
        name: "Pharmacy",
        desc: "Prescriptions, medicine inventory, batch tracking, and dispense history connected to patient visits.",
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
    items: [
      {
        icon: Wallet,
        name: "Billing & Payments",
        desc: "Generate invoices, record payments, and track outstanding balances with a full audit trail.",
      },
      {
        icon: BarChart3,
        name: "Reports & Analytics",
        desc: "Operational dashboards for departments, doctors, and administrators — role-aware.",
      },
      {
        icon: Bell,
        name: "Notifications",
        desc: "Real-time alerts for appointment changes, lab results, and critical patient events.",
      },
      {
        icon: ShieldCheck,
        name: "Security & Audit",
        desc: "Multi-tenant isolation, encrypted data, and complete audit logging for compliance.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Features
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Everything a hospital needs, <span className="text-brand">in one platform</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
              MedCore replaces fragmented tools with a single, integrated
              system. From patient registration to lab reports, pharmacy, and
              billing — every module is built for real hospital workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/for-hospitals">See pricing</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Request a demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature groups */}
      {FEATURE_GROUPS.map((group, idx) => (
        <section
          key={group.title}
          className={`border-b border-border ${idx % 2 === 1 ? "bg-muted/30" : ""}`}
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {group.title}
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {group.title === "Clinical" && "Care that stays connected"}
                {group.title === "Operations" && "Daily workflows, simplified"}
                {group.title === "Revenue & Administration" &&
                  "Run the business side of care"}
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {group.items.map(({ icon: Icon, name, desc }) => (
                <div
                  key={name}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-sm"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">
                    {name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Roles strip */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Built for every role
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              One platform, tailored to each person
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { role: "Doctors", desc: "Focus on patient care with everything you need in one screen." },
              { role: "Nurses", desc: "Record vitals, manage medication, coordinate with doctors." },
              { role: "Receptionists", desc: "Register patients, book appointments, handle billing fast." },
              { role: "Lab Technicians", desc: "Track samples, run tests, publish reports." },
              { role: "Pharmacists", desc: "Fulfill prescriptions, manage inventory." },
              { role: "Administrators", desc: "Oversee staff, departments, revenue, and operations." },
            ].map(({ role, desc }) => (
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
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-8 sm:p-12 lg:p-16">
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  See MedCore in action
                </h2>
                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Book a 30-minute walkthrough with our team. We'll tailor the
                  demo to your hospital's size and specialty.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/contact">Request a demo</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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