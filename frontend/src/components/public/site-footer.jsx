import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

/* ─── Brand icons (lucide removed them; we inline them) ─── */
function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 0 .77 0 0 0 1.77 0 1.77 0zm0 0" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z" />
    </svg>
  );
}

function YouTubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

const LINK_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Hospitals", href: "/hospitals" },
      { label: "For Hospitals", href: "/for-hospitals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/contact" },
      { label: "Press Kit", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/faq" },
      { label: "Documentation", href: "/faq" },
      { label: "System Status", href: "/faq" },
      { label: "API Reference", href: "/faq" },
    ],
  },
];

const SOCIALS = [
  { Icon: LinkedInIcon, href: "#", label: "LinkedIn" },
  { Icon: TwitterIcon, href: "#", label: "Twitter" },
  { Icon: YouTubeIcon, href: "#", label: "YouTube" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/privacy" },
  { label: "Security", href: "/about" },
  { label: "Cookie Settings", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-primary-darker text-primary-darker-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-foreground">
                M
              </div>
              <span className="text-lg font-bold tracking-tight">
                Med<span className="text-brand">Core</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 opacity-70">
              A multi-tenant hospital management platform connecting patients,
              doctors, and hospitals — with privacy, isolation, and audit built
              into every layer.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <a
                href="tel:+919000000000"
                className="flex items-center gap-2.5 opacity-70 transition-opacity hover:opacity-100"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>+91 90000 00000</span>
              </a>
              <a
                href="mailto:hello@medcore.health"
                className="flex items-center gap-2.5 opacity-70 transition-opacity hover:opacity-100"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>hello@medcore.health</span>
              </a>
              <div className="flex items-center gap-2.5 opacity-70">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Bengaluru, India</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md opacity-60 transition-all hover:bg-primary-darker-foreground/10 hover:opacity-100"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:pl-8">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
  href={link.href}
  className="text-sm opacity-70 transition-all hover:opacity-100"
>
  {link.label}
</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-primary-darker-foreground/10 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                <span className="opacity-70">All systems operational</span>
              </span>
              <span className="opacity-40">·</span>
              <span className="opacity-60">
                © {new Date().getFullYear()} MedCore
              </span>
            </div>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              {LEGAL.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="opacity-60 transition-opacity hover:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none select-none">
        <p className="translate-y-[18%] text-center font-black leading-none tracking-tighter text-[clamp(3rem,10vw,7rem)] text-primary-darker-foreground opacity-[0.05]">
          MEDCORE
        </p>
      </div>
    </footer>
  );
}
