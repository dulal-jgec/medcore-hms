"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  CreditCard,
  ChevronRight,
  Smartphone,
  Banknote,
  Building,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_ACCOUNTANT_BILLS } from "@/lib/accountant-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PARTIALLY_PAID", label: "Partial" },
  { id: "PAID", label: "Paid" },
  { id: "CANCELLED", label: "Cancelled" },
];

const METHOD_ICONS = {
  UPI: Smartphone,
  CARD: CreditCard,
  CASH: Banknote,
  NET_BANKING: Building,
  INSURANCE: Shield,
};

const METHOD_LABEL = {
  UPI: "UPI",
  CARD: "Card",
  CASH: "Cash",
  NET_BANKING: "Net Banking",
  INSURANCE: "Insurance",
};

export default function AccountantBillsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_ACCOUNTANT_BILLS.filter((b) => {
      const matchQuery =
        !q ||
        b.patientName.toLowerCase().includes(q) ||
        b.invoiceNo.toLowerCase().includes(q);
      const matchStatus = status === "all" || b.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: ALL_ACCOUNTANT_BILLS.length,
    PENDING: ALL_ACCOUNTANT_BILLS.filter((b) => b.status === "PENDING").length,
    PARTIALLY_PAID: ALL_ACCOUNTANT_BILLS.filter(
      (b) => b.status === "PARTIALLY_PAID"
    ).length,
    PAID: ALL_ACCOUNTANT_BILLS.filter((b) => b.status === "PAID").length,
    CANCELLED: ALL_ACCOUNTANT_BILLS.filter((b) => b.status === "CANCELLED")
      .length,
  };

  const totals = {
    billed: ALL_ACCOUNTANT_BILLS.reduce((s, b) => s + b.amount, 0),
    paid: ALL_ACCOUNTANT_BILLS.reduce((s, b) => s + (b.paid || 0), 0),
  };
  const outstanding = totals.billed - totals.paid;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            All bills
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete invoice register across the hospital.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={Receipt}
          label="Total billed"
          value={`₹${(totals.billed / 100000).toFixed(2)}L`}
          sub={`${counts.all} invoices`}
          accent
        />
        <MiniStat
          icon={CheckCircle2}
          label="Collected"
          value={`₹${(totals.paid / 100000).toFixed(2)}L`}
          sub={`${counts.PAID} paid`}
        />
        <MiniStat
          icon={Clock}
          label="Outstanding"
          value={`₹${(outstanding / 100000).toFixed(2)}L`}
          sub={`${counts.PENDING + counts.PARTIALLY_PAID} bills`}
          alert
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Bill filters">
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
        {filtered.length} invoice{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((bill) => <BillRow key={bill.id} bill={bill} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No bills found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Bill Row ══════════ */

function BillRow({ bill }) {
  const isPaid = bill.status === "PAID";
  const isPartial = bill.status === "PARTIALLY_PAID";
  const isCancelled = bill.status === "CANCELLED";
  const paidAmount = bill.paid || 0;
  const remaining = bill.amount - paidAmount;

  const MethodIcon = bill.paymentMethod
    ? METHOD_ICONS[bill.paymentMethod] || CreditCard
    : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isCancelled
          ? "border-border opacity-60"
          : isPartial
          ? "border-highlight-soft-foreground/20 hover:border-highlight-soft-foreground/40"
          : !isPaid
          ? "border-destructive/20 hover:border-destructive/40"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isPaid
              ? "bg-brand-soft text-brand-soft-foreground"
              : isPartial
              ? "bg-highlight-soft text-highlight-soft-foreground"
              : isCancelled
              ? "bg-muted text-muted-foreground"
              : "bg-destructive/10 text-destructive"
          )}
        >
          <Receipt className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {bill.patientName}
            </h3>
            <StatusPill status={bill.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{bill.invoiceNo}</span>
            <span>{bill.department}</span>
            <span>
              {bill.items} item{bill.items > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>Issued {bill.issuedOn}</span>
            {isPaid && bill.paidOn && MethodIcon && (
              <span className="flex items-center gap-1 text-brand">
                <MethodIcon className="h-3 w-3" />
                Paid {bill.paidOn} via {METHOD_LABEL[bill.paymentMethod]}
              </span>
            )}
            {!isPaid && !isCancelled && (
              <span className="font-medium text-destructive">
                Due {bill.dueDate}
              </span>
            )}
          </div>
          {isPartial && (
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <div className="flex-1 max-w-[180px]">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-highlight"
                    style={{ width: `${(paidAmount / bill.amount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="font-medium text-highlight-soft-foreground">
                ₹{paidAmount.toLocaleString("en-IN")} of ₹
                {bill.amount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tracking-tight">
            ₹{bill.amount.toLocaleString("en-IN")}
          </p>
          {isPartial && (
            <p className="mt-0.5 text-[11px] font-medium text-destructive">
              ₹{remaining.toLocaleString("en-IN")} left
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {!isPaid && !isCancelled ? (
            <Button size="sm">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Record
            </Button>
          ) : isPaid ? (
            <Button size="sm" variant="outline">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Receipt
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    PAID: {
      label: "Paid",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    PENDING: {
      label: "Pending",
      class: "bg-destructive/10 text-destructive",
    },
    PARTIALLY_PAID: {
      label: "Partial",
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    CANCELLED: {
      label: "Cancelled",
      class: "bg-muted text-muted-foreground",
    },
  };
  const config = map[status] || map.PENDING;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
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