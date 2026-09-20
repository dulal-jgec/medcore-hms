"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ─── Role → nav items ─── */
export const NAV_BY_ROLE = {
  PATIENT: [
    {
      href: "/portal/patient",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
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
    {
      href: "/portal/patient/bills",
      label: "Bills & Payments",
      icon: Wallet,
    },
    {
      href: "/portal/patient/profile",
      label: "My Profile",
      icon: User,
    },
  ],

  DOCTOR: [
    {
      href: "/portal/doctor",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/doctor/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    {
      href: "/portal/doctor/patients",
      label: "My Patients",
      icon: Users,
    },
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
    {
      href: "/portal/doctor/schedule",
      label: "My Schedule",
      icon: Clock,
    },
    {
      href: "/portal/doctor/profile",
      label: "My Profile",
      icon: User,
    },
  ],

  HOSPITAL_ADMIN: [
    {
      href: "/portal/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/admin/doctors",
      label: "Doctors",
      icon: Stethoscope,
    },
    {
      href: "/portal/admin/nurses",
      label: "Nurses",
      icon: HeartPulse,
    },
    {
      href: "/portal/admin/receptionists",
      label: "Receptionists",
      icon: ClipboardList,
    },
    {
      href: "/portal/admin/patients",
      label: "Patients",
      icon: Users,
    },
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
    {
      href: "/portal/admin/billing",
      label: "Billing",
      icon: Wallet,
    },

    // Accountant Management
    {
      href: "/portal/admin/accountants",
      label: "Accountants",
      icon: Users,
    },

    {
      href: "/portal/admin/reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      href: "/portal/admin/settings",
      label: "Hospital Settings",
      icon: Settings,
    },
  ],

  ACCOUNTANT: [
    {
      href: "/portal/accounts",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/accounts/bills",
      label: "All Bills",
      icon: Receipt,
    },
    {
      href: "/portal/accounts/outstanding",
      label: "Outstanding",
      icon: AlertCircle,
    },
    {
      href: "/portal/accounts/payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      href: "/portal/accounts/reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      href: "/portal/accounts/profile",
      label: "My Profile",
      icon: User,
    },
  ],

  RECEPTIONIST: [
    {
      href: "/portal/reception",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/reception/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    {
      href: "/portal/reception/queue",
      label: "Live Queue",
      icon: Clock,
    },
    {
      href: "/portal/reception/patients",
      label: "Patients",
      icon: Users,
    },
    {
      href: "/portal/reception/billing",
      label: "Billing Counter",
      icon: Receipt,
    },
    {
      href: "/portal/reception/profile",
      label: "My Profile",
      icon: User,
    },
  ],

  LAB_TECHNICIAN: [
    {
      href: "/portal/lab",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/lab/orders",
      label: "Lab Orders",
      icon: FlaskConical,
    },
    {
      href: "/portal/lab/samples",
      label: "Samples",
      icon: Microscope,
    },
    {
      href: "/portal/lab/reports",
      label: "Reports",
      icon: FileText,
    },
    {
      href: "/portal/lab/profile",
      label: "My Profile",
      icon: User,
    },
  ],

  NURSE: [
    {
      href: "/portal/nurse",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/portal/nurse/patients",
      label: "My Patients",
      icon: Users,
    },
    {
      href: "/portal/nurse/vitals",
      label: "Record Vitals",
      icon: Activity,
    },
    {
      href: "/portal/nurse/medications",
      label: "Medication Rounds",
      icon: Pill,
    },
    {
      href: "/portal/nurse/tasks",
      label: "My Tasks",
      icon: ClipboardList,
    },
    {
      href: "/portal/nurse/shifts",
      label: "My Shifts",
      icon: Clock,
    },
    {
      href: "/portal/nurse/profile",
      label: "My Profile",
      icon: User,
    },
  ],
};

/* URL slug → role name */
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

/* Detect role from current path */
export function getRoleFromPath(pathname) {
  const match = pathname.match(/^\/portal\/([^/]+)/);
  if (!match) return "PATIENT";
  return SLUG_TO_ROLE[match[1]] || "PATIENT";
}

export function PortalSidebar({ onNavigate }) {
  const pathname = usePathname();
  const role = getRoleFromPath(pathname);
  const items = NAV_BY_ROLE[role] || NAV_BY_ROLE.PATIENT;

  const basePath = `/portal/${pathname.split("/")[2] || "patient"}`;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
            M
          </div>
          <span className="text-base font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "text-muted-foreground hover:bg-hover hover:text-hover-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-3">
        <ul className="space-y-1">
          <li>
            <Link
              href={`${basePath}/settings`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-hover hover:text-hover-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Link>
          </li>
        </ul>

        <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          <div className="flex items-center gap-1.5 text-destructive">
            <Heart className="h-3.5 w-3.5" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">
              Emergency
            </p>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Call +91 90000 00000
          </p>
        </div>
      </div>
    </div>
  );
}
