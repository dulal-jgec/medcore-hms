"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register as registerUser } from "@/services/auth.service";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name").max(80),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    password: z.string().min(8, "At least 8 characters").max(20),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    occupation: z.string().min(2, "Occupation is required"),
    gender: z.string().min(1, "Gender is required"),
    maritalStatus: z.string().min(1, "Marital status is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    bloodGroup: z.string().min(1, "Blood group is required"),
    emergencyContactName: z.string().min(2, "Emergency contact name required"),
    emergencyContactRelation: z.string().min(2, "Relationship required"),
    emergencyContactPhone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

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

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const MARITAL_STATUSES = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

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
      password: "",
      confirmPassword: "",
      city: "",
      state: "",
      pincode: "",
      occupation: "",
      gender: "",
      maritalStatus: "",
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
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        occupation: data.occupation.trim(),
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        emergencyContactName: data.emergencyContactName.trim(),
        emergencyContactRelation: data.emergencyContactRelation.trim(),
        emergencyContactPhone: data.emergencyContactPhone.trim(),
        allergies: data.allergies
          ? data.allergies.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
        chronicConditions: data.chronicConditions
          ? data.chronicConditions.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
      });

      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setServerError(err.message || "Registration failed. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Welcome to MedCore
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account was created successfully. Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — form */}
      <div className="flex flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground shadow-sm">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>

        <div className="my-auto w-full max-w-lg py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Welcome to MedCore
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Create your patient account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Register once to access appointments, prescriptions, lab reports,
            and billing across every hospital on MedCore.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <SectionTitle>Personal information</SectionTitle>

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

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Email" required error={errors.email?.message}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
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

              <FormField label="Occupation" required error={errors.occupation?.message}>
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

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Gender" required error={errors.gender?.message}>
                <select
                  {...register("gender")}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
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
                  {MARITAL_STATUSES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <SectionTitle>Medical information</SectionTitle>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Date of birth" required error={errors.dateOfBirth?.message}>
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
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg.value} value={bg.value}>
                        {bg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </FormField>
            </div>

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

            <SectionTitle>Security</SectionTitle>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Password" required error={errors.password?.message}>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-hover hover:text-hover-foreground"
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
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-hover hover:text-hover-foreground"
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
              <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90"
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

      {/* RIGHT — visual */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/auth-register.jpg"
          alt="Patient registering on MedCore"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-darker/85 to-primary-darker/40"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <ShieldCheck className="h-4 w-4" />
            Patient portal access
          </div>

          <div>
            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              One account,{" "}
              <span className="text-brand">every hospital you visit.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
              Book appointments, view prescriptions, download lab reports, and
              pay bills from anywhere.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Access from any device",
                "Secure and encrypted",
                "Your data is scoped to your hospital",
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
            Your data stays private to each hospital.
          </p>
        </div>
      </div>
    </div>
  );
}

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