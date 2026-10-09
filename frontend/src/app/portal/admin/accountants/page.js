"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Wallet,
  Mail,
  Briefcase,
  Building2,
  Pencil,
  Ban,
  CheckCircle2,
  ShieldCheck,
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
  getAccountants,
  activateAccountant,
  deactivateAccountant,
} from "@/services/accountant.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "EXHAUSTED", label: "Invitation expired" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminAccountantsPage() {
  const [list, setList] = useState([]);
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
      const result = await getAccountants();
      setList(result.data?.items || result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load accountants");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(item) {
    const isActive = item.status === "ACTIVE";
    if (!window.confirm(isActive ? `Deactivate ${item.name}?` : `Activate ${item.name}?`)) return;
    try {
      setActionId(item.id);
      if (isActive) await deactivateAccountant(item.id);
      else await activateAccountant(item.id);
      await load();
      setViewStaff(null);
    } catch (err) {
      setActionError(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  }

  async function handleResend(item) {
    const userId = item.userId || item.id;
    if (!userId) {
      setActionError("Accountant user information is missing.");
      return;
    }
    if (item.invitationStatus !== "EXHAUSTED") return;
    if (item.userStatus === "INVITATION_EXPIRED") {
      setActionError("Max attempts reached. Please create a new accountant account.");
      return;
    }
    try {
      setResendingId(item.id);
      setActionMessage("");
      setActionError("");
      const result = await resendStaffInvitation(userId);
      setActionMessage(result?.message || "Invitation email queued successfully.");
      setList((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, invitationStatus: "PENDING" } : a))
      );
      setViewStaff((prev) =>
        prev && prev.id === item.id ? { ...prev, invitationStatus: "PENDING" } : prev
      );
    } catch (err) {
      setActionError(err.message || "Failed to resend invitation.");
    } finally {
      setResendingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return list.filter((a) => {
      const matchesQuery =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.designation?.toLowerCase().includes(q);

      if (status === "EXHAUSTED") return matchesQuery && a.invitationStatus === "EXHAUSTED";
      if (a.userStatus !== "ACTIVE") return false;
      if (status === "all") return matchesQuery;
      return matchesQuery && a.status === status;
    });
  }, [list, query, status]);

  const counts = useMemo(
    () => ({
      all: list.filter((a) => a.userStatus === "ACTIVE").length,
      ACTIVE: list.filter((a) => a.userStatus === "ACTIVE" && a.status === "ACTIVE").length,
      EXHAUSTED: list.filter((a) => a.invitationStatus === "EXHAUSTED").length,
      INACTIVE: list.filter((a) => a.userStatus === "ACTIVE" && a.status === "INACTIVE").length,
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
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Finance</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Accountants</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage accountants responsible for hospital billing.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/admin/accountants/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add accountant
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
              <p className="text-sm font-semibold">Invitations need attention</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {attentionCount} invitation{attentionCount !== 1 ? "s" : ""} exhausted
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setStatus("EXHAUSTED")}>
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
                    active ? "bg-brand-soft text-brand-soft-foreground" : "bg-muted text-muted-foreground"
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
            <p className="text-sm font-semibold text-destructive">Unable to load accountants</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} accountant{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? (
        <GridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <AccountantCard
              key={item.id}
              item={item}
              onView={() => setViewStaff(item)}
              onResend={() => handleResend(item)}
              resending={resendingId === item.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} status={status} onClear={clearFilters} />
      )}

      {viewStaff && (
        <AccountantModal
          item={viewStaff}
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

function AccountantCard({ item, onView, onResend, resending }) {
  const isUserActive = item.userStatus === "ACTIVE";
  const isActive = isUserActive && item.status === "ACTIVE";
  const isExhausted = item.invitationStatus === "EXHAUSTED";
  const isInvitationExpired = item.userStatus === "INVITATION_EXPIRED";
  const canResend = isExhausted && !isInvitationExpired;

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isExhausted ? "border-destructive/30" : "border-border hover:border-brand/40"
      )}
    >
      <button type="button" onClick={onView} className="flex items-start gap-4 p-5 text-left">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isExhausted
              ? "bg-destructive/10 text-destructive"
              : !isActive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {item.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">{item.name}</h3>
            <StatusBadge
              status={item.status}
              invitationStatus={item.invitationStatus}
              userStatus={item.userStatus}
            />
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {item.designation || "Accountant"}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.email}</span>
          </div>
        </div>
      </button>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3 w-3" />
            <span>Finance</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">#{item.id}</div>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        {canResend ? (
          <Button size="sm" className="flex-1" onClick={onResend} disabled={resending}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", resending && "animate-spin")} />
            {resending ? "Sending..." : "Resend"}
          </Button>
        ) : isInvitationExpired ? (
          <Button size="sm" className="flex-1" asChild>
            <Link href="/portal/admin/accountants/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create new
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
            View
          </Button>
        )}
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/portal/admin/accountants/${item.id}/edit`}>Edit</Link>
        </Button>
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

function AccountantModal({ item, onClose, onToggleStatus, onResend, updating, resending }) {
  const isActive = item.status === "ACTIVE" && item.userStatus === "ACTIVE";
  const isExhausted = item.invitationStatus === "EXHAUSTED";
  const isInvitationPending = item.userStatus === "PENDING_VERIFICATION";
  const isInvitationExpired = item.userStatus === "INVITATION_EXPIRED";
  const canResend = isExhausted && !isInvitationExpired;
  const canToggle = item.userStatus === "ACTIVE" && (item.status === "ACTIVE" || item.status === "INACTIVE");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-soft-foreground">
              {item.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">{item.name}</h2>
              <p className="mt-0.5 text-sm font-medium text-brand">
                {item.designation || "Accountant"}
              </p>
              <div className="mt-1.5">
                <StatusBadge
                  status={item.status}
                  invitationStatus={item.invitationStatus}
                  userStatus={item.userStatus}
                />
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
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
                  {isInvitationPending && !isExhausted ? "Invitation pending" : "Invitation exhausted"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isInvitationPending && !isExhausted
                    ? "Accountant has not logged in yet."
                    : isInvitationExpired
                    ? "Max rounds reached. Create a new accountant account."
                    : "Attempt exhausted automatic retries. You can resend."}
                </p>
              </div>
            </div>
          )}

          <SectionTitle>Contact</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox icon={Mail} label="Email" value={item.email} />
            <InfoBox icon={FileText} label="Accountant ID" value={`#${item.id}`} />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Finance role. Managed by hospital administration.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href={`/portal/admin/accountants/${item.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          {canResend && (
            <Button onClick={onResend} disabled={resending} className="flex-1 sm:flex-none">
              {resending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
              {resending ? "Resending..." : "Resend invitation"}
            </Button>
          )}

          {isInvitationExpired && (
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/portal/admin/accountants/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create new
              </Link>
            </Button>
          )}

          {canToggle && (
            <Button
              variant="outline"
              onClick={() => onToggleStatus(item)}
              disabled={updating}
              className={cn(
                "flex-1 sm:flex-none",
                isActive && "text-destructive hover:bg-destructive/10 hover:text-destructive"
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
    <h3 className={cn("text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
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
  const title = isExhausted ? "No exhausted invitations" : hasFilters ? "No accountants found" : "No accountants yet";
  const desc = isExhausted
    ? "All accountant invitations are in good standing."
    : hasFilters
    ? "Try adjusting your filters."
    : "Add an accountant to start managing hospital billing.";
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {isExhausted ? (
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Wallet className="h-6 w-6 text-muted-foreground" />
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
          <Link href="/portal/admin/accountants/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add accountant
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
        <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted/30" />
      ))}
    </div>
  );
}