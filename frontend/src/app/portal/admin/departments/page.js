"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  Building2,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Hash,
  Users,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getDepartments,
  searchDepartments,
} from "@/services/department.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminDepartmentsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    load();
  }, [accessToken]);

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result = await getDepartments(accessToken, {
        page: 0,
        size: 50,
        sortBy: "name",
        sortDir: "asc",
      });

      setDepartments(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(value) {
    setQuery(value);
    const keyword = value.trim();

    if (!keyword) {
      load();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await searchDepartments(accessToken, keyword, {
        page: 0,
      size: 50,
      });

      setDepartments(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    load();
  }

  const filtered = useMemo(() => {
    if (status === "all") return departments;
    return departments.filter((d) => d.status === status);
  }, [departments, status]);

  const counts = useMemo(
    () => ({
      all: departments.length,
      ACTIVE: departments.filter((d) => d.status === "ACTIVE").length,
      INACTIVE: departments.filter((d) => d.status === "INACTIVE").length,
    }),
    [departments]
  );

  const withImages = useMemo(
    () => departments.filter((d) => d.imageUrl).length,
    [departments]
  );

  const hasFilters = query.trim() !== "" || status !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hospital Setup
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Departments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure clinical departments and their public profile.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/departments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add department
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCell
          icon={Layers}
          label="Total departments"
          value={counts.all}
          accent
        />
        <SummaryCell
          icon={Users}
          label="Active"
          value={counts.ACTIVE}
        />
        <SummaryCell
          icon={AlertCircle}
          label="Inactive"
          value={counts.INACTIVE}
        />
        <SummaryCell
          icon={Building2}
          label="With image"
          value={withImages}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by department name..."
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Status">
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
              Unable to load departments
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
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          department{filtered.length !== 1 ? "s" : ""} shown
        </p>
      )}

      {loading ? (
        <CardSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}
    </div>
  );
}

function DepartmentCard({ department }) {
  const isActive = department.status === "ACTIVE";

  return (
    <Link
      href={`/portal/admin/departments/${department.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {department.imageUrl ? (
          <img
            src={department.imageUrl}
            alt={department.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-soft via-brand-soft to-brand-soft/50">
            <Building2 className="h-10 w-10 text-brand-soft-foreground/50" />
          </div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent"
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <StatusChip status={department.status} />
          {department.code && (
            <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur">
              {department.code}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="truncate text-lg font-bold tracking-tight text-white">
            {department.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-6 text-muted-foreground">
          {department.description || "No description provided for this department."}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(department.createdAt)}</span>
          </div>

          <span className="flex items-center gap-1 text-xs font-medium text-brand transition-transform group-hover:gap-1.5">
            View details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusChip({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur",
        isActive
          ? "bg-brand text-brand-foreground"
          : "bg-black/40 text-white"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-brand-foreground" : "bg-white/60"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function SummaryCell({ icon: Icon, label, value, accent }) {
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

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
        <Building2 className="h-6 w-6 text-brand-soft-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No departments match" : "No departments yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try a different search or clear filters."
          : "Create your first department to get started."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/departments/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add department
          </Link>
        </Button>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-72 animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="h-40 bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}