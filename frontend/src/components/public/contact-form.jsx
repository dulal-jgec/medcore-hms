"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendContactEmail } from "@/lib/emailjs";

const SUBJECTS = [
  "General enquiry",
  "Hospital onboarding",
  "Technical support",
  "Billing question",
  "Report a bug",
  "Other",
];

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  subject: "General enquiry",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(INITIAL);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Please enter your name.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setError("Please enter a valid email address.");
    }
    if (form.message.trim().length < 10) {
      return setError("Please write at least 10 characters.");
    }

    try {
      setSending(true);

      await sendContactEmail({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setError(
        err?.text ||
          err?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight">
          Message sent
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Thanks for reaching out. We have received your message and will reply
          to your email within one business day.
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-5 sm:p-8"
    >
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Aarav Sharma"
              className="h-11 pl-10"
              required
            />
          </div>
        </Field>

        <Field label="Email" required>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="h-11 pl-10"
              required
            />
          </div>
        </Field>

        <Field label="Phone">
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 90000 00000"
              className="h-11 pl-10"
            />
          </div>
        </Field>

        <Field label="Subject" required>
          <select
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            required
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Message" required className="sm:col-span-2">
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={6}
              placeholder="Tell us what you need help with..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pl-10 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              required
            />
          </div>
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Your message goes directly to our team.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={sending}
          className="w-full sm:w-auto"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, className, children }) {
  return (
    <div className={cn(className)}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}