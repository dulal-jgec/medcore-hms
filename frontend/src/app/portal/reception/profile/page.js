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
  Calendar,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  Clock,
  TrendingUp,
  FileText,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { RECEPTIONIST_PROFILE, getReceptionStats } from "@/lib/reception-mock-data";

const schema = z.object({
  fullName: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
});

export default function ReceptionProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const stats = getReceptionStats();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: RECEPTIONIST_PROFILE.fullName,
      email: RECEPTIONIST_PROFILE.email,
      phone: RECEPTIONIST_PROFILE.phone,
    },
  });

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
          Your receptionist account and today's activity summary.
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
                  {RECEPTIONIST_PROFILE.fullName.charAt(0)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105"
                  aria-label="Change photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {RECEPTIONIST_PROFILE.fullName}
              </h2>
              <p className="mt-1 text-sm font-medium text-brand">
                Front Desk Receptionist
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {RECEPTIONIST_PROFILE.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {RECEPTIONIST_PROFILE.status} · {RECEPTIONIST_PROFILE.shift}{" "}
                shift
              </span>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={FileText}
                label="Employee ID"
                value={RECEPTIONIST_PROFILE.employeeId}
              />
              <Row
                icon={ClipboardList}
                label="Desk"
                value={RECEPTIONIST_PROFILE.desk}
              />
              <Row
                icon={Clock}
                label="Shift"
                value={RECEPTIONIST_PROFILE.shift}
              />
              <Row
                icon={Calendar}
                label="Joined on"
                value={RECEPTIONIST_PROFILE.joinedOn}
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
                  {stats.registrations}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Patients registered
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-brand">
                  {stats.totalToday}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Appointments handled
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
                  value={RECEPTIONIST_PROFILE.fullName}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Role"
                  value="Front Desk Receptionist"
                />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={RECEPTIONIST_PROFILE.email}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={RECEPTIONIST_PROFILE.phone}
                />
              </dl>
            )}
          </SectionCard>

          <SectionCard
            title="Employment details"
            desc="Managed by hospital administration. Contact HR for changes."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FactBox
                icon={FileText}
                label="Employee ID"
                value={RECEPTIONIST_PROFILE.employeeId}
              />
              <FactBox
                icon={ClipboardList}
                label="Assigned desk"
                value={RECEPTIONIST_PROFILE.desk}
              />
              <FactBox
                icon={Clock}
                label="Shift"
                value={RECEPTIONIST_PROFILE.shift}
              />
              <FactBox
                icon={Calendar}
                label="Joined on"
                value={RECEPTIONIST_PROFILE.joinedOn}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Employee ID, desk assignment, and shift schedule are set by
                hospital administration and cannot be edited here.
              </p>
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