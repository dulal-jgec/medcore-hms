"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ClipboardList,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Loader2,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  getReceptionists,
  getReceptionistById,
  activateReceptionist,
  deactivateReceptionist,
} from "@/services/receptionist.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminReceptionistsPage() {
  const [receptionists, setReceptionists] =
    useState([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [viewStaff, setViewStaff] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(null);

  useEffect(() => {
    loadReceptionists();
  }, []);

  async function loadReceptionists() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getReceptionists({
          page: 0,
          size: 100,
          sortBy: "createdAt",
          sortDir: "desc",
        });

      setReceptionists(
        result.data?.items || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load receptionists."
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query
      .toLowerCase()
      .trim();

    return receptionists.filter(
      (receptionist) => {
        const matchQuery =
          !q ||
          receptionist.name
            ?.toLowerCase()
            .includes(q) ||
          receptionist.email
            ?.toLowerCase()
            .includes(q) ||
          receptionist.designation
            ?.toLowerCase()
            .includes(q);

        const matchStatus =
          status === "all" ||
          receptionist.status === status;

        return (
          matchQuery &&
          matchStatus
        );
      }
    );
  }, [
    receptionists,
    query,
    status,
  ]);

  const counts = {
    all: receptionists.length,

    ACTIVE: receptionists.filter(
      (r) => r.status === "ACTIVE"
    ).length,

    INACTIVE: receptionists.filter(
      (r) => r.status === "INACTIVE"
    ).length,
  };

  const hasFilters =
    query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  async function handleStatusChange(
    receptionist
  ) {
    try {
      setActionLoading(
        receptionist.id
      );

      if (
        receptionist.status ===
        "ACTIVE"
      ) {
        await deactivateReceptionist(
          receptionist.id
        );
      } else {
        await activateReceptionist(
          receptionist.id
        );
      }

      await loadReceptionists();

      if (
        viewStaff?.id ===
        receptionist.id
      ) {
        const result =
          await getReceptionistById(
            receptionist.id
          );

        setViewStaff(result.data);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to update receptionist status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleView(
    receptionistId
  ) {
    try {
      setError("");

      const result =
        await getReceptionistById(
          receptionistId
        );

      setViewStaff(result.data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load receptionist."
      );
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
            Receptionists
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage front desk staff and
            receptionist accounts.
          </p>

        </div>

        <Button asChild>
          <Link href="/portal/admin/receptionists/new">
            Add receptionist
          </Link>
        </Button>

      </div>

      {/* Error */}

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">

          <p className="text-sm text-destructive">
            {error}
          </p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setError("")
            }
          >
            <X className="h-4 w-4" />
          </Button>

        </div>
      )}

      {/* Filters */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">

          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by name, email, or designation..."
            className="h-11 pl-10"
          />

        </div>

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

        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Staff status"
        >

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
                    "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                    isActive
                      ? "text-foreground after:bg-brand"
                      : "text-muted-foreground after:bg-transparent hover:text-foreground"
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
        {filtered.length} receptionist
        {filtered.length !== 1
          ? "s"
          : ""}{" "}
        found
      </p>

      {/* Loading */}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <Loader2 className="h-4 w-4 animate-spin" />

            Loading receptionists...

          </div>

        </div>
      ) : filtered.length > 0 ? (

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {filtered.map(
            (staff) => (
              <StaffCard
                key={staff.id}
                staff={staff}
                onView={() =>
                  handleView(
                    staff.id
                  )
                }
                onStatusChange={() =>
                  handleStatusChange(
                    staff
                  )
                }
                loading={
                  actionLoading ===
                  staff.id
                }
              />
            )
          )}

        </div>

      ) : (

        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">

            <ClipboardList className="h-6 w-6 text-muted-foreground" />

          </div>

          <p className="mt-5 text-base font-semibold">
            No receptionists found
          </p>

          <p className="mt-1.5 text-sm text-muted-foreground">
            Try adjusting your filters
            or add a new receptionist.
          </p>

          <Button
            asChild
            className="mt-5"
          >
            <Link href="/portal/admin/receptionists/new">
              Add receptionist
            </Link>
          </Button>

        </div>
      )}

      {viewStaff && (
        <StaffModal
          staff={viewStaff}
          onClose={() =>
            setViewStaff(null)
          }
          onStatusChange={() =>
            handleStatusChange(
              viewStaff
            )
          }
          loading={
            actionLoading ===
            viewStaff.id
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   STAFF CARD
   ========================================================= */

function StaffCard({
  staff,
  onView,
  onStatusChange,
  loading,
}) {
  const isActive =
    staff.status === "ACTIVE";

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
          {staff.name
            ?.charAt(0)
            ?.toUpperCase() || "R"}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <h3 className="truncate text-base font-semibold tracking-tight">
              {staff.name}
            </h3>

            <StatusBadge
              status={staff.status}
            />

          </div>

          <p className="mt-1 text-xs font-medium text-brand">
            {staff.designation ||
              "Receptionist"}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">

            <Mail className="h-3 w-3" />

            <span className="truncate">
              {staff.email}
            </span>

          </div>

        </div>

      </button>

      <div className="border-t border-border bg-muted/20 p-3">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Receptionist ID
            </p>

            <p className="mt-1 text-xs font-semibold">
              #{staff.id}
            </p>

          </div>

          <div className="text-right">

            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hospital
            </p>

            <p className="mt-1 text-xs font-semibold">
              #{staff.hospitalId}
            </p>

          </div>

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
            href={`/portal/admin/receptionists/${staff.id}/edit`}
          >
            Edit
          </Link>
        </Button>

      </div>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
   ========================================================= */

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

/* =========================================================
   STAFF MODAL
   ========================================================= */

function StaffModal({
  staff,
  onClose,
  onStatusChange,
  loading,
}) {
  const isActive =
    staff.status === "ACTIVE";

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
              {staff.name
                ?.charAt(0)
                ?.toUpperCase() || "R"}
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-lg font-bold tracking-tight">
                {staff.name}
              </h2>

              <p className="mt-0.5 text-sm font-medium text-brand">
                {staff.designation ||
                  "Receptionist"}
              </p>

              <div className="mt-1.5">
                <StatusBadge
                  status={staff.status}
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

        {/* Body */}

        <div className="p-6">

          <section>

            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <InfoBox
                icon={Mail}
                label="Email"
                value={staff.email}
              />

              <InfoBox
                icon={Phone}
                label="Phone"
                value={
                  staff.phone ||
                  "Not available"
                }
              />

            </div>

          </section>

          <section className="mt-6">

            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Employment
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

              <InfoBox
                icon={Briefcase}
                label="Designation"
                value={
                  staff.designation ||
                  "Not specified"
                }
              />

              <InfoBox
                icon={Building2}
                label="Hospital ID"
                value={`#${staff.hospitalId}`}
              />

              <InfoBox
                icon={Calendar}
                label="Receptionist ID"
                value={`#${staff.id}`}
              />

            </div>

          </section>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">

            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-5 text-muted-foreground">
              Account status and employment
              information are managed by
              hospital administration.
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border bg-card px-6 py-4">

          <Button
            variant="outline"
            asChild
            className="flex-1 sm:flex-none"
          >
            <Link
              href={`/portal/admin/receptionists/${staff.id}/edit`}
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          <Button
            variant="outline"
            disabled={loading}
            onClick={onStatusChange}
            className={cn(
              "flex-1 sm:flex-none",
              isActive &&
                "text-destructive hover:bg-destructive/10 hover:text-destructive"
            )}
          >

            {loading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : isActive ? (
              <Ban className="mr-1.5 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}

            {isActive
              ? "Deactivate"
              : "Activate"}

          </Button>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
   ========================================================= */

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