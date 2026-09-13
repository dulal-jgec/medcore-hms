"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Wind,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  User,
  BedDouble,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ASSIGNED_PATIENTS } from "@/lib/nurse-mock-data";

const schema = z.object({
  systolic: z.coerce
    .number()
    .min(50, "Too low")
    .max(250, "Too high"),
  diastolic: z.coerce
    .number()
    .min(30, "Too low")
    .max(150, "Too high"),
  pulse: z.coerce.number().min(30, "Too low").max(220, "Too high"),
  temperature: z.coerce
    .number()
    .min(94, "Too low")
    .max(108, "Too high"),
  spo2: z.coerce.number().min(60, "Too low").max(100, "Too high"),
  respiratoryRate: z.coerce
    .number()
    .min(5, "Too low")
    .max(60, "Too high"),
  notes: z.string().max(300, "Keep it under 300 characters").optional(),
});

export default function RecordVitalsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patientId = Number(params.get("patientId"));

  const patient = ASSIGNED_PATIENTS.find((p) => p.id === patientId);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      systolic: "",
      diastolic: "",
      pulse: "",
      temperature: "",
      spo2: "",
      respiratoryRate: "",
      notes: "",
    },
  });

  // TODO: POST /api/v1/patients/:id/vitals
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Vitals recorded:", { patientId, ...data });
    setSubmitted(true);
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-4 text-sm font-medium">Patient not selected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select a patient from the vitals queue.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/portal/nurse/vitals">Back to vitals</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Vitals recorded
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Vitals for {patient.name} have been saved. The primary doctor has
            been notified of any values outside normal range.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Record again
            </Button>
            <Button asChild>
              <Link href={`/portal/nurse/patients/${patient.id}`}>
                Back to patient
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <Link
        href={`/portal/nurse/patients/${patient.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to patient
      </Link>

      {/* Header */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Vitals
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Record patient vitals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the latest readings for the patient.
        </p>
      </div>

      {/* Patient card */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            patient.status === "CRITICAL"
              ? "bg-destructive/10 text-destructive"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {patient.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold tracking-tight">
              {patient.name}
            </p>
            {patient.status === "CRITICAL" && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Critical
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {patient.bed}
            </span>
            <span>
              {patient.age} yrs · {patient.gender}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {/* Blood Pressure */}
        <SectionCard title="Blood Pressure">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Systolic (mmHg)"
              required
              error={errors.systolic?.message}
            >
              <div className="relative">
                <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("systolic")}
                  type="number"
                  placeholder="120"
                  className="h-11 pl-10"
                />
              </div>
            </Field>
            <Field
              label="Diastolic (mmHg)"
              required
              error={errors.diastolic?.message}
            >
              <div className="relative">
                <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("diastolic")}
                  type="number"
                  placeholder="80"
                  className="h-11 pl-10"
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* Other vitals */}
        <SectionCard title="Other measurements">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Pulse (bpm)" required error={errors.pulse?.message}>
              <div className="relative">
                <Activity className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("pulse")}
                  type="number"
                  placeholder="72"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field
              label="Temperature (°F)"
              required
              error={errors.temperature?.message}
            >
              <div className="relative">
                <Thermometer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("temperature")}
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field
              label="SpO₂ (%)"
              required
              error={errors.spo2?.message}
            >
              <div className="relative">
                <Wind className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("spo2")}
                  type="number"
                  placeholder="98"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field
              label="Respiratory rate (breaths/min)"
              required
              error={errors.respiratoryRate?.message}
            >
              <Input
                {...register("respiratoryRate")}
                type="number"
                placeholder="16"
                className="h-11"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard
          title="Nursing notes"
          desc="Optional — any observations or complaints from the patient."
        >
          <Field label="Notes" error={errors.notes?.message}>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                {...register("notes")}
                rows={4}
                placeholder="e.g. Patient reports mild headache. Ate breakfast fully."
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </Field>
        </SectionCard>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p className="text-xs leading-5 text-muted-foreground">
            Any value outside the normal range will be flagged, and the primary
            doctor will be automatically notified.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/nurse/vitals">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save vitals"}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function SectionCard({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {desc && (
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
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