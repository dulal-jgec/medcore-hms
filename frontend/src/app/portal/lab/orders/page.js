"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Microscope,
  FileText,
  PlayCircle,
  TestTube,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LAB_ORDERS, LAB_STATUS_CONFIG } from "@/lib/lab-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "SAMPLE_COLLECTED", label: "Collected" },
  { id: "PROCESSING", label: "Processing" },
  { id: "READY", label: "Ready" },
  { id: "PUBLISHED", label: "Published" },
];

const PRIORITY_TABS = [
  { id: "all", label: "All priorities" },
  { id: "URGENT", label: "Urgent only" },
  { id: "NORMAL", label: "Normal only" },
];

export default function LabOrdersPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") || "all");
  const [priority, setPriority] = useState(params.get("priority") || "all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return LAB_ORDERS.filter((o) => {
      const matchQuery =
        !q ||
        o.patientName.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.orderNo.toLowerCase().includes(q) ||
        o.orderedBy.toLowerCase().includes(q);
      const matchStatus = status === "all" || o.status === status;
      const matchPriority = priority === "all" || o.priority === priority;
      return matchQuery && matchStatus && matchPriority;
    });
  }, [query, status, priority]);

  const hasFilters = query || status !== "all" || priority !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  const counts = {
    all: LAB_ORDERS.length,
    PENDING: LAB_ORDERS.filter((o) => o.status === "PENDING").length,
    SAMPLE_COLLECTED: LAB_ORDERS.filter((o) => o.status === "SAMPLE_COLLECTED").length,
    PROCESSING: LAB_ORDERS.filter((o) => o.status === "PROCESSING").length,
    READY: LAB_ORDERS.filter((o) => o.status === "READY").length,
    PUBLISHED: LAB_ORDERS.filter((o) => o.status === "PUBLISHED").length,
  };

  const urgentCount = LAB_ORDERS.filter(
    (o) => o.priority === "URGENT" && o.status !== "PUBLISHED"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Diagnostic Laboratory
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Lab orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All diagnostic orders from doctors across the hospital.
          </p>
        </div>
      </div>

      {/* Alert */}
      {urgentCount > 0 && priority !== "URGENT" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">
              {urgentCount} urgent order{urgentCount > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              require attention — filter by "Urgent only" to view.
            </span>
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPriority("URGENT")}
            className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Show urgent
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient, test, order no, or doctor..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-44"
        >
          {PRIORITY_TABS.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Order status">
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
        {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((order) => <OrderRow key={order.id} order={order} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FlaskConical className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No orders found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Order Row ══════════ */

function OrderRow({ order }) {
  const config = LAB_STATUS_CONFIG[order.status];
  const isUrgent = order.priority === "URGENT" && order.status !== "PUBLISHED";
  const isReady = order.status === "READY";
  const isPending = order.status === "PENDING";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isUrgent
          ? "border-destructive/30 hover:border-destructive/60"
          : isReady
          ? "border-brand/30 hover:border-brand/60"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isUrgent
              ? "bg-destructive/10 text-destructive"
              : isReady
              ? "bg-brand-soft text-brand-soft-foreground"
              : isPending
              ? "bg-muted text-muted-foreground"
              : "bg-highlight-soft text-highlight-soft-foreground"
          )}
        >
          <FlaskConical className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {order.testName}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                config.class
              )}
            >
              {config.label}
            </span>
            {isUrgent && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {order.patientName} ({order.patientAge} yrs, {order.patientGender})
            </span>
            <span>{order.orderedBy}</span>
            <span className="font-mono text-[11px]">{order.orderNo}</span>
          </div>

          {order.summary && (
            <p
              className={cn(
                "mt-2 text-xs",
                order.hasAbnormal && order.status !== "PUBLISHED"
                  ? "font-medium text-highlight-soft-foreground"
                  : "text-muted-foreground"
              )}
            >
              {order.summary}
            </p>
          )}

          {order.hasAbnormal === false && order.status === "READY" && (
            <p className="mt-2 text-xs font-medium text-brand">
              All parameters within normal range
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isPending && (
            <Button size="sm" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                 
                Collect sample
              </Link>
            </Button>
          )}

          {order.status === "SAMPLE_COLLECTED" && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                
                Start processing
              </Link>
            </Button>
          )}

          {order.status === "PROCESSING" && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                 
                Add results
              </Link>
            </Button>
          )}

          {isReady && (
            <Button size="sm" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                 
                Review & publish
              </Link>
            </Button>
          )}

          {order.status === "PUBLISHED" && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                View report
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}