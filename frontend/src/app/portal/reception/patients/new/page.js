"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOSPITALS } from "@/lib/hospitals";

const schema = z.object({
  fullName: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Select gender"),
  bloodGroup: z.string().min(1, "Select blood group"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Enter a valid pincode"),
  emergencyName: z.string().min(2, "Emergency contact name required"),
  emergencyRelation: z.string().min(2, "Relation required"),
  emergencyPhone: z
    .string()
    .min(10, "Enter a valid emergency phone")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  hospitalId: z.string().min(1, "Select hospital"),
});

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];

export default function RegisterPatientPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
      hospitalId: "",
    },
  });

  // TODO: POST /api/v1/patients
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 900));
    console.log("Register patient:", data);
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
            Patient registered
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            The patient profile has been created successfully. You can now
            book an appointment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
            >
              Register another
            </Button>
            <Button asChild>
              <Link href="/portal/reception/appointments/new">
                Book appointment
              </Link>
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
          Create a patient profile to start booking appointments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* Personal info */}
        <SectionCard title="Personal information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              required
              error={errors.fullName?.message}
              className="sm:col-span-2"
            >
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("fullName")}
                  placeholder="Patient's full name"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Email" required error={errors.email?.message}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="patient@example.com"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Phone" required error={errors.phone?.message}>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("phone")}
                  placeholder="+91 90000 00000"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Date of birth" required error={errors.dateOfBirth?.message}>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("dateOfBirth")}
                  type="date"
                  max={today}
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="Gender" required error={errors.gender?.message}>
              <select
                {...register("gender")}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Choose gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Blood group"
              required
              error={errors.bloodGroup?.message}
            >
              <div className="relative">
                <Droplets className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  {...register("bloodGroup")}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Choose blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Hospital" required error={errors.hospitalId?.message} className="sm:col-span-2">
              <select
                {...register("hospitalId")}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Choose hospital</option>
                {HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.city}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full address"
              required
              error={errors.address?.message}
              className="sm:col-span-2"
            >
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("address")}
                  placeholder="House / Street / Area"
                  className="h-11 pl-10"
                />
              </div>
            </Field>

            <Field label="City" required error={errors.city?.message}>
              <Input {...register("city")} placeholder="City" className="h-11" />
            </Field>

            <Field label="State" required error={errors.state?.message}>
              <Input
                {...register("state")}
                placeholder="State"
                className="h-11"
              />
            </Field>

            <Field label="Pincode" required error={errors.pincode?.message}>
              <Input
                {...register("pincode")}
                placeholder="Pincode"
                className="h-11"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Emergency contact */}
        <SectionCard
          title="Emergency contact"
          desc="Person we should contact in case of an emergency."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Contact name"
              required
              error={errors.emergencyName?.message}
            >
              <Input
                {...register("emergencyName")}
                placeholder="Full name"
                className="h-11"
              />
            </Field>

            <Field
              label="Relationship"
              required
              error={errors.emergencyRelation?.message}
            >
              <Input
                {...register("emergencyRelation")}
                placeholder="e.g. Spouse"
                className="h-11"
              />
            </Field>

            <Field
              label="Phone"
              required
              error={errors.emergencyPhone?.message}
            >
              <Input
                {...register("emergencyPhone")}
                placeholder="+91 90000 00000"
                className="h-11"
              />
            </Field>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Emergency contact details help our staff reach family quickly
              if needed. Please verify the phone number with the patient.
            </p>
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/reception/patients">Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register patient"}
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