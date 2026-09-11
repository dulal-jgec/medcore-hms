import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  ScrollText,
  Building2,
  ServerCog,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: Building2,
    title: "Multi-tenant by design",
    description:
      "Every hospital operates in its own isolated environment. No data leaks between tenants — ever.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    description:
      "Doctors, nurses, receptionists, and admins see only what their role permits. Enforced at the API.",
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
    description:
      "Every action is logged — who did what, when, and from where. Nothing is off the record.",
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
    <section className="relative overflow-hidden bg-primary-deep text-primary-deep-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <span className="h-px w-6 bg-brand" />
              Security & Compliance
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
              Built for hospitals where{" "}
              <span className="text-brand">privacy isn't optional</span>.
            </h2>

            <p className="mt-5 text-base leading-7 opacity-80">
              MedCore is engineered from the ground up to keep patient data
              safe, isolated, and auditable — matching the standards hospitals
              are held to.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {COMPLIANCE.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 rounded-full border border-primary-deep-foreground/20 bg-primary-deep-foreground/5 px-3 py-1.5 text-xs font-medium"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/about">
                  Read our security approach
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-primary-deep-foreground/15 bg-primary-deep-foreground/10 sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group bg-primary-deep p-6 transition-colors hover:bg-primary-deep-foreground/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 opacity-75">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-primary-deep-foreground/10 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
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
            <ServerCog className="h-4 w-4" />
            <span>Deployed on isolated infrastructure per tenant</span>
          </div>
        </div>
      </div>
    </section>
  );
}