"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Pencil,
  X,
  Save,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  IndianRupee,
  Camera,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getMyDoctorProfile,
  updateMyDoctorProfile,
  uploadDoctorProfileImage,
} from "@/services/doctor.service";
import { useAuthStore } from "@/store/auth-store";

const profileSchema = z.object({
  consultationFee: z.coerce
    .number()
    .min(0, "Fee cannot be negative"),

  bio: z
    .string()
    .max(1000, "Keep it under 1000 characters")
    .optional(),

  languages: z
    .string()
    .max(500, "Keep it under 500 characters")
    .optional(),
});

export default function DoctorProfilePage() {
  const { accessToken } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      consultationFee: "",
      bio: "",
      languages: "",
    },
  });

  // ==============================
  // FETCH PROFILE
  // ==============================

  useEffect(() => {
    if (!accessToken) return;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const result = await getMyDoctorProfile(accessToken);

        const data = result.data;

        setProfile(data);

        reset({
          consultationFee: data.consultationFee ?? "",
          bio: data.bio ?? "",
          languages: data.languages ?? "",
        });
      } catch (err) {
        setError(
          err.message || "Failed to load doctor profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [accessToken, reset]);

  // ==============================
  // UPDATE PROFILE
  // ==============================

  async function onSubmit(data) {
    try {
      setError("");

      const result = await updateMyDoctorProfile(
        accessToken,
        data
      );

      setProfile(result.data);

      reset({
        consultationFee: result.data.consultationFee ?? "",
        bio: result.data.bio ?? "",
        languages: result.data.languages ?? "",
      });

      setEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err.message || "Failed to update profile."
      );
    }
  }

  // ==============================
  // PROFILE IMAGE
  // ==============================

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const result = await uploadDoctorProfileImage(
        accessToken,
        file
      );

      setProfile(result.data);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err.message || "Failed to upload profile image."
      );
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function cancelEdit() {
    reset({
      consultationFee: profile?.consultationFee ?? "",
      bio: profile?.bio ?? "",
      languages: profile?.languages ?? "",
    });

    setEditing(false);
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  // ==============================
  // ERROR
  // ==============================

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {error || "Doctor profile could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  const languages = profile.languages
    ? profile.languages
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean)
        .join(", ")
    : "Not specified";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Header */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Profile
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Your professional details visible to patients and hospital staff.
        </p>
      </div>

      {/* Success */}

      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />

          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully
          </p>
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">

        {/* LEFT */}

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">

            {/* Avatar */}

            <div className="flex flex-col items-center text-center">

              <div className="relative">

                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.doctorName}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                    {profile.doctorName
                      ?.replace(/^Dr\.?\s*/i, "")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploadingImage}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {uploadingImage && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Uploading image...
                </p>
              )}

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {profile.doctorName}
              </h2>

              <p className="mt-1 text-sm font-medium text-brand">
                {profile.specialization}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {profile.departmentName} · {profile.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {profile.status}
              </span>
            </div>

            {/* Quick facts */}

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">

              <Row
                icon={Stethoscope}
                label="Department"
                value={profile.departmentName}
              />

              <Row
                icon={Award}
                label="Experience"
                value={`${profile.experienceYears} years`}
              />

              <Row
                icon={IndianRupee}
                label="Consultation fee"
                value={`₹${profile.consultationFee}`}
              />

              <Row
                icon={Building2}
                label="Hospital"
                value={profile.hospitalName}
              />

            </dl>
          </div>
        </aside>

        {/* RIGHT */}

        <div className="space-y-6 lg:col-span-8">

          {/* Contact & Basic Info */}

          <SectionCard
            title="Contact & basic info"
            desc="Your contact details and editable profile information."
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

                  {/* READ ONLY */}

                  <Field label="Full name">
                    <Input
                      value={profile.doctorName || ""}
                      disabled
                      className="h-11"
                    />
                  </Field>

                  {/* EDITABLE */}

                  <Field
                    label="Consultation fee (₹)"
                    error={errors.consultationFee?.message}
                    required
                  >
                    <Input
                      {...register("consultationFee")}
                      type="number"
                      className="h-11"
                    />
                  </Field>

                  {/* READ ONLY */}

                  <Field label="Email">
                    <Input
                      value={profile.email || ""}
                      disabled
                      className="h-11"
                    />
                  </Field>

                  <Field label="Phone">
                    <Input
                      value={profile.phone || ""}
                      disabled
                      className="h-11"
                    />
                  </Field>

                  {/* LANGUAGES */}

                  <Field
                    label="Languages"
                    error={errors.languages?.message}
                  >
                    <Input
                      {...register("languages")}
                      placeholder="English, Bengali, Hindi"
                      className="h-11"
                    />
                  </Field>

                  {/* BIO */}

                  <Field
                    label="Professional bio"
                    error={errors.bio?.message}
                    className="sm:col-span-2"
                  >
                    <textarea
                      {...register("bio")}
                      rows={4}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
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

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-1.5 h-4 w-4" />

                    {isSubmitting
                      ? "Saving..."
                      : "Save changes"}
                  </Button>

                </div>
              </form>
            ) : (
              <>

                <dl className="mt-5 grid gap-5 sm:grid-cols-2">

                  <InfoRow
                    icon={User}
                    label="Full name"
                    value={profile.doctorName}
                  />

                  <InfoRow
                    icon={IndianRupee}
                    label="Consultation fee"
                    value={`₹${profile.consultationFee}`}
                  />

                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={profile.email}
                  />

                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={profile.phone}
                  />

                  <InfoRow
                    icon={Languages}
                    label="Languages"
                    value={languages}
                    className="sm:col-span-2"
                  />

                </dl>

                {profile.bio && (
                  <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">

                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Professional bio
                    </p>

                    <p className="mt-2 text-sm leading-6">
                      {profile.bio}
                    </p>

                  </div>
                )}

              </>
            )}

          </SectionCard>

          {/* PROFESSIONAL INFORMATION */}

          <SectionCard
            title="Professional information"
            desc="Managed by your hospital. Contact them for changes."
          >

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <FactBox
                icon={Stethoscope}
                label="Specialization"
                value={profile.specialization}
              />

              <FactBox
                icon={GraduationCap}
                label="Qualification"
                value={profile.qualification}
              />

              <FactBox
                icon={Briefcase}
                label="Experience"
                value={`${profile.experienceYears} years`}
              />

              <FactBox
                icon={Building2}
                label="Department"
                value={profile.departmentName}
              />

            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">

              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Professional details such as specialization,
                qualification, department, and experience are
                managed by the hospital and cannot be edited here.
              </p>

            </div>

          </SectionCard>

        </div>
      </div>
    </div>
  );
}

/* ==============================
   SUB COMPONENTS
============================== */

function SectionCard({
  title,
  desc,
  action,
  children,
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">

        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {title}
          </h2>

          {desc && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {desc}
            </p>
          )}
        </div>

        {action}

      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>

    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>

      <dd className="truncate text-right font-medium">
        {value || "Not specified"}
      </dd>

    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}) {
  return (
    <div className={className}>

      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">

        <Icon className="h-3.5 w-3.5" />

        {label}

      </div>

      <p className="mt-1.5 text-sm font-medium">
        {value || "Not specified"}
      </p>

    </div>
  );
}

function FactBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">

      <div className="flex items-center gap-2 text-brand">

        <Icon className="h-4 w-4" />

        <p className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </p>

      </div>

      <p className="mt-2 text-sm font-medium leading-5">
        {value || "Not specified"}
      </p>

    </div>
  );
}

function Field({
  label,
  required,
  error,
  className,
  children,
}) {
  return (
    <div className={cn(className)}>

      <label className="mb-1.5 block text-sm font-medium">

        {label}

        {required && (
          <span className="ml-0.5 text-destructive">
            *
          </span>
        )}

      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}