"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Droplets,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { registerPatientByReceptionist } from "@/services/receptionist.service";

const BLOOD_GROUPS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
];

const GENDERS = ["Male", "Female", "Other"];

export default function RegisterPatientPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      }
    >
      <RegisterPatientContent />
    </Suspense>
  );
}

function RegisterPatientContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdPatient, setCreatedPatient] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.phone.trim()) return setError("Phone is required.");

    try {
      setSubmitting(true);

      const result = await registerPatientByReceptionist({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase() || null,
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        bloodGroup: form.bloodGroup || null,
        emergencyContactName: form.emergencyContactName.trim() || null,
        emergencyContactPhone: form.emergencyContactPhone.trim() || null,
        emergencyContactRelation: form.emergencyContactRelation.trim() || null,
      });

      setCreatedPatient(result.data);
    } catch (err) {
      setError(err.message || "Unable to register patient.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  if (createdPatient) {
    const bookHref = returnTo
      ? `${returnTo}?patientId=${createdPatient.id}`
      : `/portal/reception/appointments/new?patientId=${createdPatient.id}`;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Patient registered
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            <b>{createdPatient.fullName}</b> is now in MedCore. You can book an
            appointment for them right away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => setCreatedPatient(null)}>
              Register another
            </Button>
            <Button asChild>
              <Link href={bookHref}>Book appointment</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/reception/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to patients
      </Link>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Registration
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Register new patient
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a patient record for a walk-in.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <SectionCard title="Personal information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required className="sm:col-span-2">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Patient's full name"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </Field>

            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="patient@example.com"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Phone" required>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 90000 00000"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </Field>

            <Field label="Date of birth">
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  max={today}
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Blood group">
              <div className="relative">
                <Droplets className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={form.bloodGroup}
                  onChange={(e) => update("bloodGroup", e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg.value} value={bg.value}>
                      {bg.label}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Emergency contact">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Contact name">
              <Input
                value={form.emergencyContactName}
                onChange={(e) => update("emergencyContactName", e.target.value)}
                placeholder="Full name"
                className="h-11"
              />
            </Field>
            <Field label="Relationship">
              <Input
                value={form.emergencyContactRelation}
                onChange={(e) =>
                  update("emergencyContactRelation", e.target.value)
                }
                placeholder="e.g. Spouse"
                className="h-11"
              />
            </Field>
            <Field label="Phone">
              <Input
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  update("emergencyContactPhone", e.target.value)
                }
                placeholder="+91 90000 00000"
                className="h-11"
              />
            </Field>
          </div>
        </SectionCard>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/reception/patients">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register patient"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
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