"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar";
import { SuperAdminTopbar } from "@/components/super-admin/super-admin-topbar";
 
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth-store";

const DASHBOARD_BY_ROLE = {
  HOSPITAL_ADMIN: "/portal/admin",
  DOCTOR: "/portal/doctor",
  NURSE: "/portal/nurse",
  ACCOUNTANT: "/portal/accounts",
  RECEPTIONIST: "/portal/reception",
  PATIENT: "/portal/patient",
};

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const initStartedRef = useRef(false);

  useEffect(() => {
    if (initialized) return;
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    initializeAuth();
  }, [initializeAuth, initialized]);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "SUPER_ADMIN") {
      router.replace(DASHBOARD_BY_ROLE[user.role] || "/login");
    }
  }, [initialized, isAuthenticated, user, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="h-full overflow-y-auto">
          <SuperAdminSidebar />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SuperAdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <SuperAdminTopbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

       
    </div>
  );
}