import Link from "next/link";
import { Search, LogIn, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Find your hospital",
    description:
      "Browse MedCore's hospital directory and select the one you're registered with.",
    detail: "Search by name or city",
  },
  {
    number: "02",
    icon: LogIn,
    title: "Sign in securely",
    description:
      "Use the credentials issued by your hospital. Your role and access are set by them.",
    detail: "Multi-tenant, role-aware",
  },
  {
    number: "03",
    icon: LayoutDashboard,
    title: "Use your dashboard",
    description:
      "You land on a workspace built for your role — patient, doctor, nurse, or admin.",
    detail: "Only what you need",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="h-px w-6 bg-brand" />
            How It Works
            <span className="h-px w-6 bg-brand" />
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Get started in three steps
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            From finding your hospital to using your workspace — no setup, no
            downloads, no training needed.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map(({ number, icon: Icon, title, description, detail }) => (
              <div key={number} className="relative">
                {/* Numbered circle */}
                <div className="flex justify-center lg:justify-start">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                    <Icon className="h-6 w-6 text-brand" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-6 text-center lg:text-left">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-soft-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 px-7 whitespace-nowrap bg-primary hover:bg-primary/90"
          >
            <Link href="/hospitals">
              <span>Find your hospital</span>
              <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-7 whitespace-nowrap"
          >
            <Link href="/for-hospitals">Register your hospital</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
