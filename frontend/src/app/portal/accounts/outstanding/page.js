"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  AlertCircle,
  Clock,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_ACCOUNTANT_BILLS } from "@/lib/accountant-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All outstanding" },
  { id: "PENDING", label: "Fully pending" },
  { id: "PARTIALLY_PAID", label: "Partially paid" },
];

export default function AccountantOutstandingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const outstanding = ALL_ACCOUNTANT_BILLS.filter(
    (b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID"
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return outstanding.filter((b) => {
      const matchQuery =
        !q ||
        b.patientName.toLowerCase().includes(q) ||
        b.invoiceNo.toLowerCase().includes(q);
      const matchStatus = status === "all" || b.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status, outstanding]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: outstanding.length,
    PENDING: outstanding.filter((b) => b.status === "PENDING").length,
    PARTIALLY_PAID: outstanding.filter((b) => b.status === "PARTIALLY_PAID")
      .length,
  };

  const totalRemaining = outstanding.reduce(
    (s, b) => s + (b.amount - (b.paid || 0)),
    0
  );

  // Overdue: dueDate is in past (compare to today)
  const today = new Date("2026-09-13");
  const overdueBills = outstanding.filter((b) => new Date(b.dueDate) < today);
  const overdueAmount = overdueBills.reduce(
    (s, b) => s + (b.amount - (b.paid || 0)),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Finance
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Outstanding bills
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bills awaiting full payment. Follow up with patients to close them.
        </p>
      </div>

      {/* Alert */}
      {overdueBills.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {overdueBills.length} bill
              {overdueBills.length > 1 ? "s" : ""} overdue
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              ₹{overdueAmount.toLocaleString("en-IN")} past due date — needs
              immediate follow-up
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={AlertCircle}
          label="Total outstanding"
          value={`₹${(totalRemaining / 100000).toFixed(2)}L`}
          sub={`${counts.all} bills`}
          alert
        />
        <MiniStat
          icon={Clock}
          label="Overdue amount"
          value={`₹${(overdueAmount / 1000).toFixed(1)}K`}
          sub={`${overdueBills.length} bills`}
          alert
        />
        <MiniStat
          icon={CreditCard}
          label="Partially paid"
          value={counts.PARTIALLY_PAID}
          sub="in progress"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient or invoice number..."
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
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Outstanding filters"
        >
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
        {filtered.length} bill{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((bill) => (
            <OutstandingRow key={bill.id} bill={bill} today={today} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
              <CreditCard className="h-6 w-6 text-brand-soft-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">
              No outstanding bills
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              All invoices have been paid. Great work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Outstanding Row ══════════ */

function OutstandingRow({ bill, today }) {
  const isPartial = bill.status === "PARTIALLY_PAID";
  const paidAmount = bill.paid || 0;
  const remaining = bill.amount - paidAmount;
  const dueDate = new Date(bill.dueDate);
  const isOverdue = dueDate < today;

  // Days difference
  const diffDays = Math.ceil(
    (dueDate - today) / (1000 * 60 * 60 * 24)
  );

  const urgency = isOverdue
    ? "overdue"
    : diffDays <= 3
    ? "soon"
    : "later";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        urgency === "overdue"
          ? "border-destructive/30 hover:border-destructive/60"
          : urgency === "soon"
          ? "border-highlight-soft-foreground/30"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            urgency === "overdue"
              ? "bg-destructive/10 text-destructive"
              : urgency === "soon"
              ? "bg-highlight-soft text-highlight-soft-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <AlertCircle className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {bill.patientName}
            </h3>
            {isPartial && (
              <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-highlight-soft-foreground">
                Partial
              </span>
            )}
            <DueBadge urgency={urgency} diffDays={diffDays} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{bill.invoiceNo}</span>
            <span>{bill.department}</span>
            <span>Due {bill.dueDate}</span>
          </div>

          {isPartial && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-32">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-highlight"
                    style={{ width: `${(paidAmount / bill.amount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-highlight-soft-foreground">
                ₹{paidAmount.toLocaleString("en-IN")} paid
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Remaining
          </p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-destructive">
            ₹{remaining.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button size="sm">
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Record payment
          </Button>
          <Button size="sm" variant="outline">
            <Phone className="mr-1.5 h-3.5 w-3.5" />
            Remind
          </Button>
        </div>
      </div>
    </div>
  );
}

function DueBadge({ urgency, diffDays }) {
  if (urgency === "overdue") {
    return (
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        {Math.abs(diffDays)} day{Math.abs(diffDays) !== 1 ? "s" : ""} overdue
      </span>
    );
  }
  if (urgency === "soon") {
    return (
      <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-highlight-soft-foreground">
        Due in {diffDays} day{diffDays !== 1 ? "s" : ""}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Due in {diffDays} days
    </span>
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