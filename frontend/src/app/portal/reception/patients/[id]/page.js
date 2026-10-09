"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Droplets,
  Heart,
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
import { getPatientById } from "@/services/receptionist.service";
import { updatePatient } from "@/services/patient.service";

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

/* ══════════ Page ══════════ */

export default function ReceptionPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
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
    if (!patientId) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getPatientById(patientId);
        if (!mounted) return;
        setPatient(res.data);
        fillForm(res.data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load patient.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  function fillForm(data) {
    if (!data) return;
    reset({
      dateOfBirth: data.dateOfBirth || "",
      bloodGroup: data.bloodGroup || "",
      emergencyContactName: data.emergencyContactName || "",
      emergencyContactRelation: data.emergencyContactRelation || "",
      emergencyContactPhone: data.emergencyContactPhone || "",
      allergies: toCsv(data.allergies),
      chronicConditions: toCsv(data.chronicConditions),
    });
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
        // ✅ Always send arrays
        allergies: toStringArray(form.allergies),
        chronicConditions: toStringArray(form.chronicConditions),
      };

      const res = await updatePatient(patientId, payload);
      const data = res.data;

      setPatient(data);
      fillForm(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update patient.");
    }
  }

  function cancelEdit() {
    fillForm(patient);
    setEditing(false);
    setError("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This patient record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/reception/patients">Back to patients</Link>
        </Button>
      </div>
    );
  }

  if (!patient) return null;

  const name = getPatientName(patient);
  const email = patient.email || patient.user?.email;
  const phone = patient.phone || patient.user?.phone;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Success banner */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Patient updated successfully.
          </p>
        </div>
      )}

      {/* Error banner (only when patient loaded but update failed) */}
      {error && patient && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                {name.charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Patient #{patient.id}
              </p>

              {patient.status && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {patient.status}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <QuickRow
                icon={Droplets}
                label="Blood group"
                value={formatBloodGroup(patient.bloodGroup)}
              />
              <QuickRow
                icon={User}
                label="Gender"
                value={patient.gender || "—"}
              />
              <QuickRow
                icon={Calendar}
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />
              <QuickRow
                icon={Clock}
                label="Registered"
                value={formatDate(patient.createdAt)}
              />
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <Button asChild className="w-full">
                <Link
                  href={`/portal/reception/appointments/new?patientId=${patient.id}`}
                >
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Book appointment
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <div className="space-y-6 lg:col-span-8">
          {/* Contact info (read-only — managed by admin/user side) */}
          <SectionCard
            icon={Phone}
            title="Contact information"
            desc="How to reach this patient."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Phone} label="Phone" value={phone} />
              <InfoRow icon={Mail} label="Email" value={email} />
            </div>
          </SectionCard>

          {/* Medical info (editable) */}
          <SectionCard
            icon={Heart}
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
                className="space-y-5"
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

                <div className="border-t border-border pt-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Emergency contact
                  </p>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field
                      label="Name"
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
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoRow
                  icon={Droplets}
                  label="Blood group"
                  value={formatBloodGroup(patient.bloodGroup)}
                />
                <InfoRow
                  icon={User}
                  label="Gender"
                  value={patient.gender}
                />
                <InfoRow
                  icon={AlertCircle}
                  label="Allergies"
                  value={toCsv(patient.allergies) || "None recorded"}
                  className="sm:col-span-2"
                />
                <InfoRow
                  icon={Heart}
                  label="Chronic conditions"
                  value={toCsv(patient.chronicConditions) || "None recorded"}
                  className="sm:col-span-2"
                />
              </div>
            )}
          </SectionCard>

          {/* Emergency contact (read view — hidden while editing because it lives inside form) */}
          {!editing && (
            <SectionCard
              icon={ShieldCheck}
              title="Emergency contact"
              desc="Person to reach in case of emergency."
            >
              <div className="grid gap-5 sm:grid-cols-3">
                <InfoRow
                  icon={User}
                  label="Name"
                  value={patient.emergencyContactName}
                />
                <InfoRow
                  icon={User}
                  label="Relation"
                  value={patient.emergencyContactRelation}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={patient.emergencyContactPhone}
                />
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Components ══════════ */

function SectionCard({ icon: Icon, title, desc, action, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {desc && (
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
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
      <p className="mt-1.5 break-words text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function QuickRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="truncate text-right font-medium">{value || "—"}</span>
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

/* ══════════ Helpers ══════════ */

function getPatientName(patient) {
  if (!patient) return "Unknown";
  return (
    patient.patientName ||
    patient.fullName ||
    patient.name ||
    patient.user?.fullName ||
    patient.user?.name ||
    "Unknown"
  );
}

function formatBloodGroup(bg) {
  if (!bg) return "—";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}