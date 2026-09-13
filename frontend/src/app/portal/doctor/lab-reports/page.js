"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DOCTOR_LAB_ORDERS } from "@/lib/doctor-mock-data";

export default function DoctorLabReportsPage() {
  const [tab, setTab] = useState("pending");
  const [query, setQuery] = useState("");

  const pending = DOCTOR_LAB_ORDERS.filter(
    (r) => r.status === "ready" || r.status === "in_progress"
  );
  const reviewed = DOCTOR_LAB_ORDERS.filter((r) => r.status === "reviewed");

  const baseList = tab === "pending" ? pending : reviewed;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return baseList;
    return baseList.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q)
    );
  }, [query, baseList]);

  const hasFilters = query.length > 0;
  const urgentCount = DOCTOR_LAB_ORDERS.filter(
    (r) => r.priority === "urgent" && r.status === "ready"
  ).length;

  const tabs = [
    { id: "pending", label: "To review", count: pending.length },
    { id: "reviewed", label: "Reviewed", count: reviewed.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Lab Reports
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Lab reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reports you've ordered — review, annotate, and follow up.
        </p>
      </div>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">
              {urgentCount} urgent report{urgentCount > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              awaiting your review.
            </span>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Report filters">
          {tabs.map(({ id, label, count }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
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
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or test..."
            className="h-11 pl-10"
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => setQuery("")}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} report{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Content */}
      <div className="mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((report) => (
            <ReportCard key={report.id} report={report} tab={tab} />
          ))
        ) : (
          <EmptyState tab={tab} hasFilters={hasFilters} onClear={() => setQuery("")} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function ReportCard({ report, tab }) {
  const isReady = report.status === "ready";
  const isInProgress = report.status === "in_progress";
  const isReviewed = report.status === "reviewed";

  const orderedDate = new Date(report.orderedOn);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        report.priority === "urgent" && isReady
          ? "border-destructive/30 hover:border-destructive/50 hover:shadow-md"
          : "border-border hover:border-brand/30 hover:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            report.priority === "urgent" && isReady
              ? "bg-destructive/10 text-destructive"
              : isReady
              ? "bg-brand-soft text-brand-soft-foreground"
              : isInProgress
              ? "bg-highlight-soft text-highlight-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <FlaskConical className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {report.testName}
            </h3>
            <StatusPill status={report.status} />
            {report.priority === "urgent" && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Urgent
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {report.patientName} ({report.patientAge} yrs, {report.patientGender})
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Ordered {orderedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          {/* Result summary */}
          {report.summary && (
            <div
              className={cn(
                "mt-3 rounded-lg border p-3",
                report.hasAbnormal && isReady
                  ? "border-highlight-soft-foreground/20 bg-highlight-soft/40"
                  : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-start gap-2">
                {report.hasAbnormal && isReady ? (
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-highlight-soft-foreground" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                )}
                <p
                  className={cn(
                    "text-xs",
                    report.hasAbnormal && isReady
                      ? "font-medium text-highlight-soft-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {report.summary}
                </p>
              </div>
            </div>
          )}

          {isReviewed && report.reviewedOn && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Reviewed on {report.reviewedOn}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {isReady && (
            <>
              <Button size="sm">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Review
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/portal/doctor/patients/${report.patientId}`}>
                  Patient file
                </Link>
              </Button>
            </>
          )}

          {isInProgress && (
            <span className="rounded-full bg-muted px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
              Awaiting results
            </span>
          )}

          {isReviewed && (
            <Button size="sm" variant="outline">
              View report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ready: {
      label: "Ready",
      icon: CheckCircle2,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    in_progress: {
      label: "In progress",
      icon: Clock,
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    reviewed: {
      label: "Reviewed",
      icon: CheckCircle2,
      class: "bg-muted text-muted-foreground",
    },
  };
  const config = map[status] || map.in_progress;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function EmptyState({ tab, hasFilters, onClear }) {
  const copy = {
    pending: {
      title: "No reports to review",
      desc: "All caught up! New reports will appear here.",
    },
    reviewed: {
      title: "No reviewed reports",
      desc: "Reports you've reviewed will appear here.",
    },
  };
  const c = copy[tab] || copy.pending;

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FlaskConical className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No reports found" : c.title}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters ? "Try a different search." : c.desc}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear search
        </Button>
      )}
    </div>
  );
}