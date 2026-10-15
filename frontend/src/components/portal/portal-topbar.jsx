"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Building2,
  Home,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

/* ══════════ Config ══════════ */

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

const SEGMENT_LABELS = {
  portal: "Portal",
  admin: "Hospital Admin",
  nurse: "Nurse",
  doctor: "Doctor",
  patient: "Patient",
  reception: "Reception",
  lab: "Laboratory",
  pharmacy: "Pharmacy",
  accounts: "Accounts",
  super: "Super Admin",
};

/**
 * Role → profile page mapping.
 * Sudhu jei role er profile page tomar project e ache shetai include koro.
 * Na thakle, option ta show korbe na — broken link er theke better.
 */
const PROFILE_BY_ROLE = {
  SUPER_ADMIN: null, // ekhono super-admin profile page nei
  HOSPITAL_ADMIN: "/portal/admin/settings",
  DOCTOR: "/portal/doctor/profile",
  NURSE: "/portal/nurse/profile",
  RECEPTIONIST: "/portal/reception/profile",
  ACCOUNTANT: "/portal/accounts/profile",
  PATIENT: "/portal/patient/profile",
};

/* ══════════ Component ══════════ */

export function PortalTopbar({ onOpenSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const segments = (pathname || "").split("/").filter(Boolean);

  const displayName = user?.fullName || "Account";
  const displayRole = ROLE_LABELS[user?.role] || "User";
  const displayHospital = user?.hospitalName || "MedCore";
  const initials = displayName
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const profileHref = user?.role ? PROFILE_BY_ROLE[user.role] : null;

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      setDropdownOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Breadcrumbs segments={segments} />

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-72"
            />
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-hover-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
          </button>

          {/* User menu */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-1 pr-2.5 outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="Account menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-brand-foreground">
                {initials}
              </span>
              <div className="hidden text-left sm:block">
                <p className="max-w-[140px] truncate text-xs font-semibold leading-tight">
                  {displayName}
                </p>
                <p className="max-w-[140px] truncate text-[10px] leading-tight text-muted-foreground">
                  {displayRole}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              {/* User header */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {displayRole}
                  </p>
                </div>
              </div>

              {/* Hospital badge */}
              <div className="px-2 pb-1.5">
                <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">
                    {displayHospital}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Profile — only if role has a page */}
              {profileHref && (
                <DropdownMenuItem asChild>
                  <Link href={profileHref} className="cursor-pointer">
                    <User className="h-4 w-4" />
                    My profile
                  </Link>
                </DropdownMenuItem>
              )}

              {/* Sign out — destructive with loading state */}
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                disabled={loggingOut}
                className={cn("cursor-pointer", loggingOut && "opacity-70")}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {loggingOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/* ══════════ Breadcrumbs ══════════ */

function Breadcrumbs({ segments }) {
  if (!segments.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center gap-2 text-sm sm:flex"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label =
          SEGMENT_LABELS[segment] ||
          segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={href} className="flex items-center gap-2">
            <span className="text-muted-foreground/40">/</span>
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
