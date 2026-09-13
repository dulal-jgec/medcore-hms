import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroTrustBadges } from "./hero-trust-badges";
import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-16">
          {/* LEFT — copy */}
          <div className="lg:col-span-6">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider sm:gap-3 sm:text-xs">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-px w-6 bg-highlight sm:w-8" />
                #1 Hospital Platform
              </span>
              <span className="text-brand">· Multi-Tenant HMS</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block text-brand">Connected</span>
              <span className="block text-foreground">
                Hospital Management
              </span>
              <span className="block text-foreground">For Every Role</span>
            </h1>

            {/* Subhead */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base lg:text-lg">
              MedCore is a multi-tenant HMS &amp; EMR platform for modern
              hospitals — patients, doctors, appointments, labs, pharmacy, and
              billing in one secure system.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                asChild
                className="h-11 w-full justify-center whitespace-nowrap px-6 sm:w-auto"
              >
                <Link href="/for-hospitals">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-center whitespace-nowrap px-6 sm:w-auto"
              >
                <Link href="/how-it-works">
                  <PlayCircle className="mr-2 h-4 w-4 shrink-0" />
                  <span>See How It Works</span>
                </Link>
              </Button>
            </div>

            {/* Divider */}
            <div className="mt-8 border-t border-border sm:mt-10" />

            {/* Trust badges */}
            <div className="mt-5 sm:mt-6">
              <HeroTrustBadges />
            </div>
          </div>

          {/* RIGHT — visual */}
          <div className="lg:col-span-6">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}