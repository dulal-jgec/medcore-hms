"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  X,
  HeartPulse,
  Mail,
  Phone,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Users,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getNurses } from "@/services/nurse.service";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminNursesPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [nurses, setNurses] = useState([]);
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

      const result = await getNurses(accessToken, {
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

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    return nurses.filter((nurse) => {
      const matchQuery =
        !q ||
        nurse.name?.toLowerCase().includes(q) ||
        nurse.email?.toLowerCase().includes(q) ||
        nurse.department?.toLowerCase().includes(q) ||
        nurse.designation?.toLowerCase().includes(q);

      const matchStatus = status === "all" || nurse.status === status;

      return matchQuery && matchStatus;
    });
  }, [nurses, query, status]);

  const counts = useMemo(
    () => ({
      all: nurses.length,
      ACTIVE: nurses.filter((n) => n.status === "ACTIVE").length,
      INACTIVE: nurses.filter((n) => n.status === "INACTIVE").length,
    }),
    [nurses]
  );

  const departmentsCovered = useMemo(
    () => new Set(nurses.map((n) => n.department).filter(Boolean)).size,
    [nurses]
  );

  const hasFilters = query.trim() !== "" || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        eyebrow="Staff Management"
        title="Nurses"
        desc="Manage nursing staff, shift assignments, and credentials."
        action={{
          label: "Add nurse",
          icon: Plus,
          href: "/portal/admin/nurses/new",
        }}
      />

      <SummaryBar
        items={[
          {
            label: "Total nurses",
            value: counts.all,
            icon: Users,
            accent: true,
          },
          {
            label: "Active",
            value: counts.ACTIVE,
            icon: HeartPulse,
          },
          {
            label: "Inactive",
            value: counts.INACTIVE,
            icon: AlertCircle,
          },
          {
            label: "Departments",
            value: departmentsCovered,
            icon: Building2,
          },
        ]}
      />

      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search by name, email, department, or designation..."
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      <StatusTabs
        tabs={STATUS_TABS}
        counts={counts}
        active={status}
        onChange={setStatus}
      />

      {error && (
        <ErrorBanner
          title="Unable to load nurses"
          message={error}
          onRetry={load}
        />
      )}

      {!loading && !error && (
        <ResultCount
          count={filtered.length}
          noun="nurse"
          suffix="across your hospital"
        />
      )}

      {loading ? (
        <CardSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((nurse) => (
            <NurseCard key={nurse.id} nurse={nurse} />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      )}
    </div>
  );
}

function NurseCard({ nurse }) {
  const isActive = nurse.status === "ACTIVE";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-lg">
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          isActive ? "bg-brand" : "bg-muted-foreground/30"
        )}
      />

      <div className="flex items-start gap-4 p-5 pt-6">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-sm",
            isActive
              ? "bg-gradient-to-br from-brand to-brand/85 text-brand-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {nurse.name?.charAt(0)?.toUpperCase() || "N"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {nurse.name}
            </h3>
            <StatusBadge status={nurse.status} />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {nurse.designation || "Staff Nurse"}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{nurse.email || "—"}</span>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-3">
        <MetaCell
          icon={Building2}
          label="Department"
          value={nurse.department || "—"}
        />
        <MetaCell
          icon={HeartPulse}
          label="Ward"
          value={nurse.ward || "—"}
        />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <GraduationCap className="h-3 w-3" />
          <span className="truncate">
            {nurse.qualification || "Qualification not set"}
          </span>
        </div>
        <Link
          href={`/portal/admin/nurses/${nurse.id}`}
          className="flex items-center gap-1 text-xs font-medium text-brand transition-transform hover:gap-1.5"
        >
          View
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function MetaCell({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-2.5 w-2.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isActive
          ? "bg-brand-soft text-brand-soft-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-brand" : "bg-muted-foreground"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function PageHeader({ eyebrow, title, desc, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>

      {action && (
        <Button asChild>
          <Link href={action.href}>
            {action.icon && <action.icon className="mr-1.5 h-4 w-4" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}

function SummaryBar({ items }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/30 hover:shadow-sm"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                item.accent
                  ? "bg-brand text-brand-foreground"
                  : "bg-brand-soft text-brand-soft-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              {item.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Toolbar({ query, onQuery, placeholder, hasFilters, onClear }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-10"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={onClear} className="h-11">
          <X className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}

function StatusTabs({ tabs, counts, active, onChange }) {
  return (
    <div className="mt-6 border-b border-border">
      <nav className="flex gap-6 overflow-x-auto" aria-label="Status filter">
        {tabs.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
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
  );
}

function ResultCount({ count, noun, suffix }) {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{count}</span> {noun}
      {count !== 1 ? "s" : ""} {suffix}
    </p>
  );
}

function ErrorBanner({ title, message, onRetry }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
        <HeartPulse className="h-6 w-6 text-brand-soft-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No nurses match your filters" : "No nurses yet"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try a different search or clear the filters."
          : "Add your first nurse to get started."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      ) : (
        <Button asChild className="mt-5">
          <Link href="/portal/admin/nurses/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add nurse
          </Link>
        </Button>
      )}
    </div>
  );
}

function CardSkeleton() {
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