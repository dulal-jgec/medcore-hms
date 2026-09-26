"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  Languages,
  Camera,
  Loader2,
  HeartPulse,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  getMyReceptionistProfile,
  updateMyReceptionistProfile,
  uploadReceptionistProfileImage,
} from "@/services/receptionist.service";

const schema = z.object({
  bio: z
    .string()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional(),

  languages: z
    .string()
    .max(500, "Languages must not exceed 500 characters")
    .optional(),

  emergencyContact: z
    .string()
    .regex(
      /^$|^[6-9]\d{9}$/,
      "Enter a valid 10-digit emergency contact"
    )
    .optional(),
});

export default function ReceptionistProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: "",
      languages: "",
      emergencyContact: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const result = await getMyReceptionistProfile();
      const data = result.data;

      setProfile(data);

      reset({
        bio: data.bio || "",
        languages: data.languages || "",
        emergencyContact: data.emergencyContact || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load receptionist profile.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data) {
    try {
      setError("");
      setSaved(false);

      const result = await updateMyReceptionistProfile({
        bio: data.bio || null,
        languages: data.languages || null,
        emergencyContact: data.emergencyContact || null,
      });

      setProfile(result.data);
      setEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  }

  function cancelEdit() {
    reset({
      bio: profile?.bio || "",
      languages: profile?.languages || "",
      emergencyContact: profile?.emergencyContact || "",
    });

    setEditing(false);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const result = await uploadReceptionistProfileImage(file);

      setProfile(result.data);
    } catch (err) {
      setError(err.message || "Failed to upload profile image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
          <p className="text-sm text-destructive">
            {error || "Profile not found."}
          </p>
        </div>
      </div>
    );
  }

  const initials = profile.name?.charAt(0)?.toUpperCase() || "R";

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
          Manage your receptionist profile information.
        </p>
      </div>

      {/* Success */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={uploadingImage}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Change profile photo"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-brand">
                {profile.designation || "Receptionist"}
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                {profile.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {profile.status}
              </span>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={User}
                label="Receptionist ID"
                value={`#${profile.id}`}
              />

              <Row
                icon={Briefcase}
                label="Designation"
                value={profile.designation || "Not specified"}
              />

              <Row
                icon={Calendar}
                label="Joined on"
                value={formatDate(profile.createdAt)}
              />
            </dl>
          </div>
        </aside>

        {/* RIGHT */}
        <div className="space-y-6 lg:col-span-8">
          {/* Account Information */}
          <SectionCard
            title="Account information"
            desc="These details are managed by hospital administration."
          >
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoRow icon={User} label="Full name" value={profile.name} />
              <InfoRow
                icon={Briefcase}
                label="Role"
                value={profile.designation || "Receptionist"}
              />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Your name, email, phone number, hospital and designation are
                managed by hospital administration.
              </p>
            </div>
          </SectionCard>

          {/* Personal Profile */}
          <SectionCard
            title="Personal information"
            desc="You can update the following information."
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
                <Field label="Bio" error={errors.bio?.message}>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    placeholder="Tell something about yourself..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </Field>

                <Field label="Languages" error={errors.languages?.message}>
                  <Input
                    {...register("languages")}
                    placeholder="English, Bengali, Hindi"
                    className="h-11"
                  />
                </Field>

                <Field
                  label="Emergency contact"
                  error={errors.emergencyContact?.message}
                >
                  <Input
                    {...register("emergencyContact")}
                    placeholder="10-digit mobile number"
                    className="h-11"
                  />
                </Field>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
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
                  icon={HeartPulse}
                  label="Bio"
                  value={profile.bio || "No bio added"}
                />
                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={profile.languages || "Not specified"}
                />
                <InfoRow
                  icon={Phone}
                  label="Emergency contact"
                  value={profile.emergencyContact || "Not specified"}
                />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTS
   ========================================================= */

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

      <dd className="truncate text-right font-medium">{value}</dd>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <p className="mt-1.5 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}