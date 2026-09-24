"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  ClipboardList,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Pencil,
  Ban,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getReceptionists,
  activateReceptionist,
  deactivateReceptionist,
  getReceptionistById,
} from "@/services/receptionist.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminReceptionistsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [receptionists, setReceptionists] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    loadReceptionists();
  }, [accessToken]);

  async function loadReceptionists() {
    try {
      setLoading(true);
      setError("");

      const result = await getReceptionists({
        page: 0,
        size: 50,
        sortBy: "createdAt",
        sortDir: "desc",
      });

      setReceptionists(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load receptionists");
    } finally {
      setLoading(false);
    }
  }

  async function handleView(receptionist) {
    try {
      setError("");
      const result = await getReceptionistById(receptionist.id);
      setViewStaff(result.data);
    } catch (err) {
      setError(err.message || "Failed to load receptionist");
    }
  }

  async function handleStatusChange(receptionist) {
    try {
      setActionId(receptionist.id);
      setError("");

      if (receptionist.status === "ACTIVE") {
        await deactivateReceptionist(receptionist.id);
      } else {
        await activateReceptionist(receptionist.id);
      }

      await loadReceptionists();

      if (viewStaff?.id === receptionist.id) {
        const result = await getReceptionistById(receptionist.id);
        setViewStaff(result.data);
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return receptionists.filter((r) => {
      const matchQuery =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.designation?.toLowerCase().includes(q);

      const matchStatus = status === "all" || r.status === status;

      return matchQuery && matchStatus;
    });
  }, [receptionists, query, status]);

  const counts = useMemo(
    () => ({
      all: receptionists.length,
      ACTIVE: receptionists.filter((r) => r.status === "ACTIVE").length,
      INACTIVE: receptionists.filter((r) => r.status === "INACTIVE").length,
    }),
    [receptionists]
  );

  const hasFilters = query.trim() !== "" || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Receptionists
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage front desk staff and receptionist accounts.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/receptionists/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add receptionist
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or designation..."
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

      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Staff status">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
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
          })}
        </nav>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              Unable to load receptionists
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadReceptionists}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} receptionist{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? (
        <GridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onView={() => handleView(staff)}
              loading={actionId === staff.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}

      {viewStaff && (
        <StaffModal
          staff={viewStaff}
          onClose={() => setViewStaff(null)}
          onStatusChange={() => handleStatusChange(viewStaff)}
          loading={actionId === viewStaff.id}
        />
      )}
    </div>
  );
}

function StaffCard({ staff, onView }) {
  const isActive = staff.status === "ACTIVE";

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
          {staff.name?.charAt(0)?.toUpperCase() || "R"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {staff.name}
            </h3>
            <StatusBadge status={staff.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {staff.designation || "Receptionist"}
          </p>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
        </div>
      </button>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Employee ID
            </p>
            <p className="mt-0.5 text-xs font-semibold">#{staff.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hospital
            </p>
            <p className="mt-0.5 text-xs font-semibold">
              #{staff.hospitalId}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
          View
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/receptionists/${staff.id}/edit`}>
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isActive
          ? "bg-brand-soft text-brand-soft-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function StaffModal({ staff, onClose, onStatusChange, loading }) {
  const isActive = staff.status === "ACTIVE";

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
                isActive
                  ? "bg-brand-soft text-brand-soft-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {staff.name?.charAt(0)?.toUpperCase() || "R"}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {staff.name}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {staff.designation || "Receptionist"}
              </p>
              <div className="mt-1.5">
                <StatusBadge status={staff.status} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <SectionTitle>Contact</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox icon={Mail} label="Email" value={staff.email} />
            <InfoBox
              icon={Phone}
              label="Phone"
              value={staff.phone || "Not available"}
            />
          </div>

          <SectionTitle className="mt-6">Employment</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={Briefcase}
              label="Designation"
              value={staff.designation || "Not specified"}
            />
            <InfoBox
              icon={Building2}
              label="Hospital ID"
              value={`#${staff.hospitalId}`}
            />
            <InfoBox
              icon={ClipboardList}
              label="Employee ID"
              value={`#${staff.id}`}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Employment information and account status are managed by
              hospital administration.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href={`/portal/admin/receptionists/${staff.id}/edit`}>
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
            {isActive ? (
              <Ban className="mr-1.5 h-4 w-4" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}
            {loading ? "Updating..." : isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, className }) {
  return (
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </h3>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No receptionists found" : "No receptionists yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters."
          : "Add your first receptionist to get started."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/receptionists/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add receptionist
          </Link>
        </Button>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl border border-border bg-muted/30"
        />
      ))}
    </div>
  );
}