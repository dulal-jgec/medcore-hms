"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Building2,
  Pencil,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Camera,
  Languages,
  HeartPulse,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

import {
  getMyAccountantProfile,
  updateMyAccountantProfile,
  uploadAccountantProfileImage,
} from "@/services/accountant.service";

export default function AccountantProfilePage() {
  const { accessToken } = useAuthStore();

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    bio: "",
    languages: "",
    emergencyContact: "",
  });

  useEffect(() => {
    if (!accessToken) return;

    loadProfile();
  }, [accessToken]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const result = await getMyAccountantProfile(accessToken);

      const data = result.data;

      setProfile(data);

      setForm({
        bio: data.bio || "",
        languages: data.languages || "",
        emergencyContact: data.emergencyContact || "",
      });
    } catch (err) {
      setError(
        err.message || "Failed to load accountant profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const result = await updateMyAccountantProfile(
        accessToken,
        {
          bio: form.bio.trim(),
          languages: form.languages.trim(),
          emergencyContact: form.emergencyContact.trim(),
        }
      );

      setProfile(result.data);

      setForm({
        bio: result.data.bio || "",
        languages: result.data.languages || "",
        emergencyContact:
          result.data.emergencyContact || "",
      });

      setEditing(false);
      showSaved();
    } catch (err) {
      setError(
        err.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (!profile) return;

    setForm({
      bio: profile.bio || "",
      languages: profile.languages || "",
      emergencyContact:
        profile.emergencyContact || "",
    });

    setEditing(false);
    setError("");
  }

  function showSaved() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  function openImagePicker() {
    fileInputRef.current?.click();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");

      const result =
        await uploadAccountantProfileImage(
          accessToken,
          file
        );

      setProfile(result.data);

      showSaved();
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

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">
          <p className="text-sm font-medium text-destructive">
            {error || "Unable to load profile."}
          </p>

          <Button
            className="mt-4"
            variant="outline"
            onClick={loadProfile}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const initials =
    profile.name?.charAt(0)?.toUpperCase() || "A";

  const status =
    profile.status === "ACTIVE" ? "Active" : "Inactive";

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
          Your accountant account information and profile.
        </p>
      </div>

      {/* Success */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-brand" />

          <p className="font-medium text-brand-soft-foreground">
            Profile updated successfully
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              {/* Image */}
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
                  onClick={openImagePicker}
                  disabled={uploadingImage}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Change photo"
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
                {profile.designation || "Accountant"}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {profile.hospitalName}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                <ShieldCheck className="h-3 w-3" />
                {status}
              </span>
            </div>

            {/* Employment summary */}
            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Briefcase}
                label="Designation"
                value={
                  profile.designation || "Not specified"
                }
              />

              <Row
                icon={Building2}
                label="Hospital"
                value={profile.hospitalName}
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
          {/* Account information */}
          <SectionCard
            title="Account information"
            desc="Managed by hospital administration."
          >
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={User}
                label="Full name"
                value={profile.name}
              />

              <InfoRow
                icon={Briefcase}
                label="Role"
                value="Accountant"
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
            </dl>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Your name, email, phone, hospital and
                employment information are managed by hospital
                administration and cannot be edited here.
              </p>
            </div>
          </SectionCard>

          {/* Personal profile */}
          <SectionCard
            title="Personal profile"
            desc="Update information that you manage yourself."
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
                onSubmit={onSubmit}
                className="mt-5 space-y-5"
              >
                {/* Bio */}
                <Field label="Bio">
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={5}
                    placeholder="Write a short professional bio..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </Field>

                {/* Languages */}
                <Field label="Languages">
                  <Input
                    name="languages"
                    value={form.languages}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="e.g. Bengali, Hindi, English"
                    className="h-11"
                  />
                </Field>

                {/* Emergency contact */}
                <Field label="Emergency contact">
                  <Input
                    name="emergencyContact"
                    value={form.emergencyContact}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="10-digit phone number"
                    className="h-11"
                  />
                </Field>

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
                    <Save className="mr-1.5 h-4 w-4" />

                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="mt-5 space-y-6">
                <InfoRow
                  icon={FileText}
                  label="Bio"
                  value={
                    profile.bio || "No bio added yet."
                  }
                />

                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={
                    profile.languages ||
                    "No languages added yet."
                  }
                />

                <InfoRow
                  icon={HeartPulse}
                  label="Emergency contact"
                  value={
                    profile.emergencyContact ||
                    "Not provided"
                  }
                />
              </dl>
            )}
          </SectionCard>

          {/* Employment details */}
          <SectionCard
            title="Employment details"
            desc="Managed by hospital administration."
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FactBox
                icon={Building2}
                label="Hospital"
                value={profile.hospitalName}
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
                icon={ShieldCheck}
                label="Status"
                value={status}
              />

              <FactBox
                icon={Calendar}
                label="Joined on"
                value={formatDate(profile.createdAt)}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Employment details are controlled by hospital
                administration and cannot be changed from this
                profile.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

      <div className="p-5 sm:p-6">{children}</div>
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

      <p className="mt-1.5 text-sm font-medium leading-6">
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
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      {children}
    </div>
  );
}