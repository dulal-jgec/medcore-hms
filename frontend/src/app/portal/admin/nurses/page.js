"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  HeartPulse,
  AlertCircle,
  Star,
  Mail,
  Phone,
  Award,
  Building2,
  Calendar,
  Pencil,
  Ban,
  CheckCircle2,
  GraduationCap,
  FileText,
  ShieldCheck,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_NURSES, DEPARTMENTS_LIST } from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminNursesPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [viewNurse, setViewNurse] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_NURSES.filter((n) => {
      const matchQuery =
        !q ||
        n.fullName.toLowerCase().includes(q) ||
        n.email.toLowerCase().includes(q);
      const matchDept = dept === "all" || n.departmentId === dept;
      const matchStatus = status === "all" || n.status === status;
      return matchQuery && matchDept && matchStatus;
    });
  }, [query, dept, status]);

  const hasFilters = query || dept !== "all" || status !== "all";

  function clearFilters() {
    setQuery("");
    setDept("all");
    setStatus("all");
  }

  const counts = {
    all: ALL_NURSES.length,
    ACTIVE: ALL_NURSES.filter((n) => n.status === "ACTIVE").length,
    INACTIVE: ALL_NURSES.filter((n) => n.status === "INACTIVE").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Nurses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hospital's nursing staff.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/nurses/new">
             
            Add nurse
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS_LIST.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Nurse status">
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
        {filtered.length} nurse{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((nurse) => (
              <NurseCard
                key={nurse.id}
                nurse={nurse}
                onView={() => setViewNurse(nurse)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <HeartPulse className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No nurses found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters or add a new nurse.
            </p>
            <Button asChild className="mt-5">
              <Link href="/portal/admin/nurses/new">
                 
                Add nurse
              </Link>
            </Button>
          </div>
        )}
      </div>

      {viewNurse && (
        <NurseModal nurse={viewNurse} onClose={() => setViewNurse(null)} />
      )}
    </div>
  );
}

/* ══════════ Nurse Card ══════════ */

function NurseCard({ nurse, onView }) {
  const isActive = nurse.status === "ACTIVE";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <button
        type="button"
        onClick={onView}
        className="flex items-start gap-4 p-5 text-left"
      >
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {nurse.fullName.charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {nurse.fullName}
            </h3>
            <StatusBadge status={nurse.status} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {nurse.department}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium text-brand">{nurse.shift} shift</span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Qualification
          </p>
          <p className="mt-1 truncate px-1 text-xs font-semibold">
            {nurse.qualification.split(",")[0]}
          </p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Reg. No
          </p>
          <p className="mt-1 truncate px-1 text-xs font-semibold">
            {nurse.registrationNo}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
          View
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/nurses/${nurse.id}/edit`}>Edit</Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
    SUSPENDED: {
      label: "Suspended",
      class: "bg-destructive/10 text-destructive",
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

/* ══════════ Nurse Modal ══════════ */

function NurseModal({ nurse, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                nurse.status === "ACTIVE"
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {nurse.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {nurse.fullName}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {nurse.department} · {nurse.shift} shift
              </p>
              <div className="mt-1.5">
                <StatusBadge status={nurse.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoBox icon={Mail} label="Email" value={nurse.email} />
              <InfoBox icon={Phone} label="Phone" value={nurse.phone} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Professional
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={Building2}
                label="Department"
                value={nurse.department}
              />
              <InfoBox icon={Clock} label="Shift" value={nurse.shift} />
              <InfoBox
                icon={GraduationCap}
                label="Qualification"
                value={nurse.qualification}
              />
              <InfoBox
                icon={FileText}
                label="Registration no."
                value={nurse.registrationNo}
              />
              <InfoBox
                icon={Calendar}
                label="Joined on"
                value={nurse.joinedOn}
              />
              <InfoBox icon={Award} label="Gender" value={nurse.gender} />
            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Nursing credentials are managed by hospital administration.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit details
          </Button>
          {nurse.status === "ACTIVE" ? (
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
            >
              <Ban className="mr-1.5 h-4 w-4" />
              Suspend
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 sm:flex-none">
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Reactivate
            </Button>
          )}
          <Button className="ml-auto flex-1 sm:flex-none">Save changes</Button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium leading-5">{value}</p>
    </div>
  );
}