"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Wallet,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  ChevronRight,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_BILLS, DEPARTMENTS_LIST, getBillingStats } from "@/lib/admin-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Paid" },
  { id: "OVERDUE", label: "Overdue" },
];

export default function AdminBillingPage() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");

  const stats = getBillingStats();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_BILLS.filter((b) => {
      const matchQuery =
        !q ||
        b.patientName.toLowerCase().includes(q) ||
        b.invoiceNo.toLowerCase().includes(q);
      const matchDept = dept === "all" || b.department === dept;
      const matchStatus = status === "all" || b.status === status;
      return matchQuery && matchDept && matchStatus;
    });
  }, [query, dept, status]);

  const hasFilters = query || dept !== "all" || status !== "all";

  function clearFilters() {
    setQuery("");
    setDept("all");
    setStatus("all");
  }

  const counts = {
    all: stats.totalInvoices,
    PENDING: stats.pendingCount,
    PAID: stats.paidCount,
    OVERDUE: stats.overdueCount,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Revenue
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Billing & Invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track payments, pending bills, and overdue invoices.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <BillStat
          icon={Wallet}
          label="Total revenue"
          value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
          sub="this month"
          accent
        />
        <BillStat
          icon={CheckCircle2}
          label="Collected"
          value={`₹${(stats.totalCollected / 100000).toFixed(1)}L`}
          sub={`${stats.paidCount} invoices paid`}
        />
        <BillStat
          icon={Clock}
          label="Pending"
          value={`₹${(stats.pendingAmount / 1000).toFixed(1)}K`}
          sub={`${stats.pendingCount} invoices`}
        />
        <BillStat
          icon={AlertCircle}
          label="Overdue"
          value={`₹${(stats.overdueAmount / 1000).toFixed(1)}K`}
          sub={`${stats.overdueCount} invoice${stats.overdueCount > 1 ? "s" : ""}`}
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
            placeholder="Search by patient name or invoice number..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
        >
          <option value="all">All departments</option>
          {DEPARTMENTS_LIST.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
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

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Billing filters">
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

      {/* Table / List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((bill) => <BillRow key={bill.id} bill={bill} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No invoices found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function BillRow({ bill }) {
  const isPaid = bill.status === "PAID";
  const isOverdue = bill.status === "OVERDUE";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isOverdue
          ? "border-destructive/30 hover:border-destructive/60"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isPaid
              ? "bg-brand-soft text-brand-soft-foreground"
              : isOverdue
              ? "bg-destructive/10 text-destructive"
              : "bg-highlight-soft text-highlight-soft-foreground"
          )}
        >
          <Receipt className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {bill.patientName}
            </h3>
            <StatusPill status={bill.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono">{bill.invoiceNo}</span>
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {bill.department}
            </span>
            <span>
              {bill.items} item{bill.items > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>Issued {bill.issuedOn}</span>
            {isPaid && bill.paidOn && (
              <span className="text-brand">
                Paid {bill.paidOn} via {bill.paymentMethod}
              </span>
            )}
            {!isPaid && <span className="text-destructive">Due {bill.dueDate}</span>}
          </div>
        </div>

        {/* Amount */}
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tracking-tight">
            ₹{bill.amount.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          {!isPaid ? (
            <Button size="sm">
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Record payment
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Receipt
            </Button>
          )}
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
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    OVERDUE: {
      label: "Overdue",
      class: "bg-destructive/10 text-destructive",
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

function BillStat({ icon: Icon, label, value, sub, accent, alert }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/30 hover:shadow-sm">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          alert
            ? "bg-destructive/10 text-destructive"
            : accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}