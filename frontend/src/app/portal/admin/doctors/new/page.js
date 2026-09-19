"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Stethoscope,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  BriefcaseMedical,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { createDoctor } from "@/services/doctor.service";

const API_BASE_URL = "http://localhost:8080/api/v1";

export default function CreateDoctorPage() {
  const router = useRouter();

  const { accessToken } = useAuthStore();

  const [departments, setDepartments] = useState([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    departmentId: "",
    specialization: "",
    experienceYears: "",
    consultationFee: "",
    qualification: "",
  });

  useEffect(() => {
    if (!accessToken) return;

    loadDepartments();
  }, [accessToken]);

  async function loadDepartments() {
    try {
      setLoadingDepartments(true);

      /*
       * Change this endpoint only if your existing
       * DepartmentController uses a different path.
       */
      const response = await fetch(
        `${API_BASE_URL}/departments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load departments."
        );
      }

      /*
       * Supports your existing PageResponse style.
       */
      setDepartments(
        result.data?.items ||
          result.data?.content ||
          result.data ||
          []
      );
    } catch (error) {
      setError(
        error.message || "Failed to load departments."
      );
    } finally {
      setLoadingDepartments(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("You are not authenticated.");
      return;
    }

    if (!form.departmentId) {
      setError("Please select a department.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        departmentId: Number(form.departmentId),
        specialization: form.specialization.trim(),
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        qualification: form.qualification.trim(),
      };

      await createDoctor(
        accessToken,
        payload
      );

      setSuccess(
        "Doctor account created successfully. Login credentials have been sent to the doctor's email."
      );

      setForm({
        fullName: "",
        email: "",
        phone: "",
        departmentId: "",
        specialization: "",
        experienceYears: "",
        consultationFee: "",
        qualification: "",
      });

      /*
       * Give the success message a moment to be visible.
       */
      setTimeout(() => {
        router.push("/portal/admin/doctors");
      }, 1800);
    } catch (error) {
      setError(
        error.message ||
          "Failed to create doctor."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Back */}
      <Link
        href="/portal/admin/doctors"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to doctors
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
          <Stethoscope className="h-6 w-6" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Add Doctor
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a doctor account and professional profile for your hospital.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-semibold text-destructive">
              Unable to create doctor
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/30 bg-brand-soft/30 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />

          <p className="text-sm font-medium">
            {success}
          </p>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >

        {/* Personal Information */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <User className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Personal information
              </h2>

              <p className="text-xs text-muted-foreground">
                Basic information used to create the doctor's account.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* Full name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Full name
              </label>

              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Dr. Rahul Sharma"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength={10}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <BriefcaseMedical className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-base font-semibold">
                Professional information
              </h2>

              <p className="text-xs text-muted-foreground">
                Doctor's department and professional credentials.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            {/* Department */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Department
              </label>

              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  disabled={loadingDepartments}
                  required
                  className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : "Select department"}
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Specialization
              </label>

              <div className="relative">
                <Stethoscope className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="Cardiology"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Experience
              </label>

              <div className="relative">
                <BriefcaseMedical className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  placeholder="5"
                  min="0"
                  max="60"
                  className="h-11 pl-10"
                  required
                />
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground">
                Years of professional experience.
              </p>
            </div>

            {/* Consultation fee */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Consultation fee
              </label>

              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="number"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleChange}
                  placeholder="800"
                  min="0"
                  step="0.01"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            {/* Qualification */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Qualification
              </label>

              <div className="relative">
                <GraduationCap className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                <Input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="MBBS, MD Cardiology"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

            <div>
              <h2 className="text-sm font-semibold">
                Account credentials
              </h2>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A temporary password will be generated automatically.
                The doctor's login credentials will be sent to the
                email address provided above.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/portal/admin/doctors">
              Cancel
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={submitting || loadingDepartments}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating doctor...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-4 w-4" />
                Create doctor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}