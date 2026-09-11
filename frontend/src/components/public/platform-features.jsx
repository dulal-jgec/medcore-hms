import {
  Users,
  CalendarCheck,
  FlaskConical,
  Pill,
  ReceiptIndianRupee,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Patient Management",
    description:
      "Complete patient records, medical history, and registration — accessible to the right roles.",
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

export function PlatformFeatures() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="h-px w-6 bg-brand" />
            Platform
            <span className="h-px w-6 bg-brand" />
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a hospital needs
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            One platform, every department. Built for the way hospitals
            actually work — not bolted on after the fact.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-card p-7 transition-colors hover:bg-hover/50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">
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
  );
}