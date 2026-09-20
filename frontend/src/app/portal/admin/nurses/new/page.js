"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  HeartPulse,
  Briefcase,
  GraduationCap,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { createNurse } from "@/services/nurse.service";

export default function CreateNursePage() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    ward: "",
    designation: "",
    qualification: "",
    licenseNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("Authentication session not found.");
      return;
    }

    try {
      setLoading(true);

      const result = await createNurse(
        accessToken,
        {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          department: form.department.trim(),
          ward: form.ward.trim(),
          designation: form.designation.trim(),
          qualification: form.qualification.trim(),
          licenseNumber:
            form.licenseNumber.trim(),
        }
      );

      setSuccess(
        result.message ||
          "Nurse created successfully."
      );

      setTimeout(() => {
        router.push("/portal/admin/nurses");
      }, 1200);
    } catch (error) {
      setError(
        error.message ||
          "Failed to create nurse."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Back */}
      <Link
        href="/portal/admin/nurses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to nurses
      </Link>

      {/* Header */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Staff Management
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Add nurse
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a nurse account for your hospital.
        </p>
      </div>

      {/* Success */}
      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />

          <div>
            <p className="text-sm font-medium text-brand-soft-foreground">
              {success}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Redirecting to nurses...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <div className="rounded-2xl border border-border bg-card">

          {/* Basic Information */}
          <section>
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">
                Basic information
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Enter the nurse's account details.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <Field
                label="Full name"
                required
                icon={User}
              >
                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Ananya Sharma"
                  required
                  minLength={2}
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="Email"
                required
                icon={Mail}
              >
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nurse@example.com"
                  required
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="Phone"
                required
                icon={Phone}
              >
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  className="h-11"
                />
              </Field>

            </div>
          </section>

          {/* Professional Information */}
          <section className="border-t border-border">

            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold">
                Professional information
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Add the nurse's hospital assignment and credentials.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

              <Field
                label="Department"
                required
                icon={Building2}
              >
                <Input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Emergency"
                  required
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="Ward"
                icon={HeartPulse}
              >
                <Input
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="e.g. General Ward"
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="Designation"
                icon={Briefcase}
              >
                <Input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="e.g. Staff Nurse"
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="Qualification"
                icon={GraduationCap}
              >
                <Input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g. B.Sc Nursing"
                  maxLength={100}
                  className="h-11"
                />
              </Field>

              <Field
                label="License number"
                icon={FileText}
                className="sm:col-span-2"
              >
                <Input
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  placeholder="Nursing registration / license number"
                  maxLength={50}
                  className="h-11"
                />
              </Field>

            </div>
          </section>

          {/* Account Information */}
          <section className="border-t border-border">

            <div className="flex items-start gap-3 bg-muted/20 px-5 py-4 sm:px-6">

              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Account credentials
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A temporary password will be generated
                  automatically and sent to the nurse's
                  email address.
                </p>
              </div>

            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border p-5 sm:flex-row sm:justify-end sm:p-6">

            <Button
              type="button"
              variant="outline"
              asChild
              disabled={loading}
            >
              <Link href="/portal/admin/nurses">
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {loading
                ? "Creating..."
                : "Create nurse"}
            </Button>

          </div>
        </div>
      </form>
    </div>
  );
}


/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  required,
  icon: Icon,
  className,
  children,
}) {
  return (
    <div className={className}>

      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        )}

        {label}

        {required && (
          <span className="text-destructive">
            *
          </span>
        )}
      </label>

      {children}

    </div>
  );
}