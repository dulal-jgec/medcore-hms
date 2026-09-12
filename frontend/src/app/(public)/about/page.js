import Link from "next/link";
import Image from "next/image";
import {
  Target,
  Heart,
  Users,
  ShieldCheck,
  Building2,
  Rocket,
  Globe,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — MedCore",
  description:
    "MedCore is a multi-tenant hospital management platform connecting patients, doctors, and hospitals.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Patient first",
    description:
      "Every decision we make starts with a simple question: does this help the patient?",
  },
  {
    icon: ShieldCheck,
    title: "Privacy is not optional",
    description:
      "We build with multi-tenant isolation, encryption, and audit trails from day one.",
  },
  {
    icon: Users,
    title: "Built with hospitals",
    description:
      "Our product is shaped by real feedback from doctors, nurses, and administrators.",
  },
  {
    icon: Rocket,
    title: "Ship what matters",
    description:
      "We avoid feature bloat. Every capability must solve a real clinical or operational problem.",
  },
];

const MILESTONES = [
  {
    year: "2023",
    title: "MedCore founded",
    desc: "Started as a small team with a clear vision.",
  },
  {
    year: "2024",
    title: "First hospitals onboarded",
    desc: "Live across multi-specialty hospitals in India.",
  },
  {
    year: "2025",
    title: "Full HMS platform",
    desc: "Patients, doctors, labs, pharmacy, billing — one system.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                About MedCore
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Software that makes hospitals{" "}
                <span className="text-brand">work better</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
                MedCore is a modern, multi-tenant hospital management platform.
                We connect patients, doctors, nurses, and administrators
                through one secure system — replacing fragmented tools with
                something hospitals actually enjoy using.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/for-hospitals">Partner with us</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Get in touch</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src="/images/about-team.jpg"
                  alt="MedCore team"
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

      {/* Mission */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              Our mission
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              To give every hospital — from small clinics to large
              multi-specialty centres — access to modern, secure, and
              affordable healthcare software. Care should be limited by
              resources, not by outdated tools.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Values
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              What we believe
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
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

      {/* Milestones */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Journey
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Where we've been
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {MILESTONES.map(({ year, title, desc }) => (
              <div
                key={year}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-brand">
                  {year}
                </p>
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

      {/* Platform + stats */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Platform
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                One platform, every hospital role
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                MedCore isn't a single-purpose tool. It's a complete hospital
                operating system — combining electronic medical records,
                appointments, laboratory, pharmacy, billing, and
                administration into one product.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Multi-tenant architecture",
                  "Role-based access control",
                  "Real-time data and notifications",
                  "Full audit trail and compliance-ready",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <Building2 className="h-6 w-6 text-brand" />
                <p className="mt-4 text-3xl font-bold tracking-tight">500+</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hospitals ready
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <Users className="h-6 w-6 text-brand" />
                <p className="mt-4 text-3xl font-bold tracking-tight">1M+</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Patients served
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <Globe className="h-6 w-6 text-brand" />
                <p className="mt-4 text-3xl font-bold tracking-tight">30+</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cities live
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <ShieldCheck className="h-6 w-6 text-brand" />
                <p className="mt-4 text-3xl font-bold tracking-tight">
                  99.98%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-primary p-8 sm:p-12 lg:p-16">
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  Let's build better healthcare together
                </h2>
                <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
                  Whether you're running a small clinic or a large hospital
                  network, we'd love to hear from you.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/contact">Contact us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/features">See features</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}