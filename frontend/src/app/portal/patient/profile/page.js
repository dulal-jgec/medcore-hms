"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Droplets,
  Heart,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from "@/services/patient.service";

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

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ fullName: "", email: "", phone: "" });

  const [form, setForm] = useState({
    dateOfBirth: "",
    bloodGroup: "",
    allergies: "",
    chronicConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await getMyPatientProfile();
        const p = res.data;
        if (!mounted) return;

        setMeta({
          fullName: p.fullName || p.user?.fullName || "",
          email: p.user?.email || "",
          phone: p.user?.phone || "",
        });

        setForm({
          dateOfBirth: p.dateOfBirth || "",
          bloodGroup: p.bloodGroup || "",
          allergies: p.allergies || "",
          chronicConditions: p.chronicConditions || "",
          emergencyContactName: p.emergencyContactName || "",
          emergencyContactPhone: p.emergencyContactPhone || "",
          emergencyContactRelation: p.emergencyContactRelation || "",
        });
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (success) setSuccess("");
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateMyPatientProfile({
        dateOfBirth: form.dateOfBirth || null,
        bloodGroup: form.bloodGroup || null,
        allergies: form.allergies.trim() || null,
        chronicConditions: form.chronicConditions.trim() || null,
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        emergencyContactRelation: form.emergencyContactRelation.trim(),
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/patient"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
          <User className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            My Profile
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Personal & medical details
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your medical information up to date.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <p className="text-sm font-medium text-brand-soft-foreground">
            {success}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <SectionCard
          icon={User}
          title="Account information"
          desc="Managed by your login. Contact support to change."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" icon={User}>
              <Input value={meta.fullName} disabled className="h-11 pl-10" />
            </Field>

            <Field label="Email" icon={Mail}>
              <Input value={meta.email} disabled className="h-11 pl-10" />
            </Field>

            <Field label="Phone" icon={Phone} className="sm:col-span-2">
              <Input value={meta.phone} disabled className="h-11 pl-10" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          icon={Heart}
          title="Medical information"
          desc="Used by doctors to personalize your care."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Date of birth" icon={Calendar}>
              <Input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="h-11 pl-10"
              />
            </Field>

            <Field label="Blood group" icon={Droplets}>
              <select
                value={form.bloodGroup}
                onChange={(e) => update("bloodGroup", e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Allergies"
              icon={AlertCircle}
              className="sm:col-span-2"
            >
              <textarea
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
                rows={3}
                placeholder="e.g. Penicillin, peanuts"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </Field>

            <Field
              label="Chronic conditions"
              icon={Heart}
              className="sm:col-span-2"
            >
              <textarea
                value={form.chronicConditions}
                onChange={(e) => update("chronicConditions", e.target.value)}
                rows={3}
                placeholder="e.g. Type 2 diabetes, hypertension"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          icon={ShieldCheck}
          title="Emergency contact"
          desc="Person we should reach in case of an emergency."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Contact name" required>
              <Input
                value={form.emergencyContactName}
                onChange={(e) =>
                  update("emergencyContactName", e.target.value)
                }
                placeholder="Full name"
                className="h-11"
              />
            </Field>

            <Field label="Relationship" required>
              <Input
                value={form.emergencyContactRelation}
                onChange={(e) =>
                  update("emergencyContactRelation", e.target.value)
                }
                placeholder="e.g. Spouse"
                className="h-11"
              />
            </Field>

            <Field label="Phone" required>
              <Input
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  update("emergencyContactPhone", e.target.value)
                }
                placeholder="+91 90000 00000"
                className="h-11"
              />
            </Field>
          </div>
        </SectionCard>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/patient">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
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
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, required, className, children }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}