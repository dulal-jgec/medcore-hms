"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Stethoscope,
  Calendar,
  Clock,
  MessageSquare,
  Search,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DOCTORS_LIST,
  TIME_SLOTS,
} from "@/lib/reception-mock-data";
import { ALL_PATIENTS } from "@/lib/admin-mock-data";

const schema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string().min(1, "Select a doctor"),
  date: z.string().min(1, "Choose a date"),
  slot: z.string().min(1, "Choose a time slot"),
  type: z.string().min(1, "Select appointment type"),
  reason: z
    .string()
    .min(5, "Please describe the reason")
    .max(300, "Keep it under 300 characters"),
});

export default function NewAppointmentPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      date: "",
      slot: "",
      type: "New",
      reason: "",
    },
  });

  const doctorId = watch("doctorId");
  const selectedDoctor = DOCTORS_LIST.find(
    (d) => String(d.id) === doctorId
  );

  const filteredPatients = ALL_PATIENTS.filter((p) => {
    const q = patientQuery.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  }).slice(0, 6);

  function pickPatient(patient) {
    setSelectedPatient(patient);
    setValue("patientId", String(patient.id));
    setPatientQuery(patient.name);
    setShowPatientDropdown(false);
  }

  // TODO: POST /api/v1/appointments
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Appointment payload:", data);
    setSubmitted(true);
  }

  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Appointment booked
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            The appointment has been scheduled. A confirmation has been sent
            to the patient.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Book another
            </Button>
            <Button asChild>
              <Link href="/portal/reception/appointments">
                Back to appointments
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <Link
        href="/portal/reception/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to appointments
      </Link>

      {/* Header */}
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Booking
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Book appointment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Schedule a visit for an existing patient.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Patient */}
        <SectionCard
          title="Patient"
          desc="Search by name or phone number."
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setShowPatientDropdown(true);
                if (selectedPatient && e.target.value !== selectedPatient.name) {
                  setSelectedPatient(null);
                  setValue("patientId", "");
                }
              }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Search patient by name or phone..."
              className="h-11 pl-10"
            />

            {showPatientDropdown && patientQuery && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowPatientDropdown(false)}
                />
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickPatient(p)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-hover"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                          {p.name.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {p.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.age} yrs · {p.gender} · {p.phone}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No patient found
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedPatient && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-brand/20 bg-brand-soft/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
                {selectedPatient.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {selectedPatient.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {selectedPatient.age} yrs · {selectedPatient.gender} ·{" "}
                  {selectedPatient.bloodGroup} · {selectedPatient.phone}
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
            </div>
          )}

          {errors.patientId && (
            <p className="mt-2 text-xs text-destructive">
              {errors.patientId.message}
            </p>
          )}
        </SectionCard>

        {/* Doctor + Date + Time */}
        <SectionCard
          title="Appointment details"
          desc="Choose doctor, date, and time."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Doctor" required error={errors.doctorId?.message}>
              <div className="relative">
                <Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  {...register("doctorId")}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Choose a doctor</option>
                  {DOCTORS_LIST.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.department}
                    </option>
                  ))}
                </select>
              </div>
              {selectedDoctor && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Department: {selectedDoctor.department}
                </p>
              )}
            </Field>

            <Field label="Appointment type" required error={errors.type?.message}>
              <select
                {...register("type")}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="New">New</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </Field>

            <Field label="Date" required error={errors.date?.message}>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  min={today}
                  {...register("date")}
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Time slot" required error={errors.slot?.message}>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  {...register("slot")}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Choose a time slot</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* Reason */}
        <SectionCard
          title="Reason for visit"
          desc="Brief note about the patient's concern."
        >
          <Field label="Reason" required error={errors.reason?.message}>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                {...register("reason")}
                rows={4}
                placeholder="e.g. Chest pain, fever since 2 days, routine checkup..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </Field>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/reception/appointments">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Confirm booking"}
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

function Field({ label, required, error, children }) {
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