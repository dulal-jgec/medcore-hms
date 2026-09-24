"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HeartPulse,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { createNurse } from "@/services/nurse.service";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  department: "",
  ward: "",
  designation: "",
  qualification: "",
  licenseNumber: "",
};

export default function CreateNursePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!accessToken) {
      setError("Authentication required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createNurse(accessToken, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        ward: form.ward.trim() || null,
        designation: form.designation.trim() || null,
        qualification: form.qualification.trim() || null,
        licenseNumber: form.licenseNumber.trim() || null,
      });

      setSuccess(
        "Nurse created successfully. Login credentials have been emailed."
      );

      setForm(INITIAL_FORM);

      setTimeout(() => {
        router.push("/portal/admin/nurses");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create nurse");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/admin/nurses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to nurses
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Add nurse
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a nurse account for your hospital.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Unable to create nurse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm font-medium text-brand-soft-foreground">
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <SectionCard
          icon={User}
          title="Personal information"
          desc="Basic details used to create the nurse's login account."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              icon={User}
              required
              className="sm:col-span-2"
            >
              <Input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Ananya Sharma"
                className="h-11 pl-10"
                required
                minLength={2}
                maxLength={100}
              />
            </Field>

            <Field label="Email" icon={Mail} required>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nurse@example.com"
                className="h-11 pl-10"
                required
              />
            </Field>

            <Field label="Phone" icon={Phone} required>
              <Input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="h-11 pl-10"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          icon={HeartPulse}
          title="Professional information"
          desc="Department assignment and credentials."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Department" icon={Building2} required>
              <Input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. Emergency"
                className="h-11 pl-10"
                required
                maxLength={100}
              />
            </Field>

            <Field label="Ward" icon={HeartPulse}>
              <Input
                name="ward"
                value={form.ward}
                onChange={handleChange}
                placeholder="e.g. General Ward"
                className="h-11 pl-10"
                maxLength={100}
              />
            </Field>

            <Field label="Designation" icon={Briefcase}>
              <Input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Staff Nurse"
                className="h-11 pl-10"
                maxLength={100}
              />
            </Field>

            <Field label="Qualification" icon={GraduationCap}>
              <Input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. B.Sc Nursing"
                className="h-11 pl-10"
                maxLength={100}
              />
            </Field>

            <Field
              label="License number"
              icon={FileText}
              className="sm:col-span-2"
            >
              <Input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="Nursing registration / license number"
                className="h-11 pl-10"
                maxLength={50}
              />
            </Field>
          </div>
        </SectionCard>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            A temporary password will be generated automatically. Login
            credentials will be sent to the nurse's email address. The nurse
            will belong to your current hospital.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/admin/nurses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting}>
            <HeartPulse className="mr-1.5 h-4 w-4" />
            {submitting ? "Creating..." : "Create nurse"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, required, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}