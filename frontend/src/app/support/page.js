import Link from "next/link";
import {
  BookOpen,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Server,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Support | MedCore",
  description:
    "Get help with MedCore. Contact our team, browse documentation, or check system status.",
};

const CHANNELS = [
  {
    icon: Phone,
    title: "Call us",
    description: "Direct line for urgent issues during business hours.",
    value: "+91 73648 21623",
    href: "tel:+917364821623",
    action: "Call now",
  },
  {
    icon: Mail,
    title: "Email us",
    description: "For non-urgent questions and account issues.",
    value: "skdulalislam1@gmail.com",
    href: "mailto:skdulalislam1@gmail.com",
    action: "Send email",
  },
];

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Getting started",
    description:
      "Learn how to find your hospital, sign in, and navigate your workspace.",
    href: "/how-it-works",
  },
  {
    icon: LifeBuoy,
    title: "Common questions",
    description:
      "Answers to frequently asked questions from patients, doctors, and administrators.",
    href: "/faq",
  },
  {
    icon: Server,
    title: "System status",
    description:
      "Live status of every MedCore service across all regions.",
    href: "/support",
  },
  {
    icon: ShieldCheck,
    title: "Security reports",
    description:
      "Report a vulnerability or learn about our security practices.",
    href: "/security",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Support
              <span className="h-px w-6 bg-brand" />
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              We are here to help.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Reach our team directly, or browse the resources below for
              answers you can use right away.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            {CHANNELS.map(
              ({ icon: Icon, title, description, value, href, action }) => (
                <div
                  key={title}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {description}
                  </p>
                  <p className="mt-4 text-base font-medium">{value}</p>
                  <div className="mt-6">
                    <Button asChild>
                      <a href={href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {action}
                      </a>
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Resources
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Guides and reference material
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Pick the resource that matches what you are trying to do.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {RESOURCES.map(
              ({ icon: Icon, title, description, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md sm:p-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                  Still stuck?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Send us the details of what you are trying to do, the error
                  you see, and the account you are using. We will get back to
                  you within one business day.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href="mailto:skdulalislam1@gmail.com">
                      <Mail className="mr-2 h-4 w-4" />
                      Email support
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <a href="tel:+917364821623">
                      <Phone className="mr-2 h-4 w-4" />
                      Call support
                    </a>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-border bg-background p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Office
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Jalpaiguri, India
                  </p>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Hours
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Mon–Fri, 9:00 AM – 6:00 PM IST
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Emergency support available 24/7 for hospital
                    administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}