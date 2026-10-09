"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Heart,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { href: "/super-admin/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/super-admin/admins", label: "Admins", icon: Shield },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  LAB_TECHNICIAN: "Lab Technician",
  PHARMACIST: "Pharmacist",
  ACCOUNTANT: "Accountant",
  PATIENT: "Patient",
};

export function SuperAdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.fullName || "Account";
  const displayRole = ROLE_LABELS[user?.role] || "Super Admin";
  const initials = displayName
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
            M
          </div>
          <span className="text-base font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold text-brand-foreground">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{displayName}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {displayRole}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-brand"
                        : "text-muted-foreground group-hover:text-hover-foreground"
                    )}
                  />
                  <span className="truncate">{label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
          <div className="flex items-center gap-1.5 text-destructive">
            <Heart className="h-3 w-3" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">
              Emergency
            </p>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            +91 90000 00000
          </p>
        </div>
      </div>
    </div>
  );
}