"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Star,
  Stethoscope,
  GraduationCap,
  Languages,
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  User,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOSPITALS } from "@/lib/hospitals";
import { getDoctorById } from "@/lib/hospital-detail-data";

// ─── Validation schema ───
const bookingSchema = z.object({
  patientName: z
    .string()
    .min(2, "Please enter the patient's full name")
    .max(80, "Name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  date: z.string().min(1, "Choose a date"),
  time: z.string().min(1, "Choose a time slot"),
  reason: z
    .string()
    .min(5, "Please describe the reason for the visit")
    .max(300, "Keep it under 300 characters"),
});

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function DoctorDetailPage() {
  const params = useParams();
  const hospitalId = Number(params.id);
  const doctorId = params.doctor;

  const hospital = HOSPITALS.find((h) => h.id === hospitalId);
  const doctor = getDoctorById(doctorId);

  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      patientName: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      reason: "",
    },
  });

  if (!hospital || !doctor) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Doctor not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/hospitals">Back to hospitals</Link>
        </Button>
      </section>
    );
  }

  // TODO: POST /api/hospitals/:id/appointments
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 800));
    console.log("Booking payload:", data);
    setSubmitted(true);
    reset();
  }

  // Earliest selectable date = today
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* ══════════ BACK LINK ══════════ */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link
            href={`/hospitals/${hospital.id}/doctors`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All doctors
          </Link>
          <span className="opacity-40">/</span>
          <span className="truncate text-foreground">{doctor.name}</span>
        </div>
      </div>

      {/* ══════════ PROFILE ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Photo */}
            <div className="lg:col-span-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                {hospital.name}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {doctor.name}
              </h1>
              <p className="mt-2 text-base font-medium text-brand">
                {doctor.specialty}
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-highlight" />
                  <span className="font-medium text-foreground">4.9</span>
                  (240 reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4" />
                  {doctor.experience} experience
                </span>
              </div>

              <p className="mt-6 text-base leading-7 text-muted-foreground">
                {doctor.bio}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <ProfileRow
                  icon={GraduationCap}
                  label="Education"
                  value={doctor.education}
                />
                <ProfileRow
                  icon={Languages}
                  label="Languages"
                  value={doctor.languages.join(", ")}
                />
                <ProfileRow
                  icon={Calendar}
                  label="Availability"
                  value={doctor.availability}
                />
                <ProfileRow
                  icon={Clock}
                  label="Consultation"
                  value="30 minutes"
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="#book">Book Appointment</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="tel:+919000000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Call to book
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ BOOKING FORM ══════════ */}
      <section id="book" className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Form intro */}
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Book Appointment
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Schedule a visit with {doctor.name.split(" ").slice(-1)[0]}
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Fill in the details below. You'll receive a confirmation
                shortly, and our team will contact you to finalize the
                appointment.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Confirmation within 30 minutes",
                  "Free rescheduling up to 24 hrs prior",
                  "No payment required to book",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-brand">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Privacy first
                  </p>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Your details are encrypted and shared only with the
                  hospital. We never sell patient information.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold tracking-tight">
                      Appointment request received
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      We've sent a confirmation to your phone. Our team will
                      contact you shortly to confirm the exact time with{" "}
                      {doctor.name}.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSubmitted(false)}
                      >
                        Book another
                      </Button>
                      <Button asChild>
                        <Link href={`/hospitals/${hospital.id}`}>
                          Back to hospital
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Section: Patient details */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Patient details
                      </h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Full name"
                          required
                          error={errors.patientName?.message}
                        >
                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...register("patientName")}
                              placeholder="e.g. Rahul Sharma"
                              className="h-11 pl-10"
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Phone number"
                          required
                          error={errors.phone?.message}
                        >
                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...register("phone")}
                              placeholder="+91 90000 00000"
                              className="h-11 pl-10"
                            />
                          </div>
                        </FormField>

                        <FormField
                          label="Email (optional)"
                          error={errors.email?.message}
                          className="sm:col-span-2"
                        >
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...register("email")}
                              placeholder="you@example.com"
                              className="h-11 pl-10"
                            />
                          </div>
                        </FormField>
                      </div>
                    </div>

                    {/* Section: Appointment */}
                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Appointment
                      </h3>
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Preferred date"
                          required
                          error={errors.date?.message}
                        >
                          <Input
                            type="date"
                            min={today}
                            {...register("date")}
                            className="h-11"
                          />
                        </FormField>

                        <FormField
                          label="Preferred time"
                          required
                          error={errors.time?.message}
                        >
                          <select
                            {...register("time")}
                            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                          >
                            <option value="">Choose a slot</option>
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField
                          label="Reason for visit"
                          required
                          error={errors.reason?.message}
                          className="sm:col-span-2"
                        >
                          <div className="relative">
                            <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <textarea
                              {...register("reason")}
                              rows={4}
                              placeholder="Briefly describe your symptoms or reason for the visit..."
                              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                            />
                          </div>
                        </FormField>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        By booking, you agree to our terms & privacy policy.
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? "Booking..." : "Confirm appointment"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-5">{value}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, error, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}