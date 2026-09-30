import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";

export const metadata = {
  title: "Contact | MedCore",
  description:
    "Reach the MedCore team by email, phone, or through our contact form.",
};

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 73648 21623",
    href: "tel:+917364821623",
  },
  {
    icon: Mail,
    label: "Email",
    value: "skdulalislam1@gmail.com",
    href: "mailto:skdulalislam1@gmail.com",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Jalpaiguri, India",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Fri, 9 AM – 6 PM IST",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-6 bg-brand" />
              Contact
              <span className="h-px w-6 bg-brand" />
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Let&apos;s talk.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Send us a message and our team will reply to your email within
              one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <aside className="lg:col-span-4">
              <div className="space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="mt-1 block break-words text-sm font-medium text-foreground hover:text-brand"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="mt-1 break-words text-sm font-medium">
                          {value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <div className="lg:col-span-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}