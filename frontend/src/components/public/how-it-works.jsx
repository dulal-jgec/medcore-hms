import Image from "next/image";
import Link from "next/link";
import { Search, LogIn, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Find your hospital",
    description:
      "Browse the MedCore directory and select the hospital you're registered with.",
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
    title: "Use your workspace",
    description:
      "You land on a workspace built for your role — patient, doctor, nurse, receptionist, or admin.",
    detail: "Only what you need",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
            <span className="h-px w-5 bg-brand sm:w-6" />
            How It Works
            <span className="h-px w-5 bg-brand sm:w-6" />
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Get started in three steps.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            From finding your hospital to using your workspace — no setup, no
            downloads.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border shadow-xl sm:aspect-[5/6] lg:aspect-[4/5]">
              <Image
                src="/images/how-it-works.jpg"
                alt="Hospital staff using MedCore"
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
            <div className="relative">
              <div
                aria-hidden
                className="absolute bottom-2 left-6 top-2 w-px bg-border sm:left-7"
              />
              <ul className="space-y-8 sm:space-y-10">
                {STEPS.map(
                  ({ number, icon: Icon, title, description, detail }) => (
                    <li key={number} className="relative flex gap-4 sm:gap-6">
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm sm:h-14 sm:w-14">
                        <Icon className="h-5 w-5 text-brand sm:h-6 sm:w-6" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground sm:h-6 sm:w-6 sm:text-[10px]">
                          {number}
                        </span>
                      </div>
                      <div className="pt-1 sm:pt-1.5">
                        <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                          {title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">
                          {description}
                        </p>
                        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-soft-foreground sm:mt-3 sm:text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                          {detail}
                        </p>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="mt-10 flex flex-col gap-2.5 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 w-full sm:h-12 sm:w-auto"
              >
                <Link href="/hospitals">Find your hospital</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full sm:h-12 sm:w-auto"
              >
                <Link href="/for-hospitals">Register your hospital</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
