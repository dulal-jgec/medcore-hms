"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  HeartPulse,
  Mail,
  Building2,
  GraduationCap,
  IndianRupee,
  Award,
  Ban,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Clock3,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getNurses,
  activateNurse,
  deactivateNurse,
} from "@/services/nurse.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "EXHAUSTED", label: "Invitation expired" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminNursesPage() {
  const [nurses, setNurses] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const result = await getNurses({
        page: 0,
        size: 50,
        sortBy: "id",
        sortDir: "asc",
      });
      setNurses(result.data?.items || result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load nurses");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(nurse) {
    const next = nurse.status === "ACTIVE" ? "deactivate" : "activate";
    const label = nurse.name || "this nurse";
    if (
      !window.confirm(
        next === "deactivate" ? `Deactivate ${label}?` : `Activate ${label}?`
      )
    )
      return;
    try {
      setActionId(nurse.id);
      if (next === "deactivate") await deactivateNurse(nurse.id);
      else await activateNurse(nurse.id);
      await load();
      setViewStaff(null);
    } catch (err) {
      setActionError(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  }

  async function handleResend(nurse) {
    if (!nurse.userId) {
      setActionError("Nurse user information is missing.");
      return;
    }
    if (nurse.invitationStatus !== "EXHAUSTED") return;
    if (nurse.userStatus === "INVITATION_EXPIRED") {
      setActionError(
        "This invitation reached the max attempts. Please create a new nurse account."
      );
      return;
    }
    try {
      setResendingId(nurse.id);
      setActionMessage("");
      setActionError("");
      const result = await resendStaffInvitation(nurse.userId);
      setActionMessage(
        result?.message || "Invitation email queued successfully."
      );
      setNurses((prev) =>
        prev.map((n) =>
          n.id === nurse.id ? { ...n, invitationStatus: "PENDING" } : n
        )
      );
      setViewStaff((prev) =>
        prev && prev.id === nurse.id
          ? { ...prev, invitationStatus: "PENDING" }
          : prev
      );
    } catch (err) {
      setActionError(err.message || "Failed to resend invitation.");
    } finally {
      setResendingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return nurses.filter((n) => {
      const matchesQuery =
        !q ||
        n.name?.toLowerCase().includes(q) ||
        n.email?.toLowerCase().includes(q) ||
        n.department?.toLowerCase().includes(q) ||
        n.designation?.toLowerCase().includes(q);

      if (status === "EXHAUSTED") {
        return matchesQuery && n.invitationStatus === "EXHAUSTED";
      }
      if (n.userStatus !== "ACTIVE") return false;
      if (status === "all") return matchesQuery;
      return matchesQuery && n.status === status;
    });
  }, [nurses, query, status]);

  const counts = useMemo(
    () => ({
      all: nurses.filter((n) => n.userStatus === "ACTIVE").length,
      ACTIVE: nurses.filter(
        (n) => n.userStatus === "ACTIVE" && n.status === "ACTIVE"
      ).length,
      EXHAUSTED: nurses.filter((n) => n.invitationStatus === "EXHAUSTED")
        .length,
      INACTIVE: nurses.filter(
        (n) => n.userStatus === "ACTIVE" && n.status === "INACTIVE"
      ).length,
    }),
    [nurses]
  );

  const hasFilters = query.trim() !== "" || status !== "all";
  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const attentionCount = counts.EXHAUSTED;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Nurses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage nursing staff, shifts, and credentials.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/nurses/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add nurse
          </Link>
        </Button>
      </div>

      {attentionCount > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                Invitations need attention
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {attentionCount} invitation
                {attentionCount !== 1 ? "s" : ""} exhausted
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus("EXHAUSTED")}
          >
            View exhausted
          </Button>
        </div>
      )}

      {actionMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm text-brand">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or department..."
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
        <nav className="flex gap-6 overflow-x-auto">
          {STATUS_TABS.map(({ id, label }) => {
            const active = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  active
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active
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
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              Unable to load nurses
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} nurse{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? (
        <GridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((nurse) => (
            <NurseCard
              key={nurse.id}
              nurse={nurse}
              onView={() => setViewStaff(nurse)}
              onResend={() => handleResend(nurse)}
              resending={resendingId === nurse.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasFilters={hasFilters}
          status={status}
          onClear={clearFilters}
        />
      )}

      {viewStaff && (
        <NurseModal
          nurse={viewStaff}
          onClose={() => setViewStaff(null)}
          onToggleStatus={handleToggleStatus}
          onResend={() => handleResend(viewStaff)}
          updating={actionId === viewStaff.id}
          resending={resendingId === viewStaff.id}
        />
      )}
    </div>
  );
}

function NurseCard({ nurse, onView, onResend, resending }) {
  const isUserActive = nurse.userStatus === "ACTIVE";
  const isActive = isUserActive && nurse.status === "ACTIVE";
  const isExhausted = nurse.invitationStatus === "EXHAUSTED";
  const isInvitationExpired = nurse.userStatus === "INVITATION_EXPIRED";
  const canResend = isExhausted && !isInvitationExpired;

  const initials = nurse.name?.charAt(0)?.toUpperCase() || "N";
  const hasImage = Boolean(nurse.profileImageUrl);

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isExhausted
          ? "border-destructive/30"
          : "border-border hover:border-brand/40"
      )}
    >
      <button
        type="button"
        onClick={onView}
        className="flex items-start gap-4 p-5 text-left"
      >
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold",
            hasImage
              ? "border border-border bg-muted"
              : isExhausted
              ? "bg-destructive/10 text-destructive"
              : !isActive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={nurse.profileImageUrl}
              alt={nurse.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector("[data-fallback]")) {
                  const span = document.createElement("span");
                  span.dataset.fallback = "true";
                  span.textContent = initials;
                  parent.appendChild(span);
                }
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {nurse.name}
            </h3>
            <StatusBadge
              status={nurse.status}
              invitationStatus={nurse.invitationStatus}
              userStatus={nurse.userStatus}
            />
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {nurse.designation || "Staff Nurse"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {nurse.department || "—"}
            </span>
            <span>·</span>
            <span>{nurse.ward || "—"}</span>
          </div>
          {nurse.email && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{nurse.email}</span>
            </div>
          )}
        </div>
      </button>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Qualification
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold">
              {nurse.qualification || "Not set"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ID
            </p>
            <p className="mt-0.5 text-xs font-semibold">#{nurse.id}</p>
          </div>
        </div>
      </div>

      {/* Single action button — Edit removed */}
      <div className="mt-auto flex gap-2 border-t border-border p-3">
        {canResend ? (
          <Button
            size="sm"
            className="flex-1"
            onClick={onResend}
            disabled={resending}
          >
            <RefreshCw
              className={cn("mr-1.5 h-3.5 w-3.5", resending && "animate-spin")}
            />
            {resending ? "Sending..." : "Resend"}
          </Button>
        ) : isInvitationExpired ? (
          <Button size="sm" className="flex-1" asChild>
            <Link href="/portal/admin/nurses/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create new
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onView}
          >
            View details
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, invitationStatus, userStatus }) {
  if (invitationStatus === "EXHAUSTED") {
    return (
      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        Invitation expired
      </span>
    );
  }
  if (userStatus === "PENDING_VERIFICATION") {
    return (
      <span className="shrink-0 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
        Invitation pending
      </span>
    );
  }
  if (userStatus === "INVITATION_EXPIRED") {
    return (
      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        Invitation expired
      </span>
    );
  }
  const map = {
    ACTIVE: "bg-brand-soft text-brand-soft-foreground",
    INACTIVE: "bg-muted text-muted-foreground",
  };
  const label = { ACTIVE: "Active", INACTIVE: "Inactive" };
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status] || map.INACTIVE
      )}
    >
      {label[status] || "Unknown"}
    </span>
  );
}

function NurseModal({
  nurse,
  onClose,
  onToggleStatus,
  onResend,
  updating,
  resending,
}) {
  const isActive = nurse.status === "ACTIVE" && nurse.userStatus === "ACTIVE";
  const isExhausted = nurse.invitationStatus === "EXHAUSTED";
  const isInvitationPending = nurse.userStatus === "PENDING_VERIFICATION";
  const isInvitationExpired = nurse.userStatus === "INVITATION_EXPIRED";
  const canResend = isExhausted && !isInvitationExpired;
  const canToggle =
    nurse.userStatus === "ACTIVE" &&
    (nurse.status === "ACTIVE" || nurse.status === "INACTIVE");

  const initials = nurse.name?.charAt(0)?.toUpperCase() || "N";
  const hasImage = Boolean(nurse.profileImageUrl);

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
                "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold",
                hasImage
                  ? "border border-border bg-muted"
                  : "bg-brand-soft text-brand-soft-foreground"
              )}
            >
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={nurse.profileImageUrl}
                  alt={nurse.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector("[data-fallback]")) {
                      const span = document.createElement("span");
                      span.dataset.fallback = "true";
                      span.textContent = initials;
                      parent.appendChild(span);
                    }
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {nurse.name}
              </h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {nurse.designation || "Staff Nurse"}
              </p>
              <div className="mt-1.5">
                <StatusBadge
                  status={nurse.status}
                  invitationStatus={nurse.invitationStatus}
                  userStatus={nurse.userStatus}
                />
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
          {(isInvitationPending || isExhausted || isInvitationExpired) && (
            <div
              className={cn(
                "mb-6 flex items-start gap-3 rounded-xl border p-4",
                isInvitationPending && !isExhausted
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : "border-destructive/20 bg-destructive/5"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isInvitationPending && !isExhausted
                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isInvitationPending && !isExhausted ? (
                  <Clock3 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {isInvitationPending && !isExhausted
                    ? "Invitation pending"
                    : "Invitation exhausted"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isInvitationPending && !isExhausted
                    ? "The nurse has not logged in yet. The invitation is being processed."
                    : isInvitationExpired
                    ? "This invitation reached the maximum rounds. Create a new nurse account."
                    : "The current invitation attempt exhausted automatic retries. You can resend."}
                </p>
              </div>
            </div>
          )}

          <SectionTitle>Contact</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox icon={Mail} label="Email" value={nurse.email} />
            <InfoBox icon={FileText} label="Nurse ID" value={`#${nurse.id}`} />
          </div>

          <SectionTitle className="mt-6">Professional</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={GraduationCap}
              label="Qualification"
              value={nurse.qualification}
            />
            <InfoBox
              icon={Building2}
              label="Department"
              value={nurse.department}
            />
            <InfoBox icon={Award} label="Ward" value={nurse.ward} />
            <InfoBox
              icon={IndianRupee}
              label="Designation"
              value={nurse.designation}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials are managed by hospital administration.
            </p>
          </div>
        </div>

        {/* Footer — Edit removed, only Resend / Create new / Toggle */}
        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
          {canResend && (
            <Button
              onClick={onResend}
              disabled={resending}
              className="flex-1 sm:flex-none"
            >
              {resending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-4 w-4" />
              )}
              {resending ? "Resending..." : "Resend invitation"}
            </Button>
          )}

          {isInvitationExpired && (
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/portal/admin/nurses/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create new
              </Link>
            </Button>
          )}

          {canToggle && (
            <Button
              variant="outline"
              onClick={() => onToggleStatus(nurse)}
              disabled={updating}
              className={cn(
                "flex-1 sm:flex-none",
                isActive &&
                  "text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              {updating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : isActive ? (
                <Ban className="mr-1.5 h-4 w-4" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
              )}
              {isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
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

function EmptyState({ hasFilters, status, onClear }) {
  const isExhausted = status === "EXHAUSTED";
  let title = "No nurses yet";
  let desc = "Add your first nurse to get started.";
  if (isExhausted) {
    title = "No exhausted invitations";
    desc = "All nurse invitations are in good standing.";
  } else if (hasFilters) {
    title = "No nurses found";
    desc = "Try adjusting your filters.";
  }
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {isExhausted ? (
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        ) : (
          <HeartPulse className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <p className="mt-5 text-base font-semibold">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
      {hasFilters && !isExhausted ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : !hasFilters && !isExhausted ? (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/nurses/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add nurse
          </Link>
        </Button>
      ) : null}
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