"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  IndianRupee,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { createDoctor } from "@/services/doctor.service";
import { getDepartments } from "@/services/department.service";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  departmentId: "",
  specialization: "",
  experienceYears: "",
  consultationFee: "",
  qualification: "",
};

const REDIRECT_DELAY_MS = 1500;

export default function CreateDoctorPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let mounted = true;

    async function load() {
      try {
        setLoadingDepartments(true);
        const result = await getDepartments({
          page: 0,
          size: 50,
          sortBy: "name",
          sortDir: "asc",
        });
        if (!mounted) return;
        setDepartments(result.data?.items || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load departments");
      } finally {
        if (mounted) setLoadingDepartments(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    if (!accessToken) {
      setError("Authentication required");
      return;
    }

    if (!form.departmentId) {
      setError("Please select a department");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createDoctor({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        departmentId: Number(form.departmentId),
        specialization: form.specialization.trim(),
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        qualification: form.qualification.trim(),
      });

      setSuccess(
        "Doctor created successfully. Login credentials have been emailed."
      );

      setTimeout(() => {
        router.replace("/portal/admin/doctors");
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      setError(err.message || "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/admin/doctors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Add doctor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a doctor account and professional profile.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Unable to create doctor
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
          desc="Basic details used to create the doctor's login account."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="fullName"
              label="Full name"
              icon={User}
              required
              className="sm:col-span-2"
            >
              <Input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="e.g. Dr. Rahul Sharma"
                className="h-11 pl-10"
                required
                minLength={3}
                maxLength={100}
                autoComplete="name"
              />
            </Field>

            <Field id="email" label="Email" icon={Mail} required>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="doctor@example.com"
                className="h-11 pl-10"
                required
                autoComplete="email"
              />
            </Field>

            <Field id="phone" label="Phone" icon={Phone} required>
              <Input
                id="phone"
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
                autoComplete="tel"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          icon={Stethoscope}
          title="Professional information"
          desc="Department assignment and credentials."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="departmentId"
              label="Department"
              icon={Building2}
              required
            >
              <select
                id="departmentId"
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                disabled={loadingDepartments}
                required
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {loadingDepartments
                    ? "Loading departments..."
                    : "Select department"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="specialization"
              label="Specialization"
              icon={Stethoscope}
              required
            >
              <Input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. Cardiologist"
                className="h-11 pl-10"
                required
                maxLength={100}
              />
            </Field>

            <Field
              id="experienceYears"
              label="Experience (years)"
              icon={Award}
              required
            >
              <Input
                id="experienceYears"
                type="number"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="h-11 pl-10"
                required
                min={0}
                max={60}
              />
            </Field>

            <Field
              id="consultationFee"
              label="Consultation fee"
              icon={IndianRupee}
              required
            >
              <Input
                id="consultationFee"
                type="number"
                name="consultationFee"
                value={form.consultationFee}
                onChange={handleChange}
                placeholder="e.g. 800"
                className="h-11 pl-10"
                required
                min={0}
                step="0.01"
              />
            </Field>

            <Field
              id="qualification"
              label="Qualification"
              icon={GraduationCap}
              required
              className="sm:col-span-2"
            >
              <Input
                id="qualification"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD (Cardiology)"
                className="h-11 pl-10"
                required
                maxLength={150}
              />
            </Field>
          </div>
        </SectionCard>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            A temporary password will be generated automatically. Login
            credentials will be sent to the doctor&apos;s email address. The
            doctor will belong to your current hospital.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/admin/doctors">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting || loadingDepartments}
          >
            <Stethoscope className="mr-1.5 h-4 w-4" />
            {submitting ? "Creating..." : "Create doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

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

function Field({ id, label, icon: Icon, required, className, children }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-2 text-sm font-medium"
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}