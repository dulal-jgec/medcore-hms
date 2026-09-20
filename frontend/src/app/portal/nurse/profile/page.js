"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  FileText,
  HeartPulse,
  Camera,
  Languages,
  Loader2,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/store/auth-store";

import {
  getMyNurseProfile,
  updateMyNurseProfile,
  uploadNurseProfileImage,
} from "@/services/nurse.service";

export default function NurseProfilePage() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [profile, setProfile] =
    useState(null);

  const [editing, setEditing] =
    useState(false);

  const [form, setForm] = useState({
    bio: "",
    languages: "",
    emergencyContact: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef(null);

  useEffect(() => {
    if (!accessToken) return;

    loadProfile();
  }, [accessToken]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getMyNurseProfile(
          accessToken
        );

      const data = result.data;

      setProfile(data);

      setForm({
        bio: data.bio || "",
        languages:
          data.languages || "",
        emergencyContact:
          data.emergencyContact || "",
      });
    } catch (error) {
      setError(
        error.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const result =
        await updateMyNurseProfile(
          accessToken,
          form
        );

      setProfile(result.data);

      setEditing(false);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      setError(
        error.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setForm({
      bio: profile?.bio || "",
      languages:
        profile?.languages || "",
      emergencyContact:
        profile?.emergencyContact || "",
    });

    setEditing(false);
  }

  async function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const result =
        await uploadNurseProfileImage(
          accessToken,
          file
        );

      setProfile(result.data);
      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      setError(
        error.message ||
          "Failed to upload profile image."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
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
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          {error ||
            "Unable to load nurse profile."}
        </div>
      </div>
    );
  }

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
          Manage your personal information and
          professional profile.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />

          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">

        {/* LEFT */}
        <aside className="lg:col-span-4">

          <div className="rounded-2xl border border-border bg-card p-6">

            <div className="flex flex-col items-center text-center">

              {/* Profile Image */}
              <div className="relative">

                {profile.profileImageUrl ? (
                  <img
                    src={
                      profile.profileImageUrl
                    }
                    alt={profile.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                    {profile.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                )}

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Change photo"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {profile.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-brand">
                {profile.designation ||
                  "Nurse"}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {profile.hospitalName}
              </p>

              <span
                className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  profile.status ===
                    "ACTIVE"
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <ShieldCheck className="h-3 w-3" />

                {profile.status}
              </span>
            </div>

            {/* Basic info */}
            <dl className="mt-6 space-y-4 border-t border-border pt-5 text-sm">

              <Row
                icon={Building2}
                label="Department"
                value={
                  profile.department ||
                  "Not assigned"
                }
              />

              <Row
                icon={HeartPulse}
                label="Ward"
                value={
                  profile.ward ||
                  "Not assigned"
                }
              />

              <Row
                icon={GraduationCap}
                label="Qualification"
                value={
                  profile.qualification ||
                  "Not specified"
                }
              />

              <Row
                icon={FileText}
                label="License No."
                value={
                  profile.licenseNumber ||
                  "Not specified"
                }
              />

            </dl>
          </div>
        </aside>

        {/* RIGHT */}
        <div className="space-y-6 lg:col-span-8">

          {/* Contact */}
          <SectionCard
            title="Contact information"
            desc="Your account contact details."
            action={
              !editing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditing(true)
                  }
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit profile
                </Button>
              )
            }
          >

            {editing ? (
              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-5"
              >

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Read only */}
                  <InfoRow
                    icon={User}
                    label="Full name"
                    value={profile.name}
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

                  {/* Editable */}
                  <Field label="Emergency contact">
                    <Input
                      value={
                        form.emergencyContact
                      }
                      onChange={(e) =>
                        handleChange(
                          "emergencyContact",
                          e.target.value
                        )
                      }
                      placeholder="Emergency contact number"
                      className="h-11"
                    />
                  </Field>

                  <Field
                    label="Languages"
                    className="sm:col-span-2"
                  >
                    <Input
                      value={
                        form.languages
                      }
                      onChange={(e) =>
                        handleChange(
                          "languages",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Bengali, Hindi, English"
                      className="h-11"
                    />
                  </Field>

                  <Field
                    label="Bio"
                    className="sm:col-span-2"
                  >
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        handleChange(
                          "bio",
                          e.target.value
                        )
                      }
                      rows={5}
                      maxLength={1000}
                      placeholder="Write a short professional bio..."
                      className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />

                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      {form.bio.length}/1000
                    </p>
                  </Field>

                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-4 w-4" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </Button>

                </div>
              </form>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <InfoRow
                  icon={User}
                  label="Full name"
                  value={profile.name}
                />

                <InfoRow
                  icon={Briefcase}
                  label="Role"
                  value="Nurse"
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
                  icon={Phone}
                  label="Emergency contact"
                  value={
                    profile.emergencyContact ||
                    "Not provided"
                  }
                />

                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={
                    profile.languages ||
                    "Not provided"
                  }
                />

              </div>
            )}
          </SectionCard>

          {/* Professional */}
          <SectionCard
            title="Professional information"
            desc="Information managed by hospital administration."
          >

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <FactBox
                icon={Building2}
                label="Hospital"
                value={
                  profile.hospitalName
                }
              />

              <FactBox
                icon={HeartPulse}
                label="Department"
                value={
                  profile.department ||
                  "Not assigned"
                }
              />

              <FactBox
                icon={HeartPulse}
                label="Ward"
                value={
                  profile.ward ||
                  "Not assigned"
                }
              />

              <FactBox
                icon={Briefcase}
                label="Designation"
                value={
                  profile.designation ||
                  "Not specified"
                }
              />

              <FactBox
                icon={GraduationCap}
                label="Qualification"
                value={
                  profile.qualification ||
                  "Not specified"
                }
              />

              <FactBox
                icon={FileText}
                label="License No."
                value={
                  profile.licenseNumber ||
                  "Not specified"
                }
              />

            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">

              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Hospital, department, ward,
                designation, qualification and
                license information are managed
                by hospital administration.
              </p>

            </div>
          </SectionCard>

          {/* Bio */}
          <SectionCard
            title="Professional bio"
            desc="A short introduction about your nursing experience."
          >

            <div className="mt-5">

              {profile.bio ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No professional bio added yet.
                </p>
              )}

            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}


/* =====================================================
   COMPONENTS
===================================================== */

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

      <dd className="max-w-[55%] truncate text-right font-medium">
        {value}
      </dd>

    </div>
  );
}


function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>

      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <p className="mt-1.5 text-sm font-medium">
        {value}
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

        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-medium leading-5">
        {value}
      </p>

    </div>
  );
}


function Field({
  label,
  className,
  children,
}) {
  return (
    <div className={className}>

      <label className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      {children}

    </div>
  );
}