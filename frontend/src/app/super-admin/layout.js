"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/super-admin",
    icon: LayoutDashboard,
  },
  {
    label: "Hospitals",
    href: "/super-admin/hospitals",
    icon: Building2,
  },
  {
    label: "Hospital Admins",
    href: "/super-admin/admins",
    icon: Users,
  },
];

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const initialized = useAuthStore((state) => state.initialized);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  useEffect(() => {
  if (!initialized) return;

  if (!isAuthenticated || !user) {
    router.replace("/login");
    return;
  }

  if (user.role !== "SUPER_ADMIN") {
    router.replace("/portal");
  }
}, [
  initialized,
  isAuthenticated,
  user,
  router,
]);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  if (!initialized || !isAuthenticated || !user) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Checking access...
      </p>
    </div>
  );
}

if (user.role !== "SUPER_ADMIN") {
  return null;
}
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/super-admin"
            className="flex items-center gap-2.5"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-brand-foreground">
              M
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Med<span className="text-brand">Core</span>
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Platform Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Management
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/super-admin"
                ? pathname === "/super-admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="my-5 border-t border-border" />

          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            System
          </p>

          <Link
            href="/super-admin/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        {/* Admin identity */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-soft-foreground">
              {(user?.fullName || "SA")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.fullName || "Super Admin"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Super Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium">
                Super Admin Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}