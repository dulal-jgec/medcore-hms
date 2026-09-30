import Image from "next/image";
import {
  Users,
  CalendarCheck,
  FlaskConical,
  Pill,
  ReceiptIndianRupee,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Complete patient records, medical history, and registration — visible to the right roles.",
  },
  {
    icon: CalendarCheck,
    title: "Appointments",
    description:
      "Book, reschedule, and track appointments across doctors, departments, and time slots.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory",
    description:
      "Order lab tests, manage samples, and publish reports directly to patient records.",
  },
  {
    icon: Pill,
    title: "Pharmacy",
    description:
      "Prescriptions, medicine inventory, and dispense tracking connected to patient visits.",
  },
  {
    icon: ReceiptIndianRupee,
    title: "Billing & Payments",
    description:
      "Generate invoices, record payments, and track outstanding balances with full audit trail.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Operational dashboards for departments, doctors, and administrators — role-aware.",
  },
];

const HIGHLIGHTS = [
  "Real-time across departments",
  "Zero-training interface",
  "Works on any device",
];

export function PlatformFeatures() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-xl sm:aspect-[5/6] lg:aspect-[4/5]">
              <Image
                src="/images/feature-doctor.jpg"
                alt="Doctor reviewing patient records on MedCore"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary-darker/70 via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-[11px] sm:tracking-[0.18em]">
                  Built for clinical teams
                </p>
                <p className="mt-2 text-base font-bold tracking-tight text-white sm:text-lg">
                  Everything on one screen
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
              <span className="h-px w-5 bg-brand sm:w-6" />
              Platform
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Everything a hospital needs.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              One platform, every department. Built for the way hospitals
              actually work — not bolted on after the fact.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6">
              {HIGHLIGHTS.map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium sm:text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-brand sm:h-3.5 sm:w-3.5" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-10 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group bg-card p-5 transition-colors hover:bg-hover/50 sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
