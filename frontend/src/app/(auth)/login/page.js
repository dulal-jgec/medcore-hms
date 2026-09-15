// src/app/(auth)/login/page.js

"use client";

import { Suspense } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

 
// ------------------- Your existing logic, now safely inside a component -------------------
function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const hospitalId = params.get("hospitalId");

  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

 async function onSubmit(data) {
  setServerError("");

  try {
    await login(data);

    router.push("/portal");
  } catch (err) {
    setServerError(
      err.message || "Login failed. Please try again."
    );
  }
}

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-foreground">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>

        {/* Form panel */}
        <div className="my-auto w-full max-w-md py-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Welcome back
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {hospitalId
              ? "Sign in to access your hospital portal."
              : "Enter your credentials to continue."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 pl-10"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              New to MedCore?
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button asChild variant="outline" size="lg" className="h-11 w-full">
            <Link href="/register">Create a patient account</Link>
          </Button>

          {/* Demo hint */}
          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Demo tip
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Try prefixes to see different roles:
              <br />
              <span className="font-mono text-foreground">doctor@x.com</span>{" "}
              ·{" "}
              <span className="font-mono text-foreground">nurse@x.com</span>{" "}
              ·{" "}
              <span className="font-mono text-foreground">admin@x.com</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} MedCore. All rights reserved.
        </p>
      </div>

      {/* RIGHT — image panel */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/hero-doctor.jpg"
          alt="Healthcare professional using MedCore"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/40"
        />

        {/* Overlay content */}
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Secure hospital platform
          </div>

          <div>
            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Connected care for{" "}
              <span className="text-brand">every hospital role.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80">
              One platform for patients, doctors, nurses, and administrators —
              with complete data isolation and role-based access.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Multi-tenant secure architecture",
                "Role-aware dashboards",
                "Real-time updates",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-white/85"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/60">
            Trusted by hospitals across India
          </p>
        </div>
      </div>
    </div>
  );
}

// ------------------- The default export wraps the content in Suspense -------------------
export default function LoginPage() {
   
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}