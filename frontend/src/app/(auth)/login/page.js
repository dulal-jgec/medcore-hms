"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemoAccountsPanel } from "@/components/auth/demo-accounts-panel";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const hospitalId = params.get("hospitalId");
  const nextParam = params.get("next");

  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data) {
    setServerError("");

    try {
      const user = await login(data);

      if (nextParam && nextParam.startsWith("/")) {
        router.replace(nextParam);
        router.refresh();
        return;
      }

      const role = user.role;

      if (role === "SUPER_ADMIN") router.push("/super-admin");
      else if (role === "HOSPITAL_ADMIN") router.push("/portal/admin");
      else if (role === "DOCTOR") router.push("/portal/doctor");
      else if (role === "NURSE") router.push("/portal/nurse");
      else if (role === "ACCOUNTANT") router.push("/portal/accounts");
      else if (role === "RECEPTIONIST") router.push("/portal/reception");
      else router.push("/portal/patient");

      router.refresh();
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    }
  }

  function handleUseAccount(account) {
    setServerError("");
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* LEFT — form */}
      <div className="flex flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground shadow-sm">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>

        <div className="my-auto w-full max-w-md py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Welcome back
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Sign in to your account
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {hospitalId
              ? "Sign in to access your hospital portal."
              : "Enter your credentials to continue to your workspace."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-hover hover:text-hover-foreground"
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

            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {isSubmitting ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <DemoAccountsPanel onUseAccount={handleUseAccount} />

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
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MedCore. All rights reserved.
        </p>
      </div>

      {/* RIGHT — visual */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/auth-login.jpg"
          alt="Healthcare professional using MedCore"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary-darker via-primary-darker/85 to-primary-darker/40"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <ShieldCheck className="h-4 w-4" />
            Secure hospital platform
          </div>

          <div>
            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              Connected care for{" "}
              <span className="text-brand">every hospital role.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
              One platform for patients, doctors, nurses, and administrators
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}