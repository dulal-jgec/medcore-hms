"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Building2,
  Users,
  BedDouble,
  MapPin,
  Phone,
  Pencil,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_DEPARTMENTS } from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminDepartmentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_DEPARTMENTS.filter((d) => {
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);
      const matchStatus = status === "all" || d.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: ALL_DEPARTMENTS.length,
    ACTIVE: ALL_DEPARTMENTS.filter((d) => d.status === "ACTIVE").length,
    INACTIVE: ALL_DEPARTMENTS.filter((d) => d.status === "INACTIVE").length,
  };

  const totalDoctors = ALL_DEPARTMENTS.reduce((s, d) => s + d.doctorsCount, 0);
  const totalNurses = ALL_DEPARTMENTS.reduce((s, d) => s + d.nursesCount, 0);
  const totalBeds = ALL_DEPARTMENTS.reduce((s, d) => s + d.beds, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hospital Setup
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Departments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ALL_DEPARTMENTS.length} departments across your hospital.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/departments/new">
            
            Add department
          </Link>
        </Button>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatBox icon={Building2} label="Departments" value={counts.all} accent />
        <StatBox icon={Users} label="Total doctors" value={totalDoctors} />
        <StatBox icon={Users} label="Total nurses" value={totalNurses} />
        <StatBox icon={BedDouble} label="Total beds" value={totalBeds} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search department or head name..."
            className="h-11 pl-10"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Department status">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} department{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No departments found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-5">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function DepartmentCard({ dept }) {
  const isActive = dept.status === "ACTIVE";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Building2 className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {dept.name}
            </h3>
            <StatusPill status={dept.status} />
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {dept.description}
          </p>
        </div>
      </div>

      {/* Head doctor */}
      <div className="mx-5 flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand-soft-foreground">
          {dept.head.replace("Dr. ", "").charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Head of Dept
          </p>
          <p className="truncate text-xs font-medium">{dept.head}</p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Doctors
          </p>
          <p className="mt-1 text-sm font-bold">{dept.doctorsCount}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Nurses
          </p>
          <p className="mt-1 text-sm font-bold">{dept.nursesCount}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Beds
          </p>
          <p className="mt-1 text-sm font-bold">{dept.beds}</p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        {dept.floor}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link href={`/portal/admin/departments/${dept.id}`}>
            View
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/departments/${dept.id}/edit`}>
             
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
  };
  const config = map[status] || map.INACTIVE;

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}

function StatBox({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/30 hover:shadow-sm">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}