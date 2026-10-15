"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  ClipboardList,
  Mail,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getReceptionists } from "@/services/receptionist.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "EXHAUSTED", label: "Invitation expired" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminReceptionistsPage() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingId, setResendingId] = useState(null);
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
      const result = await getReceptionists({
        page: 0,
        size: 50,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      setList(
        result.data?.items || result.data?.content || result.data || []
      );
    } catch (err) {
      setError(err.message || "Failed to load receptionists");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(item) {
    const userId = item.userId || item.id;
    if (!userId) {
      setActionError("Receptionist user information is missing.");
      return;
    }
    if (item.invitationStatus !== "EXHAUSTED") return;
    if (item.userStatus === "INVITATION_EXPIRED") {
      setActionError(
        "Max attempts reached. Please create a new receptionist account."
      );
      return;
    }
    try {
      setResendingId(item.id);
      setActionMessage("");
      setActionError("");
      const result = await resendStaffInvitation(userId);
      setActionMessage(
        result?.message || "Invitation email queued successfully."
      );
      setList((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, invitationStatus: "PENDING" } : r
        )
      );
    } catch (err) {
      setActionError(err.message || "Failed to resend invitation.");
    } finally {
      setResendingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return list.filter((r) => {
      const matchesQuery =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.designation?.toLowerCase().includes(q);

      if (status === "EXHAUSTED")
        return matchesQuery && r.invitationStatus === "EXHAUSTED";
      if (r.userStatus !== "ACTIVE") return false;
      if (status === "all") return matchesQuery;
      return matchesQuery && r.status === status;
    });
  }, [list, query, status]);

  const counts = useMemo(
    () => ({
      all: list.filter((r) => r.userStatus === "ACTIVE").length,
      ACTIVE: list.filter(
        (r) => r.userStatus === "ACTIVE" && r.status === "ACTIVE"
      ).length,
      EXHAUSTED: list.filter((r) => r.invitationStatus === "EXHAUSTED")
        .length,
      INACTIVE: list.filter(
        (r) => r.userStatus === "ACTIVE" && r.status === "INACTIVE"
      ).length,
    }),
    [list]
  );

  const hasFilters = query.trim() !== "" || status !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
  };
  const attentionCount = counts.EXHAUSTED;

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
              Unable to load receptionists
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
          {filtered.length} receptionist
          {filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? (
        <GridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <StaffCard
              key={item.id}
              item={item}
              onResend={() => handleResend(item)}
              resending={resendingId === item.id}
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
    </div>
  );
}

function StaffCard({ item, onResend, resending }) {
  const isUserActive = item.userStatus === "ACTIVE";
  const isActive = isUserActive && item.status === "ACTIVE";
  const isExhausted = item.invitationStatus === "EXHAUSTED";
  const isInvitationExpired = item.userStatus === "INVITATION_EXPIRED";
  const canResend = isExhausted && !isInvitationExpired;

  const initials = item.name?.charAt(0)?.toUpperCase() || "R";
  const hasImage = Boolean(item.profileImageUrl);

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isExhausted
          ? "border-destructive/30"
          : "border-border hover:border-brand/40"
      )}
    >
      <Link
        href={`/portal/admin/receptionists/${item.id}`}
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
              src={item.profileImageUrl}
              alt={item.name}
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
              {item.name}
            </h3>
            <StatusBadge
              status={item.status}
              invitationStatus={item.invitationStatus}
              userStatus={item.userStatus}
            />
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {item.designation || "Receptionist"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.email}</span>
          </div>
        </div>
      </Link>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Employee ID
            </p>
            <p className="mt-0.5 text-xs font-semibold">#{item.id}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Hospital
            </p>
            <p className="mt-0.5 text-xs font-semibold">
              #{item.hospitalId}
            </p>
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
              className={cn(
                "mr-1.5 h-3.5 w-3.5",
                resending && "animate-spin"
              )}
            />
            {resending ? "Sending..." : "Resend"}
          </Button>
        ) : isInvitationExpired ? (
          <Button size="sm" className="flex-1" asChild>
            <Link href="/portal/admin/receptionists/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create new
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/portal/admin/receptionists/${item.id}`}>
              View details
            </Link>
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

function EmptyState({ hasFilters, status, onClear }) {
  const isExhausted = status === "EXHAUSTED";
  const title = isExhausted
    ? "No exhausted invitations"
    : hasFilters
    ? "No receptionists found"
    : "No receptionists yet";
  const desc = isExhausted
    ? "All receptionist invitations are in good standing."
    : hasFilters
    ? "Try adjusting your filters."
    : "Add your first receptionist to get started.";
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {isExhausted ? (
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        ) : (
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
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
          <Link href="/portal/admin/receptionists/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add receptionist
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