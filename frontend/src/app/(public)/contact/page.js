"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  subject: z.string().min(3, "Please choose a subject").max(120),
  message: z
    .string()
    .min(10, "Please write a message (min 10 characters)")
    .max(800, "Keep it under 800 characters"),
});

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone",
    value: "+91 90000 00000",
    href: "tel:+919000000000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@medcore.health",
    href: "mailto:hello@medcore.health",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Bengaluru, India",
    href: null,
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sat · 9 AM – 7 PM",
    href: null,
  },
];

const SUBJECTS = [
  "General enquiry",
  "Hospital onboarding",
  "Technical support",
  "Partnership",
  "Careers",
  "Press / media",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // TODO: POST /api/contact
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Contact payload:", data);
    setSubmitted(true);
    reset();
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Contact
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Get in touch with MedCore
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Questions about the platform, partnerships, or onboarding your
              hospital? Send us a message and we'll respond within one business
              day.
            </p>
          </div>
        </div>
      </section>

      {/* Grid: form + info */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* LEFT — form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-tight">
                      Message sent
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      Thanks for reaching out. Our team will get back to you
                      within one business day.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        label="Full name"
                        required
                        error={errors.name?.message}
                      >
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...register("name")}
                            placeholder="Your name"
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Email"
                        required
                        error={errors.email?.message}
                      >
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Phone"
                        required
                        error={errors.phone?.message}
                      >
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...register("phone")}
                            placeholder="+91 90000 00000"
                            className="h-11 pl-10"
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Subject"
                        required
                        error={errors.subject?.message}
                      >
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <select
                            {...register("subject")}
                            className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                          >
                            <option value="">Choose a subject</option>
                            {SUBJECTS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </FormField>
                    </div>

                    <FormField
                      label="Message"
                      required
                      error={errors.message?.message}
                    >
                      <div className="relative">
                        <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                          {...register("message")}
                          rows={6}
                          placeholder="Tell us how we can help..."
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                        />
                      </div>
                    </FormField>

                    <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        We reply within 1 business day.
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? "Sending..." : "Send message"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT — info */}
            <div className="lg:col-span-5">
              <div className="space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => {
                  const content = (
                    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:bg-hover/40">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold">
                          {value}
                        </p>
                      </div>
                    </div>
                  );

                  return href ? (
                    <a key={label} href={href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={label}>{content}</div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  For hospitals
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Want to onboard your hospital onto MedCore? Request a demo
                  from the For Hospitals page.
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <a href="/for-hospitals">Request a demo</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}