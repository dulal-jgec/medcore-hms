"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  Users,
  Languages,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  Clock,
  IndianRupee,
  TrendingUp,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DOCTOR_PROFILE } from "@/lib/doctor-mock-data";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  bio: z.string().max(500, "Keep it under 500 characters").optional(),
  consultationFee: z.coerce.number().min(0, "Fee cannot be negative"),
});

export default function DoctorProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: DOCTOR_PROFILE.fullName,
      email: DOCTOR_PROFILE.email,
      phone: DOCTOR_PROFILE.phone,
      bio: DOCTOR_PROFILE.bio,
      consultationFee: DOCTOR_PROFILE.consultationFee,
    },
  });

  // TODO: PUT /api/v1/doctors/me
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 700));
    console.log("Profile update:", data);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function cancelEdit() {
    reset();
    setEditing(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Profile
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your professional details visible to patients and hospital staff.
        </p>
      </div>

      {/* Toast */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* ══════ LEFT — Identity ══════ */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                  {DOCTOR_PROFILE.fullName.replace("Dr. ", "").charAt(0)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105"
                  aria-label="Change photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {DOCTOR_PROFILE.fullName}
              </h2>
              <p className="mt-1 text-sm font-medium text-brand">
                {DOCTOR_PROFILE.specialization}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {DOCTOR_PROFILE.department} · {DOCTOR_PROFILE.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                Verified Doctor
              </span>
            </div>

            {/* Rating + patients */}
            <div className="mt-6 grid grid-cols-2 divide-x divide-border rounded-xl border border-border">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-brand">
                  <Star className="h-3.5 w-3.5 fill-brand" />
                  <p className="text-lg font-bold">{DOCTOR_PROFILE.rating}</p>
                </div>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Patient rating
                </p>
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-lg font-bold">
                    {DOCTOR_PROFILE.totalPatients.toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Patients treated
                </p>
              </div>
            </div>

            {/* Quick facts */}
            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Stethoscope}
                label="Department"
                value={DOCTOR_PROFILE.department}
              />
              <Row
                icon={Award}
                label="Experience"
                value={`${DOCTOR_PROFILE.experienceYears} years`}
              />
              <Row
                icon={IndianRupee}
                label="Consultation fee"
                value={`₹${DOCTOR_PROFILE.consultationFee}`}
              />
              <Row
                icon={FileText}
                label="Reg. number"
                value={DOCTOR_PROFILE.registrationNo}
              />
            </dl>
          </div>
        </aside>

        {/* ══════ RIGHT — Sections ══════ */}
        <div className="space-y-6 lg:col-span-8">
          {/* Contact & basic info */}
          <SectionCard
            title="Contact & basic info"
            desc="Your name and contact details."
            action={
              !editing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              )
            }
          >
            {editing ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-5 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    error={errors.fullName?.message}
                    required
                  >
                    <Input {...register("fullName")} className="h-11" />
                  </Field>

                  <Field
                    label="Consultation fee (₹)"
                    error={errors.consultationFee?.message}
                    required
                  >
                    <Input
                      {...register("consultationFee")}
                      type="number"
                      className="h-11"
                    />
                  </Field>

                  <Field label="Email" error={errors.email?.message} required>
                    <Input
                      {...register("email")}
                      type="email"
                      className="h-11"
                    />
                  </Field>

                  <Field label="Phone" error={errors.phone?.message} required>
                    <Input {...register("phone")} className="h-11" />
                  </Field>

                  <Field
                    label="Professional bio"
                    error={errors.bio?.message}
                    className="sm:col-span-2"
                  >
                    <textarea
                      {...register("bio")}
                      rows={4}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-1.5 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <InfoRow
                    icon={User}
                    label="Full name"
                    value={DOCTOR_PROFILE.fullName}
                  />
                  <InfoRow
                    icon={IndianRupee}
                    label="Consultation fee"
                    value={`₹${DOCTOR_PROFILE.consultationFee}`}
                  />
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={DOCTOR_PROFILE.email}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={DOCTOR_PROFILE.phone}
                  />
                  <InfoRow
                    icon={Languages}
                    label="Languages"
                    value={DOCTOR_PROFILE.languages.join(", ")}
                    className="sm:col-span-2"
                  />
                </dl>

                {DOCTOR_PROFILE.bio && (
                  <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Professional bio
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      {DOCTOR_PROFILE.bio}
                    </p>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* Professional information (read-only) */}
          <SectionCard
            title="Professional information"
            desc="Managed by your hospital. Contact them for changes."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FactBox
                icon={Stethoscope}
                label="Specialization"
                value={DOCTOR_PROFILE.specialization}
              />
              <FactBox
                icon={GraduationCap}
                label="Qualification"
                value={DOCTOR_PROFILE.qualification}
              />
              <FactBox
                icon={Briefcase}
                label="Experience"
                value={`${DOCTOR_PROFILE.experienceYears} years`}
              />
              <FactBox
                icon={Award}
                label="Reg. number"
                value={DOCTOR_PROFILE.registrationNo}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Professional credentials like specialization, qualification,
                and registration number are verified by the hospital and
                cannot be edited here.
              </p>
            </div>
          </SectionCard>

          {/* Performance snapshot */}
          <SectionCard
            title="Performance"
            desc="Your clinical activity on MedCore."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <PerfBox
                icon={Users}
                value={DOCTOR_PROFILE.totalPatients.toLocaleString("en-IN")}
                label="Total patients"
                trend="+12 this month"
              />
              <PerfBox
                icon={Star}
                value={DOCTOR_PROFILE.rating}
                label="Avg rating"
                trend="+0.1 this month"
              />
              <PerfBox
                icon={TrendingUp}
                value="94%"
                label="On-time rate"
                trend="Above average"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function SectionCard({ title, desc, action, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="truncate text-right font-medium">{value}</dd>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function FactBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-brand">
        <Icon className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium leading-5">{value}</p>
    </div>
  );
}

function PerfBox({ icon: Icon, value, label, trend }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <Icon className="h-4 w-4 text-brand" />
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
      <p className="mt-1 text-[10px] font-medium text-brand">{trend}</p>
    </div>
  );
}

function Field({ label, required, error, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}