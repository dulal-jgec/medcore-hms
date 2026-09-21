"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createReceptionist } from "@/services/receptionist.service";

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(
      100,
      "Full name must not exceed 100 characters"
    ),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(
      150,
      "Email must not exceed 150 characters"
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit phone number"
    ),

  designation: z
    .string()
    .trim()
    .max(
      100,
      "Designation must not exceed 100 characters"
    )
    .optional()
    .or(z.literal("")),
});

export default function NewReceptionistPage() {
  const router = useRouter();

  const [error, setError] =
    useState("");

  const [created, setCreated] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(schema),

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      designation: "",
    },
  });

  async function onSubmit(data) {
    try {
      setError("");

      await createReceptionist({
        fullName: data.fullName.trim(),
        email: data.email
          .trim()
          .toLowerCase(),
        phone: data.phone.trim(),
        designation:
          data.designation?.trim() || null,
      });

      setCreated(true);

      setTimeout(() => {
        router.push(
          "/portal/admin/receptionists"
        );
      }, 1200);

    } catch (err) {
      setError(
        err.message ||
          "Failed to create receptionist."
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Back */}

      <Link
        href="/portal/admin/receptionists"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to receptionists
      </Link>

      {/* Header */}

      <div className="mt-6">

        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Staff Management
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Add receptionist
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a receptionist account for
          your hospital.
        </p>

      </div>

      {/* Success */}

      {created && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-4">

          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />

          <div>

            <p className="text-sm font-semibold text-brand-soft-foreground">
              Receptionist created
              successfully.
            </p>

            <p className="mt-1 text-xs text-brand-soft-foreground/80">
              Login credentials have been
              sent to the receptionist's
              email address.
            </p>

          </div>

        </div>
      )}

      {/* Error */}

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Form */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6"
      >

        <div className="rounded-2xl border border-border bg-card">

          {/* Form header */}

          <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">

              <UserPlus className="h-5 w-5" />

            </div>

            <div>

              <h2 className="text-base font-semibold">
                Receptionist information
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Enter the basic account
                information.
              </p>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Full Name */}

              <Field
                label="Full name"
                required
                error={
                  errors.fullName
                    ?.message
                }
                icon={User}
              >
                <Input
                  {...register(
                    "fullName"
                  )}
                  placeholder="Enter full name"
                  className="h-11 pl-10"
                />
              </Field>

              {/* Email */}

              <Field
                label="Email"
                required
                error={
                  errors.email?.message
                }
                icon={Mail}
              >
                <Input
                  {...register(
                    "email"
                  )}
                  type="email"
                  placeholder="receptionist@example.com"
                  className="h-11 pl-10"
                />
              </Field>

              {/* Phone */}

              <Field
                label="Phone number"
                required
                error={
                  errors.phone?.message
                }
                icon={Phone}
              >
                <Input
                  {...register(
                    "phone"
                  )}
                  placeholder="10-digit phone number"
                  inputMode="numeric"
                  className="h-11 pl-10"
                />
              </Field>

              {/* Designation */}

              <Field
                label="Designation"
                error={
                  errors.designation
                    ?.message
                }
                icon={Briefcase}
              >
                <Input
                  {...register(
                    "designation"
                  )}
                  placeholder="e.g. Front Desk Receptionist"
                  className="h-11 pl-10"
                />
              </Field>

            </div>

            {/* Info */}

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">

              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

              <div>

                <p className="text-sm font-medium">
                  Account credentials
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A temporary password will
                  be generated automatically
                  and sent to the receptionist's
                  email address. The password
                  is securely encrypted before
                  being stored.
                </p>

              </div>

            </div>

          </div>

          {/* Actions */}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">

            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link href="/portal/admin/receptionists">
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >

              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Create receptionist
                </>
              )}

            </Button>

          </div>

        </div>

      </form>
    </div>
  );
}

/* =========================================================
   FIELD
   ========================================================= */

function Field({
  label,
  required,
  error,
  icon: Icon,
  children,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-sm font-medium">

        {label}

        {required && (
          <span className="ml-0.5 text-destructive">
            *
          </span>
        )}

      </label>

      <div className="relative">

        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {children}

      </div>

      {error && (
        <p className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}

    </div>
  );
}