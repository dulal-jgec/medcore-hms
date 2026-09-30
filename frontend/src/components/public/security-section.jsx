import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  ScrollText,
  Building2,
  ServerCog,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: Building2,
    title: "Multi-tenant by design",
    description:
      "Every hospital operates in its own isolated environment. No data leaks between tenants.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    description:
      "Doctors, nurses, receptionists, and admins see only what their role permits — enforced at the API.",
  },
  {
    icon: Lock,
    title: "Encrypted in transit & at rest",
    description:
      "TLS everywhere, AES-256 at rest, and short-lived tokens for every session.",
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    description: "Every action is logged — who did what, when, and from where.",
  },
];

const COMPLIANCE = [
  "ABDM-ready",
  "HIPAA-aligned",
  "DPDP Act 2023",
  "SOC 2 practices",
];

export function SecuritySection() {
  return (
    <section className="relative overflow-hidden bg-primary-darker text-primary-darker-foreground">
      <Image
        src="/images/security-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-darker/95 to-primary-darker/85"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-32">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
              <span className="h-px w-5 bg-brand sm:w-6" />
              Security & Compliance
            </p>

            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
              Built for hospitals where{" "}
              <span className="text-brand">privacy isn&apos;t optional.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 opacity-75 sm:mt-6 sm:text-base">
              MedCore is engineered from the ground up to keep patient data
              safe, isolated, and auditable — matching the standards hospitals
              are held to.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2 sm:mt-8">
              {COMPLIANCE.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 rounded-full border border-primary-darker-foreground/15 bg-primary-darker-foreground/5 px-3 py-1.5 text-[11px] font-medium sm:text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-brand sm:h-3.5 sm:w-3.5" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 sm:mt-10">
              <Button
                asChild
                size="lg"
                className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:h-12 sm:w-auto"
              >
                <Link href="/about">Read our security approach</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-primary-darker-foreground/15 bg-primary-darker-foreground/10 sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group bg-primary-darker p-5 transition-colors hover:bg-primary-darker-foreground/5 sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight sm:mt-5 sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 opacity-70 sm:text-sm sm:leading-6">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-12 flex flex-col gap-5 border-t border-primary-darker-foreground/10 pt-6 sm:mt-16 sm:gap-6 sm:pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Security is enforced by the backend.
              </p>
              <p className="text-xs opacity-70">
                The UI respects it. The API guarantees it.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-70">
            <ServerCog className="h-4 w-4 shrink-0" />
            <span>Deployed on isolated infrastructure per tenant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
