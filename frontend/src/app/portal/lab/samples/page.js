"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  Microscope,
  PlayCircle,
  XCircle,
  Droplets,
  Scan,
  FlaskConical,
  User,
  ChevronRight,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LAB_ORDERS } from "@/lib/lab-mock-data";

const SAMPLE_TYPE_TABS = [
  { id: "all", label: "All types" },
  { id: "Blood", label: "Blood" },
  { id: "Urine", label: "Urine" },
  { id: "Scan", label: "Scan" },
];

const SAMPLE_ICONS = {
  Blood: Droplets,
  Urine: TestTube,
  Scan: Scan,
  "ECG leads": FlaskConical,
};

export default function LabSamplesPage() {
  const [query, setQuery] = useState("");
  const [sampleType, setSampleType] = useState("all");

  // Only show orders that have physical samples (or are pending collection)
  const sampleOrders = LAB_ORDERS.filter((o) =>
    ["PENDING", "SAMPLE_COLLECTED", "PROCESSING", "READY"].includes(o.status)
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return sampleOrders.filter((o) => {
      const matchQuery =
        !q ||
        o.patientName.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.orderNo.toLowerCase().includes(q);
      const matchType =
        sampleType === "all" || o.sampleType === sampleType;
      return matchQuery && matchType;
    });
  }, [query, sampleType, sampleOrders]);

  const hasFilters = query || sampleType !== "all";

  function clearFilters() {
    setQuery("");
    setSampleType("all");
  }

  // Stats by status
  const stats = {
    pending: sampleOrders.filter((o) => o.status === "PENDING").length,
    collected: sampleOrders.filter((o) => o.status === "SAMPLE_COLLECTED").length,
    processing: sampleOrders.filter((o) => o.status === "PROCESSING").length,
    ready: sampleOrders.filter((o) => o.status === "READY").length,
  };

  const counts = {
    all: sampleOrders.length,
    Blood: sampleOrders.filter((o) => o.sampleType === "Blood").length,
    Urine: sampleOrders.filter((o) => o.sampleType === "Urine").length,
    Scan: sampleOrders.filter((o) => o.sampleType === "Scan").length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Diagnostic Laboratory
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Sample tracking
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the lifecycle of every physical sample from collection to
          reporting.
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatBox
          icon={Clock}
          label="Awaiting collection"
          value={stats.pending}
          alert={stats.pending > 0}
        />
        <StatBox
          icon={TestTube}
          label="Collected"
          value={stats.collected}
        />
        <StatBox
          icon={Microscope}
          label="In processing"
          value={stats.processing}
        />
        <StatBox
          icon={CheckCircle2}
          label="Report ready"
          value={stats.ready}
          accent
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient, test, or sample ID..."
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

      {/* Sample type tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Sample type">
          {SAMPLE_TYPE_TABS.map(({ id, label }) => {
            const isActive = sampleType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSampleType(id)}
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
        {filtered.length} sample{filtered.length !== 1 ? "s" : ""} in the
        pipeline
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((order) => (
            <SampleRow key={order.id} order={order} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <TestTube className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No samples found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Sample Row ══════════ */

function SampleRow({ order }) {
  const SampleIcon = SAMPLE_ICONS[order.sampleType] || TestTube;

  const statusConfig = {
    PENDING: {
      label: "Awaiting Collection",
      class: "bg-destructive/10 text-destructive",
      border: "border-destructive/20",
      icon: Clock,
    },
    SAMPLE_COLLECTED: {
      label: "Collected",
      class: "bg-highlight-soft text-highlight-soft-foreground",
      border: "border-highlight-soft-foreground/20",
      icon: TestTube,
    },
    PROCESSING: {
      label: "In Processing",
      class: "bg-highlight-soft text-highlight-soft-foreground",
      border: "border-highlight-soft-foreground/20",
      icon: Microscope,
    },
    READY: {
      label: "Report Ready",
      class: "bg-brand-soft text-brand-soft-foreground",
      border: "border-brand/30",
      icon: CheckCircle2,
    },
  }[order.status];

  const StatusIcon = statusConfig.icon;

  // Fake sample ID from order no
  const sampleId = order.orderNo.replace("LAB-", "S-");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        statusConfig.border
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Sample icon */}
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl",
              statusConfig.class
            )}
          >
            <SampleIcon className="h-6 w-6" />
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            {order.sampleType}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {order.testName}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                statusConfig.class
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
            {order.priority === "URGENT" && order.status !== "READY" && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Urgent
              </span>
            )}
          </div>

          {/* Sample ID + patient */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <QrCode className="h-3 w-3" />
              {sampleId}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              {order.patientName} ({order.patientAge} yrs)
            </span>
          </div>

          {/* Timeline */}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px]">
            <Timeline
              label="Ordered"
              value={order.orderedOn.split(" ")[1]}
              done
            />
            {order.sampleCollectedAt && (
              <Timeline
                label="Collected"
                value={order.sampleCollectedAt.split(" ")[1]}
                done
              />
            )}
            {order.reportReadyAt && (
              <Timeline
                label="Report ready"
                value={order.reportReadyAt.split(" ")[1]}
                done
              />
            )}
            {!order.sampleCollectedAt && (
              <Timeline label="Collected" value="Pending" />
            )}
            {!order.reportReadyAt && order.sampleCollectedAt && (
              <Timeline label="Report ready" value="Processing" />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {order.status === "PENDING" && (
            <Button size="sm" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                <TestTube className="mr-1.5 h-3.5 w-3.5" />
                Collect
              </Link>
            </Button>
          )}

          {order.status === "SAMPLE_COLLECTED" && (
            <>
              <Button size="sm" asChild>
                <Link href={`/portal/lab/orders/${order.id}`}>
                  <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                  Start test
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
            </>
          )}

          {order.status === "PROCESSING" && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                
                Add results
              </Link>
            </Button>
          )}

          {order.status === "READY" && (
            <Button size="sm" asChild>
              <Link href={`/portal/lab/orders/${order.id}`}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Publish
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            order.status === "PENDING"
              ? "w-1/4 bg-destructive"
              : order.status === "SAMPLE_COLLECTED"
              ? "w-2/4 bg-highlight"
              : order.status === "PROCESSING"
              ? "w-3/4 bg-highlight"
              : "w-full bg-brand"
          )}
        />
      </div>
    </div>
  );
}

function Timeline({ label, value, done }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          done ? "bg-brand" : "bg-muted-foreground/30"
        )}
      />
      <span className="text-muted-foreground">
        {label}:{" "}
        <span
          className={cn(
            "font-medium",
            done ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent, alert }) {
  const style = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          style
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}