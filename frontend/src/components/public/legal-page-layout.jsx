import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LEGAL_NAV = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function LegalPageLayout({ title, updated, children }) {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <p className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <span className="h-px w-6 bg-brand" />
            Legal
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          {updated && (
            <p className="mt-3 text-sm text-muted-foreground">
              Last updated {updated}
            </p>
          )}
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-3">
              <div className="sticky top-24 space-y-1">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Legal documents
                </p>
                {LEGAL_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="space-y-8 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                {children}
              </div>

              <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-6">
                <p className="text-sm font-semibold text-foreground">
                  Questions about this document?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Contact our team at{" "}
                  <a
                    href="mailto:skdulalislam1@gmail.com"
                    className="font-medium text-brand hover:underline"
                  >
                    skdulalislam1@gmail.com
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:+917364821623"
                    className="font-medium text-brand hover:underline"
                  >
                    +91 73648 21623
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}