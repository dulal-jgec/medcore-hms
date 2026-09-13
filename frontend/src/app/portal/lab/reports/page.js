"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  FileText,
  Download,
  Printer,
  Mail,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Calendar,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LAB_ORDERS } from "@/lib/lab-mock-data";

const FILTER_TABS = [
  { id: "all", label: "All reports" },
  { id: "abnormal", label: "Abnormal only" },
  { id: "normal", label: "Normal only" },
];

export default function LabReportsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const published = LAB_ORDERS.filter((o) => o.status === "PUBLISHED");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return published.filter((o) => {
      const matchQuery =
        !q ||
        o.patientName.toLowerCase().includes(q) ||
        o.testName.toLowerCase().includes(q) ||
        o.orderNo.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "abnormal" && o.hasAbnormal) ||
        (filter === "normal" && !o.hasAbnormal);
      return matchQuery && matchFilter;
    });
  }, [query, filter, published]);

  const hasFilters = query || filter !== "all";

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  const counts = {
    all: published.length,
    abnormal: published.filter((o) => o.hasAbnormal).length,
    normal: published.filter((o) => !o.hasAbnormal).length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Diagnostic Laboratory
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Published reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Archive of all reports published to doctors and patients.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export archive
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={FileText}
          label="Total published"
          value={counts.all}
          sub="All time"
          accent
        />
        <MiniStat
          icon={TrendingUp}
          label="With abnormal values"
          value={counts.abnormal}
          sub="Require follow-up"
          alert
        />
        <MiniStat
          icon={Minus}
          label="All normal"
          value={counts.normal}
          sub="No flags"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient, test, or order no..."
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

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Report filter">
          {FILTER_TABS.map(({ id, label }) => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
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
                  {counts[id === "all" ? "all" : id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} report{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((report) => (
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
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No reports found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Report Card ══════════ */

function ReportCard({ report, isOpen, onToggle }) {
  const isAbnormal = report.hasAbnormal;
  const reportDate = new Date(report.publishedAt);

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
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isAbnormal
              ? "bg-highlight-soft text-highlight-soft-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <FileText className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {report.testName}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Published
            </span>
            {isAbnormal && (
              <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-highlight-soft-foreground">
                Abnormal
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {report.patientName} ({report.patientAge} yrs)
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

          <p className="mt-2 text-xs text-muted-foreground">
            {report.summary}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Expanded */}
      {isOpen && (
        <div className="border-t border-border">
          <div className="p-5 sm:p-6">
            {/* Header meta */}
            <div className="grid gap-3 sm:grid-cols-3">
              <MetaItem label="Order No" value={report.orderNo} mono />
              <MetaItem label="Ordered by" value={report.orderedBy} />
              <MetaItem
                label="Sample type"
                value={report.sampleType}
              />
            </div>

            {/* Values table */}
            {report.values.length > 0 && (
              <>
                <h4 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Test results
                </h4>

                <div className="mt-3 overflow-hidden rounded-xl border border-border">
                  <div className="hidden bg-muted/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-3">
                    <span className="sm:col-span-4">Parameter</span>
                    <span className="sm:col-span-3">Result</span>
                    <span className="sm:col-span-4">Reference Range</span>
                    <span className="sm:col-span-1 text-right">Flag</span>
                  </div>

                  <div className="divide-y divide-border">
                    {report.values.map((v) => (
                      <ResultRow key={v.name} {...v} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Published footer */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-border bg-brand-soft/30 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  Published
                </p>
                <p className="mt-1 text-sm">
                  Sent to {report.orderedBy} on {report.publishedAt}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
              <Button size="sm" variant="outline">
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Email patient
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════ Result Row ══════════ */

function ResultRow({ name, value, unit, range, status }) {
  const config = {
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
  }[status] || {
    icon: Minus,
    label: "Normal",
    class: "bg-brand-soft text-brand-soft-foreground",
  };

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
        <span className="text-muted-foreground">{range}</span>
      </div>

      <div className="flex items-center gap-2 sm:col-span-1 sm:justify-end">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
          Flag:
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

function MetaItem({ label, value, mono }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-medium",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, accent, alert }) {
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
      <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}