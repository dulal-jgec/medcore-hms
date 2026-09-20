"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Save,
  X,
  ArrowLeft,
  ShieldCheck,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { createAccountant } from "@/services/accountant.service";

const accountantSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(100, "Full name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(100, "Email must not exceed 100 characters"),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian phone number"
    ),

  designation: z
    .string()
    .trim()
    .max(
      100,
      "Designation must not exceed 100 characters"
    )
    .optional(),
});

export default function NewAccountantPage() {
  const router = useRouter();

  const { accessToken } = useAuthStore();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(accountantSchema),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      designation: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      await createAccountant(accessToken, {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        designation:
          data.designation?.trim() || null,
      });

      router.push("/portal/admin/accountants");
    } catch (error) {
      setServerError(
        error.message ||
          "Failed to create accountant."
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Administration
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Add accountant
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create an accountant account for your hospital.
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 rounded-2xl border border-border bg-card">

        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold">
            Accountant information
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Enter the basic information of the accountant.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5 sm:p-6"
        >

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">
                {serverError}
              </p>
            </div>
          )}

          {/* Fields */}
          <div className="grid gap-5 sm:grid-cols-2">

            <Field
              label="Full name"
              icon={User}
              required
              error={errors.fullName?.message}
            >
              <Input
                {...register("fullName")}
                placeholder="Enter full name"
                className="h-11"
              />
            </Field>

            <Field
              label="Email"
              icon={Mail}
              required
              error={errors.email?.message}
            >
              <Input
                {...register("email")}
                type="email"
                placeholder="accountant@example.com"
                className="h-11"
              />
            </Field>

            <Field
              label="Phone"
              icon={Phone}
              required
              error={errors.phone?.message}
            >
              <Input
                {...register("phone")}
                placeholder="10-digit phone number"
                inputMode="numeric"
                maxLength={10}
                className="h-11"
              />
            </Field>

            <Field
              label="Designation"
              icon={Briefcase}
              error={errors.designation?.message}
            >
              <Input
                {...register("designation")}
                placeholder="e.g. Senior Accountant"
                className="h-11"
              />
            </Field>

          </div>

          {/* Credentials info */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">
                Account credentials
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                MedCore will automatically create the
                user account, generate a temporary password,
                and send the login credentials to the
                accountant&apos;s email address.
              </p>
            </div>
          </div>

          {/* Tenant info */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/30 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />

            <div>
              <p className="text-sm font-medium">
                Hospital isolation
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This accountant will automatically belong
                to your current hospital. Hospital selection
                is controlled by the system and cannot be
                changed from this form.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-5">

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
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
                ? "Creating..."
                : "Create accountant"}
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  required,
  error,
  children,
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />

        {label}

        {required && (
          <span className="text-destructive">
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