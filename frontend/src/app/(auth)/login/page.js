"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";



const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export default function LoginPage() {
const router = useRouter();


const loginUser = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
  try {
    await loginUser(data);

    router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
  }
};

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-muted/40 lg:block">
          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">
                  M
                </span>
              </div>

              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  MedCore
                </h1>

                <p className="text-xs text-muted-foreground">
                  Hospital Management System
                </p>
              </div>
            </div>

            {/* Main message */}
            <div className="max-w-xl">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-px w-8 bg-primary" />

                <span className="text-sm font-medium text-primary">
                  Healthcare operations, connected
                </span>
              </div>

              <h2 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-5xl">
                A smarter way to manage
                <span className="block text-muted-foreground">
                  modern healthcare.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
                MedCore brings hospital administration, clinical
                workflows, patient management, billing, laboratory
                services and pharmacy operations together in one
                secure platform.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
                <div>
                  <p className="text-sm font-semibold">
                    Secure
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Role-based access
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Connected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Unified workflows
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Scalable
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Built for hospitals
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>© 2026 MedCore HMS</span>
              <span>Secure healthcare platform</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-12 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-semibold">
                    M
                  </span>
                </div>

                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    MedCore
                  </h1>

                  <p className="text-xs text-muted-foreground">
                    Hospital Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-primary">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight">
                Sign in to MedCore
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enter your credentials to access your hospital
                workspace.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@hospital.com"
                  {...register("email")}
                  className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/15 ${
                    errors.email
                      ? "border-destructive focus:border-destructive"
                      : "border-input focus:border-primary"
                  }`}
                />

                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/15 ${
                    errors.password
                      ? "border-destructive focus:border-destructive"
                      : "border-input focus:border-primary"
                  }`}
                />

                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* REGISTER */}
            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* SECURITY */}
            <div className="mt-8 rounded-md border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs leading-5 text-muted-foreground">
                MedCore access is restricted to authorized users.
                Hospital information is protected through role-based
                access controls.
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}