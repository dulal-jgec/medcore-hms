"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Wallet,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  UserX,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getAccountants,
  activateAccountant,
  deactivateAccountant,
} from "@/services/accountant.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminAccountantsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [accountants, setAccountants] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    if (!accessToken) return;
    loadAccountants();
  }, [accessToken]);

  async function loadAccountants() {
    try {
      setLoading(true);
      setError("");

      const result = await getAccountants(accessToken);
      setAccountants(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load accountants");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(accountant) {
    try {
      setActionId(accountant.id);
      setError("");

      if (accountant.status === "ACTIVE") {
        await deactivateAccountant(accessToken, accountant.id);
      } else {
        await activateAccountant(accessToken, accountant.id);
      }

      await loadAccountants();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return accountants.filter((a) => {
      const matchQuery =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.designation?.toLowerCase().includes(q);

      const matchStatus = status === "all" || a.status === status;

      return matchQuery && matchStatus;
    });
  }, [accountants, query, status]);

  const counts = useMemo(
    () => ({
      all: accountants.length,
      ACTIVE: accountants.filter((a) => a.status === "ACTIVE").length,
      INACTIVE: accountants.filter((a) => a.status === "INACTIVE").length,
    }),
    [accountants]
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
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Accountants
          </h1>
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Accountant status">
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
              Unable to load accountants
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAccountants}>
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
          {filtered.map((accountant) => (
            <AccountantCard
              key={accountant.id}
              accountant={accountant}
              onStatusChange={() => handleStatusChange(accountant)}
              loading={actionId === accountant.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}
    </div>
  );
}

function AccountantCard({ accountant, onStatusChange, loading }) {
  const isActive = accountant.status === "ACTIVE";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isActive
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {accountant.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {accountant.name}
            </h3>
            <StatusBadge status={accountant.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {accountant.designation || "Accountant"}
          </p>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{accountant.email}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3 w-3" />
            <span>Finance</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            #{accountant.id}
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "flex-1",
            isActive &&
              "text-destructive hover:bg-destructive/10 hover:text-destructive"
          )}
          onClick={onStatusChange}
          disabled={loading}
        >
          {isActive ? (
            <>
              <UserX className="mr-1.5 h-3.5 w-3.5" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              Activate
            </>
          )}
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

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Wallet className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No accountants found" : "No accountants yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters."
          : "Add an accountant to start managing hospital billing."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/accountants/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add accountant
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