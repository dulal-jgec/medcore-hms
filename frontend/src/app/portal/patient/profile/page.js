"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Heart,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { getMyProfile } from "@/services/patient.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ─── Validation schemas ─── */
const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(4, "Enter a valid pincode"),
  occupation: z.string().min(2, "Occupation is required"),
});

const emergencySchema = z.object({
  emergencyName: z.string().min(2, "Contact name is required"),
  emergencyRelation: z.string().min(2, "Relation is required"),
  emergencyPhone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Only digits and + - ( ) allowed"),
});

export default function PatientProfilePage() {
  const [editing, setEditing] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [saved, setSaved] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      occupation: "",
    },
  });

  const {
    register: registerEmergency,
    handleSubmit: handleEmergencySubmit,
    reset: resetEmergency,
    formState: {
      errors: emergencyErrors,
      isSubmitting: isSubmittingEmergency,
    },
  } = useForm({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
    },
  });

  /* ─── Load profile ─── */
  useEffect(() => {
  if (!initialized) return;

  if (!isAuthenticated || !accessToken) {
    setProfileError("You are not authenticated.");
    setLoadingProfile(false);
    return;
  }

  async function loadPatientProfile() {
    try {
      setLoadingProfile(true);
      setProfileError("");

      const result = await getMyProfile(accessToken);

      setPatientProfile(result.data);
    } catch (error) {
      setProfileError(
        error.message || "Failed to load patient profile"
      );
    } finally {
      setLoadingProfile(false);
    }
  }

  loadPatientProfile();
}, [initialized, isAuthenticated, accessToken]);

  /* ─── Reset forms when profile loads ─── */
  useEffect(() => {
    if (!patientProfile) return;

    reset({
      fullName: patientProfile.patientName || "",
      email: patientProfile.email || "",
      phone: patientProfile.phone || "",
      address: patientProfile.address || "",
      city: patientProfile.city || "",
      state: patientProfile.state || "",
      pincode: patientProfile.pincode || "",
      occupation: patientProfile.occupation || "",
    });

    resetEmergency({
      emergencyName: patientProfile.emergencyContactName || "",
      emergencyRelation: patientProfile.emergencyContactRelation || "",
      emergencyPhone: patientProfile.emergencyContactPhone || "",
    });
  }, [patientProfile, reset, resetEmergency]);

  // TODO: PUT /api/v1/patients/me
  async function onSubmit(data) {
    await new Promise((r) => setTimeout(r, 700));
    console.log("Profile update:", data);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function onEmergencySubmit(data) {
    await new Promise((r) => setTimeout(r, 700));
    console.log("Emergency update:", data);
    setEditingEmergency(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function cancelEdit() {
    if (patientProfile) {
      reset({
        fullName: patientProfile.patientName || "",
        email: patientProfile.email || "",
        phone: patientProfile.phone || "",
        address: patientProfile.address || "",
        city: patientProfile.city || "",
        state: patientProfile.state || "",
        pincode: patientProfile.pincode || "",
        occupation: patientProfile.occupation || "",
      });
    }
    setEditing(false);
  }

  function cancelEmergencyEdit() {
    if (patientProfile) {
      resetEmergency({
        emergencyName: patientProfile.emergencyContactName || "",
        emergencyRelation: patientProfile.emergencyContactRelation || "",
        emergencyPhone: patientProfile.emergencyContactPhone || "",
      });
    }
    setEditingEmergency(false);
  }

  /* ─── Loading state ─── */
  if (loadingProfile) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (profileError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-4 text-sm font-medium text-destructive">
            {profileError}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please try again or contact support.
          </p>
        </div>
      </div>
    );
  }

  /* ─── Empty state ─── */
  if (!patientProfile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border py-16 text-center">
          <User className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">No profile found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your patient profile is not set up yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Profile
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and emergency contact.
          </p>
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Changes saved successfully
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* ══════ LEFT — Identity card ══════ */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                  {(patientProfile.patientName ||
                    user?.fullName ||
                    "P").charAt(0)}
                </div>
                <button
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105"
                  aria-label="Change photo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {patientProfile.patientName ||
                  user?.fullName ||
                  "Patient"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                MC-{String(patientProfile.id || 0).padStart(5, "0")}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {patientProfile.status === "ACTIVE"
                  ? "Verified Patient"
                  : patientProfile.status || "Patient"}
              </span>
            </div>

            {/* Quick facts */}
            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Droplets}
                label="Blood group"
                value={patientProfile.bloodGroup || "—"}
                accent
              />
              <Row
                icon={Calendar}
                label="Date of birth"
                value={patientProfile.dateOfBirth || "—"}
              />
              <Row
                icon={User}
                label="Gender"
                value={patientProfile.gender || "—"}
              />
              <Row
                icon={Heart}
                label="Marital status"
                value={patientProfile.maritalStatus || "—"}
              />
              <Row
                icon={MapPin}
                label="Hospital"
                value={patientProfile.hospitalName || "—"}
              />
            </dl>

            {/* Allergies */}
            {patientProfile.allergies?.length > 0 && (
              <div className="mt-6 border-t border-border pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Allergies
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {patientProfile.allergies.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic conditions */}
            {patientProfile.chronicConditions?.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Chronic conditions
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {patientProfile.chronicConditions.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-highlight-soft px-2.5 py-1 text-[11px] font-medium text-highlight-soft-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ══════ RIGHT — Forms ══════ */}
        <div className="space-y-6 lg:col-span-8">
          {/* Personal information */}
          <SectionCard
            title="Personal information"
            desc="Your basic details as registered with the hospital."
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
                    label="Occupation"
                    error={errors.occupation?.message}
                    required
                  >
                    <Input {...register("occupation")} className="h-11" />
                  </Field>

                  <Field
                    label="Email"
                    error={errors.email?.message}
                    required
                  >
                    <Input
                      {...register("email")}
                      type="email"
                      className="h-11"
                    />
                  </Field>

                  <Field
                    label="Phone"
                    error={errors.phone?.message}
                    required
                  >
                    <Input {...register("phone")} className="h-11" />
                  </Field>

                  <Field
                    label="Address"
                    error={errors.address?.message}
                    required
                    className="sm:col-span-2"
                  >
                    <Input {...register("address")} className="h-11" />
                  </Field>

                  <Field
                    label="City"
                    error={errors.city?.message}
                    required
                  >
                    <Input {...register("city")} className="h-11" />
                  </Field>

                  <Field
                    label="State"
                    error={errors.state?.message}
                    required
                  >
                    <Input {...register("state")} className="h-11" />
                  </Field>

                  <Field
                    label="Pincode"
                    error={errors.pincode?.message}
                    required
                  >
                    <Input {...register("pincode")} className="h-11" />
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
                  value={patientProfile.patientName || "—"}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Occupation"
                  value={patientProfile.occupation || "—"}
                />
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={patientProfile.email || "—"}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={patientProfile.phone || "—"}
                />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={
                    [
                      patientProfile.address,
                      patientProfile.city,
                      patientProfile.state,
                      patientProfile.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                  className="sm:col-span-2"
                />
                <InfoRow
                  icon={Calendar}
                  label="Registered on"
                  value={patientProfile.registeredOn || "—"}
                />
              </dl>
            )}
          </SectionCard>

          {/* Emergency contact */}
          <SectionCard
            title="Emergency contact"
            desc="Who we should contact in case of an emergency."
            action={
              !editingEmergency && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingEmergency(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              )
            }
          >
            {editingEmergency ? (
              <form
                onSubmit={handleEmergencySubmit(onEmergencySubmit)}
                className="mt-5 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field
                    label="Contact name"
                    error={emergencyErrors.emergencyName?.message}
                    required
                  >
                    <Input
                      {...registerEmergency("emergencyName")}
                      className="h-11"
                    />
                  </Field>
                  <Field
                    label="Relationship"
                    error={emergencyErrors.emergencyRelation?.message}
                    required
                  >
                    <Input
                      {...registerEmergency("emergencyRelation")}
                      className="h-11"
                    />
                  </Field>
                  <Field
                    label="Phone"
                    error={emergencyErrors.emergencyPhone?.message}
                    required
                  >
                    <Input
                      {...registerEmergency("emergencyPhone")}
                      className="h-11"
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEmergencyEdit}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingEmergency}
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    {isSubmittingEmergency ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5 flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {patientProfile.emergencyContactName || "Not provided"}
                  </p>
                  {patientProfile.emergencyContactRelation && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {patientProfile.emergencyContactRelation}
                    </p>
                  )}
                  {patientProfile.emergencyContactPhone && (
                    <p className="mt-2 text-sm">
                      {patientProfile.emergencyContactPhone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Medical information (read-only) */}
          <SectionCard
            title="Medical information"
            desc="Managed by your hospital. Contact them for changes."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-brand">
                  <Droplets className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider">
                    Blood group
                  </p>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {patientProfile.bloodGroup || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-brand">
                  <Calendar className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-wider">
                    Date of birth
                  </p>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {patientProfile.dateOfBirth || "—"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Medical information like blood group, chronic conditions, and
                allergies is maintained by hospital staff. If any information
                is incorrect, please contact your hospital.
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

function Row({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd
        className={cn(
          "truncate text-right font-medium",
          accent && "text-destructive"
        )}
      >
        {value}
      </dd>
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