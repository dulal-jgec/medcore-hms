import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-3xl">
          <Image
            src="/images/cta-hospital.jpg"
            alt="Hospital team"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-darker/90 to-primary-darker/50 lg:bg-gradient-to-r lg:from-primary-darker lg:via-primary-darker/85 lg:to-primary-darker/40"
          />

          <div className="relative grid gap-6 p-6 sm:gap-8 sm:p-10 lg:grid-cols-12 lg:p-16">
            <div className="lg:col-span-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
                Ready to get started?
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl">
                Bring your hospital onto a platform built for the modern era.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:mt-5 sm:text-base">
                Get a walkthrough of MedCore with your team. Onboard in days,
                not quarters.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 lg:col-span-5 lg:justify-center lg:items-end">
              <Button
                asChild
                size="lg"
                className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:h-12 lg:w-auto"
              >
                <Link href="/for-hospitals">
                  Register your hospital
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white sm:h-12 lg:w-auto"
              >
                <Link href="/contact">Talk to our team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
