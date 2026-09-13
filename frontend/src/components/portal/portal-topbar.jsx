"use client";

import { usePathname } from "next/navigation";
import { Menu, Bell, Search, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PATIENT } from "@/lib/patient-mock-data";
import { DOCTOR_PROFILE } from "@/lib/doctor-mock-data";

const ROLE_LABELS = {
  patient: "Patient",
  doctor: "Doctor",
  admin: "Hospital Admin",
  nurse: "Nurse",
  reception: "Receptionist",
  lab: "Lab Technician",
  pharmacy: "Pharmacist",
  accounts: "Accountant",
};

export function PortalTopbar({ onOpenSidebar }) {
  const pathname = usePathname();
  const slug = pathname.split("/")[2] || "patient";

  const user = slug === "doctor" ? DOCTOR_PROFILE : PATIENT;
  const roleLabel = ROLE_LABELS[slug] || "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden flex-1 md:block">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
        </Button>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-soft-foreground">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight">
              {user.fullName}
            </p>
            <p className="text-[10px] leading-tight text-muted-foreground">
              {roleLabel}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}