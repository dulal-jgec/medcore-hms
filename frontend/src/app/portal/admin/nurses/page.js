"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  HeartPulse,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  FileText,
  ShieldCheck,
  Pencil,
  Ban,
  CheckCircle2,
  Loader2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import {
  getNurses,
  activateNurse,
  deactivateNurse,
} from "@/services/nurse.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminNursesPage() {
  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const [nurses, setNurses] = useState([]);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");

  const [viewNurse, setViewNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    loadNurses();
  }, [accessToken]);

  async function loadNurses() {
    try {
      setLoading(true);
      setError("");

      const result = await getNurses(accessToken);

      setNurses(result.data || []);
    } catch (error) {
      setError(
        error.message || "Failed to load nurses."
      );
    } finally {
      setLoading(false);
    }
  }

  const departments = useMemo(() => {
    return [
      ...new Set(
        nurses
          .map((nurse) => nurse.department)
          .filter(Boolean)
      ),
    ];
  }, [nurses]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return nurses.filter((nurse) => {
      const matchQuery =
        !q ||
        nurse.name?.toLowerCase().includes(q) ||
        nurse.email?.toLowerCase().includes(q) ||
        nurse.phone?.includes(q);

      const matchDept =
        dept === "all" ||
        nurse.department === dept;

      const matchStatus =
        status === "all" ||
        nurse.status === status;

      return (
        matchQuery &&
        matchDept &&
        matchStatus
      );
    });
  }, [nurses, query, dept, status]);

  const counts = {
    all: nurses.length,
    ACTIVE: nurses.filter(
      (nurse) => nurse.status === "ACTIVE"
    ).length,
    INACTIVE: nurses.filter(
      (nurse) => nurse.status === "INACTIVE"
    ).length,
  };

  const hasFilters =
    query ||
    dept !== "all" ||
    status !== "all";

  function clearFilters() {
    setQuery("");
    setDept("all");
    setStatus("all");
  }

  async function handleStatusChange(nurse) {
    try {
      setActionLoading(true);

      if (nurse.status === "ACTIVE") {
        await deactivateNurse(
          accessToken,
          nurse.id
        );
      } else {
        await activateNurse(
          accessToken,
          nurse.id
        );
      }

      await loadNurses();

      setViewNurse(null);
    } catch (error) {
      alert(
        error.message ||
          "Failed to update nurse status."
      );
    } finally {
      setActionLoading(false);
    }
  }

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
            <Plus className="mr-2 h-4 w-4" />
            Add nurse
          </Link>
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by name, email or phone..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={dept}
          onChange={(e) =>
            setDept(e.target.value)
          }
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
        >
          <option value="all">
            All departments
          </option>

          {departments.map((department) => (
            <option
              key={department}
              value={department}
            >
              {department}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto">
          {STATUS_TABS.map(
            ({ id, label }) => {
              const isActive =
                status === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setStatus(id)
                  }
                  className={cn(
                    "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
                    isActive
                      ? "text-foreground after:bg-brand"
                      : "text-muted-foreground after:bg-transparent"
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
            }
          )}
        </nav>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} nurse
        {filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : filtered.length > 0 ? (

        /* Grid */
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((nurse) => (
            <NurseCard
              key={nurse.id}
              nurse={nurse}
              onView={() =>
                setViewNurse(nurse)
              }
            />
          ))}
        </div>

      ) : (

        /* Empty */
        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <HeartPulse className="h-6 w-6 text-muted-foreground" />
          </div>

          <p className="mt-5 text-base font-semibold">
            No nurses found
          </p>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Try adjusting your filters or add a new nurse.
          </p>

          <Button
            asChild
            className="mt-5"
          >
            <Link href="/portal/admin/nurses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add nurse
            </Link>
          </Button>
        </div>
      )}

      {viewNurse && (
        <NurseModal
          nurse={viewNurse}
          onClose={() =>
            setViewNurse(null)
          }
          onStatusChange={() =>
            handleStatusChange(viewNurse)
          }
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}


 

function NurseCard({ nurse, onView }) {
  const isActive =
    nurse.status === "ACTIVE";

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
          {nurse.name
            ?.charAt(0)
            ?.toUpperCase() || (
            <UserRound className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {nurse.name}
            </h3>

            <StatusBadge
              status={nurse.status}
            />
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">
              {nurse.department ||
                "Department not assigned"}
            </span>
          </div>

          {nurse.designation && (
            <p className="mt-1 text-xs text-muted-foreground">
              {nurse.designation}
            </p>
          )}
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">

        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Qualification
          </p>

          <p className="mt-1 truncate px-1 text-xs font-semibold">
            {nurse.qualification ||
              "Not specified"}
          </p>
        </div>

        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            License No.
          </p>

          <p className="mt-1 truncate px-1 text-xs font-semibold">
            {nurse.licenseNumber ||
              "Not specified"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">

        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onView}
        >
          View
        </Button>

        <Button
          size="sm"
          className="flex-1"
          asChild
        >
          <Link
            href={`/portal/admin/nurses/${nurse.id}/edit`}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>

      </div>
    </div>
  );
}


/* =====================================================
   STATUS
===================================================== */

function StatusBadge({ status }) {
  const isActive =
    status === "ACTIVE";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isActive
          ? "bg-brand-soft text-brand-soft-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isActive
        ? "Active"
        : "Inactive"}
    </span>
  );
}


 

function NurseModal({
  nurse,
  onClose,
  onStatusChange,
  actionLoading,
}) {
  const isActive =
    nurse.status === "ACTIVE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">

          <div className="flex items-start gap-4">

            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                isActive
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {nurse.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-lg font-bold tracking-tight">
                {nurse.name}
              </h2>

              <p className="mt-0.5 text-sm font-medium text-brand">
                {nurse.designation ||
                  "Staff Nurse"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {nurse.department ||
                  "Department not assigned"}
              </p>

              <div className="mt-2">
                <StatusBadge
                  status={nurse.status}
                />
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

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <InfoBox
                icon={Mail}
                label="Email"
                value={nurse.email}
              />

              <InfoBox
                icon={Phone}
                label="Phone"
                value={nurse.phone}
              />

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
                value={
                  nurse.department ||
                  "Not assigned"
                }
              />

              <InfoBox
                icon={GraduationCap}
                label="Qualification"
                value={
                  nurse.qualification ||
                  "Not specified"
                }
              />

              <InfoBox
                icon={FileText}
                label="License No."
                value={
                  nurse.licenseNumber ||
                  "Not specified"
                }
              />

              <InfoBox
                icon={ShieldCheck}
                label="Designation"
                value={
                  nurse.designation ||
                  "Not specified"
                }
              />

              <InfoBox
                icon={HeartPulse}
                label="Ward"
                value={
                  nurse.ward ||
                  "Not assigned"
                }
              />

            </div>
          </section>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-5 text-muted-foreground">
              Nurse credentials and hospital
              assignment are managed by hospital
              administration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-card px-6 py-4">

          <Button
            variant="outline"
            asChild
          >
            <Link
              href={`/portal/admin/nurses/${nurse.id}/edit`}
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          <Button
            variant="outline"
            disabled={actionLoading}
            onClick={onStatusChange}
            className={
              isActive
                ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                : ""
            }
          >
            {actionLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : isActive ? (
              <Ban className="mr-1.5 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}

            {isActive
              ? "Deactivate"
              : "Reactivate"}
          </Button>

        </div>
      </div>
    </div>
  );
}


 

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">

      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p className="mt-1 text-sm font-medium leading-5">
        {value}
      </p>

    </div>
  );
}