"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Menu,
  Settings,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoNavigator } from "@/components/portal/demo-navigator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

/* ══════════ Menu ══════════ */

const NAV = [
  { href: "/super-admin/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/super-admin/admins", label: "Admins", icon: Shield },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

const DASHBOARD_BY_ROLE = {
  HOSPITAL_ADMIN: "/portal/admin",
  DOCTOR: "/portal/doctor",
  NURSE: "/portal/nurse",
  ACCOUNTANT: "/portal/accounts",
  RECEPTIONIST: "/portal/reception",
  PATIENT: "/portal/patient",
};

/* ══════════ Layout ══════════ */

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
        <p className="text-sm text-muted-foreground">Redirecting...</p>
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

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="truncate text-sm font-semibold tracking-tight">
            MedCore Admin
          </h1>

          {user?.email && (
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                {user.email}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <DemoNavigator />
    </div>
  );
}

/* ══════════ Sidebar ══════════ */

function SuperAdminSidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
          M
        </span>
        <div>
          <p className="text-sm font-bold tracking-tight">MedCore</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
            Super Admin
          </p>
        </div>
      </div>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-soft text-brand-soft-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}