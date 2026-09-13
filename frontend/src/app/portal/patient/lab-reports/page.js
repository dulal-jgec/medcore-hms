"use client";

import { useState } from "react";
import {
  FlaskConical,
  User,
  Calendar,
  ChevronDown,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LAB_REPORTS } from "@/lib/patient-mock-data";

export default function PatientLabReportsPage() {
  const [tab, setTab] = useState("ready");
  const [openId, setOpenId] = useState(null);

  const ready = LAB_REPORTS.filter((r) => r.status === "ready");
  const pending = LAB_REPORTS.filter((r) => r.status === "in_progress");

  const reports = tab === "ready" ? ready : pending;

  const tabs = [
    { id: "ready", label: "Ready", count: ready.length },
    { id: "pending", label: "Pending", count: pending.length },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Lab Reports
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My lab reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Test results ordered by your doctors, with reference ranges.
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={CheckCircle2}
          label="Reports ready"
          value={ready.length}
          accent
        />
        <SummaryCard
          icon={Clock}
          label="In progress"
          value={pending.length}
        />
        <SummaryCard
          icon={FlaskConical}
          label="Total tests"
          value={LAB_REPORTS.length}
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Lab report filters">
          {tabs.map(({ id, label, count }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setOpenId(null);
                }}
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

      {/* Content */}
      <div className="mt-8 space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isOpen={openId === report.id}
              onToggle={() =>
                setOpenId(openId === report.id ? null : report.id)
              }
            />
          ))
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function ReportCard({ report, isOpen, onToggle }) {
  const isReady = report.status === "ready";
  const reportDate = new Date(report.date);
  const hasAbnormal = report.values.some((v) => v.status !== "normal");

  // Ready reports are expandable; pending are not
  const expandable = isReady;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        isOpen
          ? "border-brand/40 shadow-md"
          : "border-border hover:border-brand/30 hover:shadow-sm"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={expandable ? onToggle : undefined}
        disabled={!expandable}
        className={cn(
          "flex w-full items-center gap-4 p-5 text-left sm:p-6",
          !expandable && "cursor-default"
        )}
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isReady
              ? hasAbnormal
                ? "bg-highlight-soft text-highlight-soft-foreground"
                : "bg-brand-soft text-brand-soft-foreground"
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
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {report.orderedBy}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {reportDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <p
            className={cn(
              "mt-2 text-xs",
              hasAbnormal && isReady
                ? "font-medium text-highlight-soft-foreground"
                : "text-muted-foreground"
            )}
          >
            {report.summary}
          </p>
        </div>

        {/* Chevron — only for ready reports */}
        {expandable && (
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Expanded — values table */}
      {isOpen && isReady && report.values.length > 0 && (
        <div className="border-t border-border">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Test results
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {report.values.length} parameters
              </span>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {/* Header */}
              <div className="hidden bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-3">
                <span className="sm:col-span-4">Parameter</span>
                <span className="sm:col-span-3">Result</span>
                <span className="sm:col-span-4">Reference Range</span>
                <span className="sm:col-span-1 text-right">Status</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {report.values.map((v) => (
                  <ResultRow key={v.name} {...v} />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lab's note
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-foreground">
                    {hasAbnormal
                      ? "Some parameters are outside the reference range. Please consult your doctor for interpretation."
                      : "All parameters are within normal reference ranges. Please consult your doctor for final interpretation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline">
                Share with doctor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ name, value, unit, range, status }) {
  const statusConfig = {
    normal: {
      icon: Minus,
      label: "Normal",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    high: {
      icon: TrendingUp,
      label: "High",
      class: "bg-destructive/10 text-destructive",
    },
    low: {
      icon: TrendingDown,
      label: "Low",
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
  };
  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;

  return (
    <div className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-12 sm:gap-3">
      <div className="sm:col-span-4">
        <p className="font-medium">{name}</p>
      </div>

      <div className="flex items-center gap-2 sm:col-span-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
          Result:
        </span>
        <span className="font-semibold">
          {value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:col-span-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
          Range:
        </span>
        <span className="text-muted-foreground">
          {range} {unit && unit !== "—" ? unit : ""}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:col-span-1 sm:justify-end">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
          Status:
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            config.class
          )}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
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

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FlaskConical className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {tab === "ready" ? "No reports ready" : "No reports pending"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {tab === "ready"
          ? "Completed lab reports will appear here."
          : "Reports in progress will appear here."}
      </p>
    </div>
  );
}