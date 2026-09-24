"use client";

import Link from "next/link";
import {
  Settings,
  Construction,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Bell,
  Lock,
  Palette,
  Plug,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const UPCOMING = [
  {
    icon: Palette,
    label: "Platform branding",
    desc: "Logo, name, and theme defaults for all tenants",
  },
  {
    icon: ShieldCheck,
    label: "Feature flags",
    desc: "Enable or disable modules platform-wide",
  },
  {
    icon: Bell,
    label: "Email & SMS providers",
    desc: "Configure notification delivery services",
  },
  {
    icon: Lock,
    label: "Global security policies",
    desc: "Session, password, and 2FA defaults",
  },
  {
    icon: Building2,
    label: "Tenant provisioning",
    desc: "Default limits and quotas for new hospitals",
  },
  {
    icon: Plug,
    label: "Integrations",
    desc: "API keys and third-party connections",
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          asChild
          aria-label="Back to dashboard"
        >
          <Link href="/super-admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            System
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Platform settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global configuration for the MedCore platform.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="h-1.5 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F59E0B 0, #F59E0B 12px, #18181B 12px, #18181B 24px)",
          }}
        />

        <div className="p-8 text-center sm:p-12">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-highlight/20" />
            <span
              className="absolute inset-2 animate-pulse rounded-full bg-highlight/10"
              style={{ animationDuration: "2s" }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
              <Construction className="h-8 w-8" strokeWidth={2.5} />
            </div>
          </div>

          <h2 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl">
            Under construction
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            This section is being built. It will be enabled once the
            corresponding backend endpoints are available.
          </p>

          <Button asChild variant="outline" className="mt-6">
            <Link href="/super-admin">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold tracking-tight">
          What will be available here
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sections planned for future releases
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-semibold tracking-tight">
                {label}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}