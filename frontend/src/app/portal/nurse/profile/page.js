"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  Clock,
  TrendingUp,
  FileText,
  HeartPulse,
  Award,
  Activity,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NURSE_PROFILE, getNurseStats } from "@/lib/nurse-mock-data";

const schema = z.object({
  fullName: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
});

export default function NurseProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const stats = getNurseStats();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: NURSE_PROFILE.fullName,
      email: NURSE_PROFILE.email,
      phone: NURSE_PROFILE.phone,
    },
  });

  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 700));
    console.log("Nurse profile update:", data);
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
          Your nursing account and shift activity summary.
        </p>
      </div>

      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left identity */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                  {NURSE_PROFILE.fullName.charAt(0)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105"
                  aria-label="Change photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {NURSE_PROFILE.fullName}
              </h2>
              <p className="mt-1 text-sm font-medium text-brand">
                Staff Nurse · {NURSE_PROFILE.department}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {NURSE_PROFILE.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {NURSE_PROFILE.status} · {NURSE_PROFILE.shift} shift
              </span>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={FileText}
                label="Employee ID"
                value={NURSE_PROFILE.employeeId}
              />
              <Row icon={HeartPulse} label="Ward" value={NURSE_PROFILE.ward} />
              <Row icon={Clock} label="Shift" value={NURSE_PROFILE.shift} />
              <Row
                icon={Calendar}
                label="Joined on"
                value={NURSE_PROFILE.joinedOn}
              />
            </dl>
          </div>

          {/* Activity summary */}
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-brand">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wider">
                Today's activity
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.vitalsPending}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Vitals recorded
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-brand">
                  {stats.tasksPending + stats.medicationsDue}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Tasks + meds
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Right sections */}
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            title="Contact information"
            desc="Your personal details."
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
              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    error={errors.fullName?.message}
                    required
                    className="sm:col-span-2"
                  >
                    <Input {...register("fullName")} className="h-11" />
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
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={User}
                  label="Full name"
                  value={NURSE_PROFILE.fullName}
                />
                <InfoRow icon={Briefcase} label="Role" value="Staff Nurse" />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={NURSE_PROFILE.email}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={NURSE_PROFILE.phone}
                />
              </dl>
            )}
          </SectionCard>

          <SectionCard
            title="Professional information"
            desc="Managed by hospital administration. Contact HR for changes."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FactBox
                icon={FileText}
                label="Employee ID"
                value={NURSE_PROFILE.employeeId}
              />
              <FactBox
                icon={Award}
                label="Registration No"
                value={NURSE_PROFILE.registrationNo}
              />
              <FactBox
                icon={GraduationCap}
                label="Qualification"
                value={NURSE_PROFILE.qualification}
              />
              <FactBox
                icon={HeartPulse}
                label="Department"
                value={NURSE_PROFILE.department}
              />
              <FactBox
                icon={Users}
                label="Assigned Ward"
                value={NURSE_PROFILE.ward}
              />
              <FactBox
                icon={Clock}
                label="Shift Hours"
                value={NURSE_PROFILE.shiftHours}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Employee ID, registration number, ward assignment, and shift
                schedule are set by hospital administration and cannot be
                edited here.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Performance snapshot"
            desc="Your nursing activity on MedCore."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <PerfBox
                icon={Users}
                value={stats.assignedPatients}
                label="Assigned patients"
                trend="Morning shift"
              />
              <PerfBox
                icon={Activity}
                value={stats.vitalsPending}
                label="Vitals today"
                trend="On schedule"
              />
              <PerfBox
                icon={TrendingUp}
                value="98%"
                label="On-time rate"
                trend="Excellent"
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
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
        <p className="text-[10px] font-semibold uppercase tracking-wider">
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