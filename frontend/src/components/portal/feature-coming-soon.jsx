"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function FeatureComingSoon({
  eyebrow = "In the works",
  title = "Almost there",
  description = "This module is being connected right now.",
  developerNote = "The backend for this is partially ready. I'm wiring it up to the interface now — it will be live very soon.",
  backHref = "/portal/patient",
  backLabel = "Back to dashboard",
  icon: Icon = Sparkles,
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
        {/* Icon banner */}
        <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-brand-soft/60 to-brand-soft/20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg">
            <Icon className="h-8 w-8" />
          </span>
        </div>

        <div className="p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {description}
          </p>

          {/* Developer note */}
          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                <Wrench className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  A note from the team
                </p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">
                  {developerNote}
                </p>
              </div>
            </div>
          </div>

          {/* What's ready */}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <ReadyRow label="Backend API" />
            <ReadyRow label="Data models" />
            <ReadyRow label="Business logic" />
            <ReadyRow label="Security & access" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href={backHref}>{backLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadyRow({ label }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand" />
      <span className="font-medium">{label}</span>
      <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
        Ready
      </span>
    </div>
  );
}
