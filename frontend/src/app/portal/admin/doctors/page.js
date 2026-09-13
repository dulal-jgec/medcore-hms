"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Stethoscope,
  Users,
  AlertCircle,
  ChevronRight,
  Star,
  Mail,
  Phone,
  Award,
  Building2,
  IndianRupee,
  Calendar,
  Pencil,
  Ban,
  CheckCircle2,
  GraduationCap,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_DOCTORS, DEPARTMENTS_LIST } from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "SUSPENDED", label: "Suspended" },
];

export default function AdminDoctorsPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [viewDoctor, setViewDoctor] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_DOCTORS.filter((d) => {
      const matchQuery =
        !q ||
        d.fullName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q);
      const matchDept = dept === "all" || d.departmentId === dept;
      const matchStatus = status === "all" || d.status === status;
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
    all: ALL_DOCTORS.length,
    ACTIVE: ALL_DOCTORS.filter((d) => d.status === "ACTIVE").length,
    INACTIVE: ALL_DOCTORS.filter((d) => d.status === "INACTIVE").length,
    SUSPENDED: ALL_DOCTORS.filter((d) => d.status === "SUSPENDED").length,
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
            Doctors
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hospital's medical staff and their credentials.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/doctors/new">
            
            Add doctor
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
            placeholder="Search by name, specialization, or email..."
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Doctor status">
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
        {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onView={() => setViewDoctor(doctor)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Stethoscope className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No doctors found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters or add a new doctor.
            </p>
            <Button asChild className="mt-5">
              <Link href="/portal/admin/doctors/new">
                
                Add doctor
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* View/Edit modal */}
      {viewDoctor && (
        <DoctorModal
          doctor={viewDoctor}
          onClose={() => setViewDoctor(null)}
        />
      )}
    </div>
  );
}

/* ══════════ Doctor Card ══════════ */

function DoctorCard({ doctor, onView }) {
  const isActive = doctor.status === "ACTIVE";
  const isSuspended = doctor.status === "SUSPENDED";

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isSuspended
          ? "border-destructive/30"
          : "border-border hover:border-brand/40"
      )}
    >
      {/* Top section */}
      <button
        type="button"
        onClick={onView}
        className="flex items-start gap-4 p-5 text-left"
      >
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isSuspended
              ? "bg-destructive/10 text-destructive"
              : !isActive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {doctor.fullName.replace("Dr. ", "").charAt(0)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {doctor.fullName}
            </h3>
            <StatusBadge status={doctor.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {doctor.specialization}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {doctor.department}
            </span>
            <span>·</span>
            <span>{doctor.experienceYears} yrs exp</span>
          </div>
        </div>
      </button>

      {/* Meta strip */}
      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Fee
          </p>
          <p className="mt-1 text-xs font-semibold">₹{doctor.consultationFee}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Rating
          </p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-highlight text-highlight" />
            {doctor.rating}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onView}
        >
          View
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/doctors/${doctor.id}/edit`}>Edit</Link>
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

/* ══════════ Doctor View Modal ══════════ */

function DoctorModal({ doctor, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                doctor.status === "ACTIVE"
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {doctor.fullName.replace("Dr. ", "").charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {doctor.fullName}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {doctor.specialization}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={doctor.status} />
                <span className="text-xs text-muted-foreground">
                  {doctor.department}
                </span>
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

        {/* Content */}
        <div className="p-6">
          {/* Contact */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoBox icon={Mail} label="Email" value={doctor.email} />
              <InfoBox icon={Phone} label="Phone" value={doctor.phone} />
            </div>
          </section>

          {/* Professional */}
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Professional
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoBox
                icon={GraduationCap}
                label="Qualification"
                value={doctor.qualification}
              />
              <InfoBox
                icon={Award}
                label="Experience"
                value={`${doctor.experienceYears} years`}
              />
              <InfoBox
                icon={IndianRupee}
                label="Consultation fee"
                value={`₹${doctor.consultationFee}`}
              />
              <InfoBox
                icon={FileText}
                label="Registration no."
                value={doctor.registrationNo}
              />
              <InfoBox
                icon={Calendar}
                label="Joined on"
                value={doctor.joinedOn}
              />
              <InfoBox
                icon={Users}
                label="Patients treated"
                value={doctor.patientsTreated.toLocaleString("en-IN")}
              />
            </div>
          </section>

          {/* Read-only notice */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials like specialization, qualification,
              registration number, and experience are managed by hospital
              administration. Doctors cannot edit these fields themselves.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit details
          </Button>
          {doctor.status === "ACTIVE" ? (
            <Button variant="outline" className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive">
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