"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Pill,
  Wallet,
  User,
  Settings,
  LogOut,
  Heart,
  Users,
  ClipboardList,
  Clock,
  Stethoscope,
  HeartPulse,
  Building2,
  BarChart3,
  Receipt,
  CreditCard,
  AlertCircle,
  FlaskConical,
  Microscope,
  Activity,
  Images,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export const NAV_BY_ROLE = {
  PATIENT: [
    { href: "/portal/patient", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/portal/patient/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    {
      href: "/portal/patient/prescriptions",
      label: "Prescriptions",
      icon: Pill,
    },
    {
      href: "/portal/patient/lab-reports",
      label: "Lab Reports",
      icon: FlaskConical,
    },
    { href: "/portal/patient/bills", label: "Bills & Payments", icon: Wallet },
    { href: "/portal/patient/profile", label: "My Profile", icon: User },
  ],
  DOCTOR: [
    { href: "/portal/doctor", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/portal/doctor/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    { href: "/portal/doctor/patients", label: "My Patients", icon: Users },
    {
      href: "/portal/doctor/prescriptions",
      label: "Prescriptions",
      icon: Pill,
    },
    {
      href: "/portal/doctor/lab-reports",
      label: "Lab Reports",
      icon: FlaskConical,
    },
    { href: "/portal/doctor/schedule", label: "My Schedule", icon: Clock },
    { href: "/portal/doctor/profile", label: "My Profile", icon: User },
  ],
  HOSPITAL_ADMIN: [
    { href: "/portal/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/admin/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/portal/admin/nurses", label: "Nurses", icon: HeartPulse },
    {
      href: "/portal/admin/receptionists",
      label: "Receptionists",
      icon: ClipboardList,
    },
    { href: "/portal/admin/accountants", label: "Accountants", icon: Users },
    { href: "/portal/admin/patients", label: "Patients", icon: Users },
    {
      href: "/portal/admin/departments",
      label: "Departments",
      icon: Building2,
    },
    {
      href: "/portal/admin/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    { href: "/portal/admin/billing", label: "Billing", icon: Wallet },
    { href: "/portal/admin/gallery", label: "Gallery", icon: Images },
    { href: "/portal/admin/reports", label: "Reports", icon: BarChart3 },
    {
      href: "/portal/admin/settings",
      label: "Hospital Settings",
      icon: Settings,
    },
  ],
  ACCOUNTANT: [
    { href: "/portal/accounts", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/accounts/bills", label: "All Bills", icon: Receipt },
    {
      href: "/portal/accounts/outstanding",
      label: "Outstanding",
      icon: AlertCircle,
    },
    { href: "/portal/accounts/payments", label: "Payments", icon: CreditCard },
    { href: "/portal/accounts/reports", label: "Reports", icon: BarChart3 },
    { href: "/portal/accounts/profile", label: "My Profile", icon: User },
  ],
  RECEPTIONIST: [
    { href: "/portal/reception", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/portal/reception/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    { href: "/portal/reception/queue", label: "Live Queue", icon: Clock },
    { href: "/portal/reception/patients", label: "Patients", icon: Users },
    {
      href: "/portal/reception/billing",
      label: "Billing Counter",
      icon: Receipt,
    },
    { href: "/portal/reception/profile", label: "My Profile", icon: User },
  ],
  LAB_TECHNICIAN: [
    { href: "/portal/lab", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/lab/orders", label: "Lab Orders", icon: FlaskConical },
    { href: "/portal/lab/samples", label: "Samples", icon: Microscope },
    { href: "/portal/lab/reports", label: "Reports", icon: FileText },
    { href: "/portal/lab/profile", label: "My Profile", icon: User },
  ],
  NURSE: [
    { href: "/portal/nurse", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/nurse/patients", label: "My Patients", icon: Users },
    { href: "/portal/nurse/vitals", label: "Record Vitals", icon: Activity },
    {
      href: "/portal/nurse/medications",
      label: "Medication Rounds",
      icon: Pill,
    },
    { href: "/portal/nurse/tasks", label: "My Tasks", icon: ClipboardList },
    { href: "/portal/nurse/shifts", label: "My Shifts", icon: Clock },
    { href: "/portal/nurse/profile", label: "My Profile", icon: User },
  ],
};

const SLUG_TO_ROLE = {
  patient: "PATIENT",
  doctor: "DOCTOR",
  admin: "HOSPITAL_ADMIN",
  nurse: "NURSE",
  reception: "RECEPTIONIST",
  lab: "LAB_TECHNICIAN",
  pharmacy: "PHARMACIST",
  accounts: "ACCOUNTANT",
};

const ROLE_LABELS = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  HOSPITAL_ADMIN: "Hospital Admin",
  ACCOUNTANT: "Accountant",
  RECEPTIONIST: "Receptionist",
  LAB_TECHNICIAN: "Lab Technician",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  SUPER_ADMIN: "Super Admin",
};

export function getRoleFromPath(pathname) {
  const match = pathname.match(/^\/portal\/([^/]+)/);
  if (!match) return "PATIENT";
  return SLUG_TO_ROLE[match[1]] || "PATIENT";
}

export function PortalSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const role = getRoleFromPath(pathname);
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.PATIENT;
  const basePath = `/portal/${pathname.split("/")[2] || "patient"}`;

  const displayName = user?.fullName || "Account";
  const displayRole = ROLE_LABELS[user?.role] || ROLE_LABELS[role] || "User";
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

      {/* Nav — scrolls only if it must */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== basePath && pathname.startsWith(href));

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-hover-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-brand"
                        : "text-muted-foreground group-hover:text-hover-foreground",
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
