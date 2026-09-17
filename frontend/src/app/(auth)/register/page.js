"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Heart,
  MapPin,
  Briefcase,
  Users,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOSPITALS } from "@/lib/hospitals";
import { register as registerUser } from "@/services/auth.service";

const registerSchema = z
  .object({
    // ── User: basic ──
    fullName: z
      .string()
      .min(2, "Enter your full name")
      .max(80, "Name is too long"),

    email: z.string().email("Enter a valid email"),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number"
      ),

    // ── User: personal ──
    city: z.string().min(2, "City is required"),

    state: z.string().min(2, "State is required"),

    pincode: z
      .string()
      .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

    occupation: z.string().min(2, "Occupation is required"),

    gender: z.string().min(1, "Gender is required"),

    maritalStatus: z.string().min(1, "Marital status is required"),

    // ── User: auth ──
    hospitalId: z.string().min(1, "Select your hospital"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be at most 20 characters"),

    confirmPassword: z.string().min(8, "Please confirm your password"),

    // ── Patient: medical ──
    dateOfBirth: z.string().min(1, "Date of birth is required"),

    bloodGroup: z.string().min(1, "Blood group is required"),

    emergencyContactName: z
      .string()
      .min(2, "Emergency contact name is required"),

    emergencyContactRelation: z
      .string()
      .min(2, "Relationship is required"),

    emergencyContactPhone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number"
      ),

    allergies: z.string().optional(),

    chronicConditions: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      pincode: "",
      occupation: "",
      gender: "",
      maritalStatus: "",
      hospitalId: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      bloodGroup: "",
      emergencyContactName: "",
      emergencyContactRelation: "",
      emergencyContactPhone: "",
      allergies: "",
      chronicConditions: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");
    try {
      await registerUser({
        // User
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        hospitalId: Number(data.hospitalId),

        city: data.city,
        state: data.state,
        pincode: data.pincode,
        occupation: data.occupation,
        gender: data.gender,
        maritalStatus: data.maritalStatus,

        password: data.password,
        confirmPassword: data.confirmPassword,

        // Patient
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,

        emergencyContactName: data.emergencyContactName,
        emergencyContactRelation: data.emergencyContactRelation,
        emergencyContactPhone: data.emergencyContactPhone,

        allergies: data.allergies
          ? data.allergies
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        chronicConditions: data.chronicConditions
          ? data.chronicConditions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Registration successful
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-foreground">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>

        <div className="my-auto w-full max-w-lg py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Patient registration
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Register with your hospital to access appointments, prescriptions,
            lab reports, and billing — all in one place.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {/* ══════════ PERSONAL INFORMATION ══════════ */}
            <SectionTitle>Personal information</SectionTitle>

            {/* Full name */}
            <FormField label="Full name" required error={errors.fullName?.message}>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Rahul Sharma"
                  className="h-11 pl-10"
                />
              </div>
            </FormField>

            {/* Email + Phone */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Email" required error={errors.email?.message}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Phone" required error={errors.phone?.message}>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("phone")}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-11 pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* City + State */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="City" required error={errors.city?.message}>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("city")}
                    placeholder="e.g. Jalpaiguri"
                    className="h-11 pl-10"
                  />
                </div>
              </FormField>

              <FormField label="State" required error={errors.state?.message}>
                <Input
                  {...register("state")}
                  placeholder="e.g. West Bengal"
                  className="h-11"
                />
              </FormField>
            </div>

            {/* Pincode + Occupation */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Pincode" required error={errors.pincode?.message}>
                <Input
                  {...register("pincode")}
                  placeholder="735101"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-11"
                />
              </FormField>

              <FormField
                label="Occupation"
                required
                error={errors.occupation?.message}
              >
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("occupation")}
                    placeholder="e.g. Student"
                    className="h-11 pl-10"
                  />
                </div>
              </FormField>
            </div>

            {/* Gender + Marital status */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Gender" required error={errors.gender?.message}>
                <select
                  {...register("gender")}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </FormField>

              <FormField
                label="Marital status"
                required
                error={errors.maritalStatus?.message}
              >
                <select
                  {...register("maritalStatus")}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select marital status</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </FormField>
            </div>

            {/* ══════════ MEDICAL INFORMATION ══════════ */}
            <SectionTitle>Medical information</SectionTitle>

            {/* DOB + Blood group */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Date of birth"
                required
                error={errors.dateOfBirth?.message}
              >
                <Input
                  {...register("dateOfBirth")}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  className="h-11"
                />
              </FormField>

              <FormField
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
                    <option value="">Select blood group</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>
              </FormField>
            </div>

            {/* Allergies + Chronic conditions */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Allergies" error={errors.allergies?.message}>
                <Input
                  {...register("allergies")}
                  placeholder="e.g. Penicillin, Dust"
                  className="h-11"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Separate multiple with commas
                </p>
              </FormField>

              <FormField
                label="Chronic conditions"
                error={errors.chronicConditions?.message}
              >
                <Input
                  {...register("chronicConditions")}
                  placeholder="e.g. Asthma, Diabetes"
                  className="h-11"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Separate multiple with commas
                </p>
              </FormField>
            </div>

            {/* ══════════ HOSPITAL ══════════ */}
            <SectionTitle>Hospital</SectionTitle>

            <FormField
              label="Your hospital"
              required
              error={errors.hospitalId?.message}
            >
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  {...register("hospitalId")}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Choose your hospital</option>
                  {HOSPITALS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.city}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            {/* ══════════ EMERGENCY CONTACT ══════════ */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-brand" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Emergency contact
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <FormField
                  label="Contact name"
                  required
                  error={errors.emergencyContactName?.message}
                >
                  <Input
                    {...register("emergencyContactName")}
                    placeholder="Full name"
                    className="h-11"
                  />
                </FormField>

                <FormField
                  label="Relationship"
                  required
                  error={errors.emergencyContactRelation?.message}
                >
                  <Input
                    {...register("emergencyContactRelation")}
                    placeholder="e.g. Father"
                    className="h-11"
                  />
                </FormField>

                <FormField
                  label="Contact phone"
                  required
                  error={errors.emergencyContactPhone?.message}
                >
                  <Input
                    {...register("emergencyContactPhone")}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    className="h-11"
                  />
                </FormField>
              </div>
            </div>

            {/* ══════════ SECURITY ══════════ */}
            <SectionTitle>Security</SectionTitle>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Password"
                required
                error={errors.password?.message}
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
                    aria-label={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>

              <FormField
                label="Confirm password"
                required
                error={errors.confirmPassword?.message}
              >
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-xs leading-5 text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link href="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT — image panel */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/hero-doctor.jpg"
          alt="Healthcare professional"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Patient portal access
          </div>

          <div>
            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Your health records,{" "}
              <span className="text-brand">always accessible.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
              Book appointments, view prescriptions, download lab reports, and
              pay bills — from anywhere, at any time.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Access from any device",
                "Secure & encrypted",
                "Only your hospital sees your data",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/85"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">
            Your data stays private to your hospital.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function SectionTitle({ children }) {
  return (
    <div className="border-b border-border pb-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-brand">
        {children}
      </h2>
    </div>
  );
}

function FormField({ label, required, error, children }) {
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