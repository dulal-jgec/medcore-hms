"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Droplets,
  Heart,
  HeartPulse,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, toStringArray, toCsv } from "@/lib/utils";

import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from "@/services/patient.service";

/* ══════════ Constants ══════════ */

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

/* ══════════ Validation ══════════ */

const schema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  emergencyContactName: z
    .string()
    .min(1, "Emergency contact name is required")
    .max(100, "Too long"),
  emergencyContactRelation: z
    .string()
    .min(1, "Relation is required")
    .max(100, "Too long"),
  emergencyContactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  allergies: z.string().max(1000, "Too long").optional(),
  chronicConditions: z.string().max(1000, "Too long").optional(),
});

/* ══════════ Helpers ══════════ */

function formatBloodGroup(bg) {
  if (!bg) return "—";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ══════════ Page ══════════ */

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      dateOfBirth: "",
      bloodGroup: "",
      emergencyContactName: "",
      emergencyContactRelation: "",
      emergencyContactPhone: "",
      allergies: "",
      chronicConditions: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      const res = await getMyPatientProfile();
      const data = res.data;
      setProfile(data);

      reset({
        dateOfBirth: data.dateOfBirth || "",
        bloodGroup: data.bloodGroup || "",
        emergencyContactName: data.emergencyContactName || "",
        emergencyContactRelation: data.emergencyContactRelation || "",
        emergencyContactPhone: data.emergencyContactPhone || "",
        allergies: toCsv(data.allergies),
        chronicConditions: toCsv(data.chronicConditions),
      });
    } catch (err) {
      setError(err.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(form) {
    try {
      setError("");
      setSaved(false);

      const payload = {
        dateOfBirth: form.dateOfBirth,
        bloodGroup: form.bloodGroup,
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactRelation: form.emergencyContactRelation.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        // ✅ Always send arrays — never raw strings, never undefined
        allergies: toStringArray(form.allergies),
        chronicConditions: toStringArray(form.chronicConditions),
      };

      const res = await updateMyPatientProfile(payload);
      const data = res.data;

      setProfile(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  }

  function cancelEdit() {
    reset({
      dateOfBirth: profile?.dateOfBirth || "",
      bloodGroup: profile?.bloodGroup || "",
      emergencyContactName: profile?.emergencyContactName || "",
      emergencyContactRelation: profile?.emergencyContactRelation || "",
      emergencyContactPhone: profile?.emergencyContactPhone || "",
      allergies: toCsv(profile?.allergies),
      chronicConditions: toCsv(profile?.chronicConditions),
    });
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Profile not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "We couldn't find your patient profile."}
        </p>
      </div>
    );
  }

  const initials = profile.patientName?.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Profile
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My health profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your medical information.
        </p>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT — identity card */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                {initials}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {profile.patientName}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Patient #{profile.id}
              </p>

              {profile.status && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {profile.status}
                </span>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Droplets}
                label="Blood group"
                value={formatBloodGroup(profile.bloodGroup)}
              />
              <Row
                icon={User}
                label="Gender"
                value={profile.gender || "—"}
              />
              <Row
                icon={Calendar}
                label="Date of birth"
                value={formatDate(profile.dateOfBirth)}
              />
              <Row
                icon={Calendar}
                label="Registered"
                value={formatDate(profile.createdAt)}
              />
            </dl>
          </div>
        </aside>

        {/* RIGHT — info + edit */}
        <div className="space-y-6 lg:col-span-8">
          {/* Account info (read-only) */}
          <SectionCard
            title="Account information"
            desc="Managed by the hospital."
          >
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={User}
                label="Full name"
                value={profile.patientName}
              />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow
                icon={User}
                label="Gender"
                value={profile.gender || "—"}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Name, email, phone and gender are managed by hospital
                administration. Contact the front desk to update these.
              </p>
            </div>
          </SectionCard>

          {/* Medical info (editable) */}
          <SectionCard
            title="Medical information"
            desc="Used by doctors during consultation."
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
                    label="Date of birth"
                    required
                    error={errors.dateOfBirth?.message}
                  >
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        {...register("dateOfBirth")}
                        className="h-11 pl-10"
                      />
                    </div>
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

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field
                    label="Emergency contact name"
                    required
                    error={errors.emergencyContactName?.message}
                  >
                    <Input
                      {...register("emergencyContactName")}
                      placeholder="Full name"
                      className="h-11"
                    />
                  </Field>

                  <Field
                    label="Relation"
                    required
                    error={errors.emergencyContactRelation?.message}
                  >
                    <Input
                      {...register("emergencyContactRelation")}
                      placeholder="e.g. Spouse"
                      className="h-11"
                    />
                  </Field>

                  <Field
                    label="Phone"
                    required
                    error={errors.emergencyContactPhone?.message}
                  >
                    <Input
                      {...register("emergencyContactPhone")}
                      placeholder="10-digit number"
                      className="h-11"
                    />
                  </Field>
                </div>

                <Field
                  label="Allergies"
                  hint="Separate with commas"
                  error={errors.allergies?.message}
                >
                  <Input
                    {...register("allergies")}
                    placeholder="Peanuts, Penicillin, Dust"
                    className="h-11"
                  />
                </Field>

                <Field
                  label="Chronic conditions"
                  hint="Separate with commas"
                  error={errors.chronicConditions?.message}
                >
                  <Input
                    {...register("chronicConditions")}
                    placeholder="Diabetes, Hypertension"
                    className="h-11"
                  />
                </Field>

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
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={Droplets}
                  label="Blood group"
                  value={formatBloodGroup(profile.bloodGroup)}
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of birth"
                  value={formatDate(profile.dateOfBirth)}
                />
                <InfoRow
                  icon={Phone}
                  label="Emergency contact"
                  value={profile.emergencyContactName || "—"}
                />
                <InfoRow
                  icon={User}
                  label="Relation"
                  value={profile.emergencyContactRelation || "—"}
                />
                <InfoRow
                  icon={Phone}
                  label="Emergency phone"
                  value={profile.emergencyContactPhone || "—"}
                />
                <InfoRow
                  icon={HeartPulse}
                  label="Allergies"
                  value={toCsv(profile.allergies) || "None recorded"}
                />
                <InfoRow
                  icon={Heart}
                  label="Chronic conditions"
                  value={toCsv(profile.chronicConditions) || "None recorded"}
                  className="sm:col-span-2"
                />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Components ══════════ */

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
      <dd className="truncate text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 break-words text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && (
          <span className="text-[11px] font-normal text-muted-foreground">
            ({hint})
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}