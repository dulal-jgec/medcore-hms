"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const DASHBOARD_BY_ROLE = {
  SUPER_ADMIN: "/super-admin",
  HOSPITAL_ADMIN: "/portal/admin",
  DOCTOR: "/portal/doctor",
  NURSE: "/portal/nurse",
  ACCOUNTANT: "/portal/accounts",
  RECEPTIONIST: "/portal/reception",
  PATIENT: "/portal/patient",
};

export default function PortalIndexPage() {
  const router = useRouter();
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    const target = DASHBOARD_BY_ROLE[user.role] || "/login";
    router.replace(target);
  }, [initialized, isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  );
}