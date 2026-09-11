import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroTrustBadges } from "./hero-trust-badges";
import { HeroVisual } from "./hero-visual";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* LEFT — copy */}
          <div className="lg:col-span-6">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-px w-8 bg-highlight" />
                #1 Hospital Platform
              </span>
              <span className="text-brand">· Multi-Tenant HMS</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-brand">Connected</span>
              <span className="block text-foreground">Hospital Management</span>
              <span className="block text-foreground">For Every Role</span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              MedCore is a multi-tenant HMS & EMR platform for modern hospitals
              — patients, doctors, appointments, labs, pharmacy, and billing in
              one secure system.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 px-6 whitespace-nowrap bg-primary hover:bg-primary/90"
              >
                <Link href="/for-hospitals">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-6 whitespace-nowrap"
              >
                <Link href="/how-it-works">
                  <PlayCircle className="mr-2 h-4 w-4 shrink-0" />
                  <span>See How It Works</span>
                </Link>
              </Button>
            </div>

            {/* Divider */}
            <div className="mt-10 border-t border-border" />

            {/* Trust badges */}
            <div className="mt-6">
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
