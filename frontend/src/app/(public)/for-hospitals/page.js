import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  Clock,
  Wallet,
  Stethoscope,
  FlaskConical,
  Pill,
  CalendarCheck,
  FileText,
  Phone,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "For Hospitals — MedCore",
  description:
    "Onboard your hospital onto MedCore. Complete HMS covering patients, doctors, labs, pharmacy, and billing.",
};

const MODULES = [
  { icon: Users, label: "Patient Management" },
  { icon: CalendarCheck, label: "Appointments" },
  { icon: Stethoscope, label: "Doctor Workflows" },
  { icon: FlaskConical, label: "Laboratory" },
  { icon: Pill, label: "Pharmacy" },
  { icon: Wallet, label: "Billing & Payments" },
  { icon: BarChart3, label: "Reports & Analytics" },
  { icon: FileText, label: "EMR & Records" },
];

const BENEFITS = [
  {
    icon: Clock,
    title: "Live in days, not months",
    description:
      "Guided onboarding gets your hospital operational fast. Import existing data, set up departments, invite staff.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description:
      "Multi-tenant isolation, encrypted at rest and in transit, full audit logging, and role-based access controls.",
  },
  {
    icon: BarChart3,
    title: "Real-time visibility",
    description:
      "Dashboards for administrators and department heads. Track operations, revenue, and patient flow at a glance.",
  },
  {
    icon: Wallet,
    title: "Transparent pricing",
    description:
      "Simple per-hospital pricing. No hidden fees, no per-user charges that balloon as you grow.",
  },
];

const PRICING = [
  {
    name: "Clinic",
    price: "₹9,999",
    period: "per month",
    desc: "For small clinics and single-doctor practices.",
    features: [
      "Up to 10 staff accounts",
      "Patient & appointment management",
      "Basic billing",
      "Email support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Hospital",
    price: "₹29,999",
    period: "per month",
    desc: "For growing multi-specialty hospitals.",
    features: [
      "Up to 100 staff accounts",
      "All core modules",
      "Laboratory & pharmacy",
      "Custom reports",
      "Priority support",
    ],
    cta: "Request demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    desc: "For hospital chains and large networks.",
    features: [
      "Unlimited staff accounts",
      "Multi-branch management",
      "SSO & advanced security",
      "Dedicated account manager",
      "24/7 support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function ForHospitalsPage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                For Hospitals
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Run your hospital on <span className="text-brand">one platform</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
                Replace disconnected tools, spreadsheets, and paper records with
                a single system your entire team actually uses. MedCore handles
                everything from patient registration to lab reports, pharmacy,
                and billing.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/contact">Request a demo</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="tel:+919000000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Talk to sales
                  </a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand" />
                  No setup fees
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand" />
                  30-day trial
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand" />
                  Free migration
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src="/images/for-hospitals-hero.jpg"
                  alt="Hospital staff using MedCore"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Modules
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Everything your hospital needs
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Each module is designed for real hospital workflows — not adapted
              from generic software.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MODULES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Why MedCore
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Built for hospitals, not just software buyers
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ONBOARDING STEPS */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Onboarding
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Live in three steps
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Sign up",
                desc: "Create your hospital account. No credit card required for the trial.",
              },
              {
                n: "02",
                title: "Configure",
                desc: "Add departments, invite staff, set roles, and import existing patient data.",
              },
              {
                n: "03",
                title: "Go live",
                desc: "Start registering patients, booking appointments, and running your hospital.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-sm font-bold text-brand">{n}</p>
                <h3 className="mt-3 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Pricing
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              No hidden fees. No per-transaction charges. Cancel anytime.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                  plan.highlight
                    ? "border-brand/40 bg-card shadow-lg ring-1 ring-brand/20"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                    Most popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-8 w-full ${plan.highlight ? "" : ""}`}
                  variant={plan.highlight ? "default" : "outline"}
                >
                  <Link href="/contact">{plan.cta}</Link>
                </Button>
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
                  Ready to modernize your hospital?
                </h2>
                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Schedule a demo with our team. We'll walk you through the
                  platform and answer any questions.
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
                    Call sales
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