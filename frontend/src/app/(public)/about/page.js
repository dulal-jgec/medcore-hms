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
      "Every decision starts with a simple question: does this help the patient?",
  },
  {
    icon: ShieldCheck,
    title: "Privacy is not optional",
    description:
      "Multi-tenant isolation, encryption, and audit trails — from day one.",
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
      "No feature bloat. Every capability must solve a real clinical or operational problem.",
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

const STATS = [
  { icon: Building2, value: "500+", label: "Hospitals ready" },
  { icon: Users, value: "1M+", label: "Patients served" },
  { icon: Globe, value: "30+", label: "Cities live" },
  { icon: ShieldCheck, value: "99.98%", label: "Uptime" },
];

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative h-[420px] w-full sm:h-[520px] lg:h-[600px]">
          <Image
            src="/images/about-hero.jpg"
            alt="MedCore team"
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
                About MedCore
              </p>

              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Software that makes hospitals{" "}
                <span className="text-brand">work better.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                MedCore is a modern, multi-tenant hospital management platform.
                We connect patients, doctors, nurses, and administrators
                through one secure system — replacing fragmented tools with
                something hospitals actually enjoy using.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/for-hospitals">Partner with us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href="/contact">Get in touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Our mission
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              To give every hospital — from small clinics to large
              multi-specialty centres — access to modern, secure, and
              affordable healthcare software. Care should be limited by
              resources, not by outdated tools.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Values
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
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

      {/* JOURNEY */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-xl">
                <Image
                  src="/images/about-team.jpg"
                  alt="MedCore team working"
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

            <div className="lg:col-span-7">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                <span className="h-px w-6 bg-brand" />
                Journey
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Where we&apos;ve been
              </h2>

              <div className="mt-10 space-y-8">
                {MILESTONES.map(({ year, title, desc }) => (
                  <div
                    key={year}
                    className="relative border-l border-border pl-6"
                  >
                    <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-brand bg-background" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                      {year}
                    </p>
                    <h3 className="mt-2 text-base font-semibold tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM + STATS */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                <span className="h-px w-6 bg-brand" />
                Platform
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                One platform, every hospital role
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                MedCore isn&apos;t a single-purpose tool. It&apos;s a complete
                hospital operating system — combining EMR, appointments,
                laboratory, pharmacy, billing, and administration into one
                product.
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
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <Icon className="h-6 w-6 text-brand" />
                  <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
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
                  Let&apos;s build better healthcare together.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/75">
                  Whether you&apos;re running a small clinic or a large
                  hospital network, we&apos;d love to hear from you.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href="/contact">Contact us</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
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