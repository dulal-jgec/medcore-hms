"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  Receipt,
  Wallet,
  CheckCircle2,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Shield,
  Printer,
  Download,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL_ACCOUNTANT_BILLS } from "@/lib/accountant-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "PAID", label: "Paid" },
];

const METHOD_OPTIONS = [
  { id: "UPI", label: "UPI", icon: Smartphone },
  { id: "CARD", label: "Card", icon: CreditCard },
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "NET_BANKING", label: "Net Banking", icon: Building },
];

export default function ReceptionBillingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [payOpen, setPayOpen] = useState(null);
  const [method, setMethod] = useState("UPI");

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
    PENDING: ALL_ACCOUNTANT_BILLS.filter(
      (b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID"
    ).length,
    PAID: ALL_ACCOUNTANT_BILLS.filter((b) => b.status === "PAID").length,
  };

  const totalPending = ALL_ACCOUNTANT_BILLS.filter(
    (b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID"
  ).reduce((s, b) => s + (b.amount - (b.paid || 0)), 0);

  const totalPaidToday = ALL_ACCOUNTANT_BILLS.filter(
    (b) => b.status === "PAID" && b.paidOn === "2026-09-12"
  ).reduce((s, b) => s + b.amount, 0);

  const payBill = ALL_ACCOUNTANT_BILLS.find((b) => b.id === payOpen);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Front Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Billing counter
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Collect payments and print receipts for patients.
          </p>
        </div>
        <Button variant="outline">
          <Plus className="mr-1.5 h-4 w-4" />
          Walk-in bill
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={Clock}
          label="Pending amount"
          value={`₹${(totalPending / 1000).toFixed(1)}K`}
          sub={`${counts.PENDING} bills`}
          alert
        />
        <MiniStat
          icon={Wallet}
          label="Collected today"
          value={`₹${totalPaidToday.toLocaleString("en-IN")}`}
          sub="From patient payments"
          accent
        />
        <MiniStat
          icon={CheckCircle2}
          label="Paid bills"
          value={counts.PAID}
          sub="Total"
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or invoice..."
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
          filtered.map((bill) => (
            <BillRow
              key={bill.id}
              bill={bill}
              onPay={() => setPayOpen(bill.id)}
            />
          ))
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

      {/* Payment modal */}
      {payBill && (
        <PaymentModal
          bill={payBill}
          method={method}
          setMethod={setMethod}
          onClose={() => setPayOpen(null)}
        />
      )}
    </div>
  );
}

/* ══════════ Bill Row ══════════ */

function BillRow({ bill, onPay }) {
  const isPaid = bill.status === "PAID";
  const isPartial = bill.status === "PARTIALLY_PAID";
  const paidAmount = bill.paid || 0;
  const remaining = bill.amount - paidAmount;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isPaid
          ? "border-border"
          : isPartial
          ? "border-highlight-soft-foreground/20"
          : "border-destructive/20"
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
          {isPartial && (
            <p className="mt-1.5 text-[11px] text-highlight-soft-foreground">
              ₹{paidAmount.toLocaleString("en-IN")} paid · ₹
              {remaining.toLocaleString("en-IN")} remaining
            </p>
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
          {!isPaid ? (
            <Button size="sm" onClick={onPay}>
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              Collect
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline">
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
              <Button size="sm" variant="ghost">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Receipt
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    PAID: { label: "Paid", class: "bg-brand-soft text-brand-soft-foreground" },
    PENDING: { label: "Pending", class: "bg-destructive/10 text-destructive" },
    PARTIALLY_PAID: {
      label: "Partial",
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    CANCELLED: { label: "Cancelled", class: "bg-muted text-muted-foreground" },
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

/* ══════════ Payment Modal ══════════ */

function PaymentModal({ bill, method, setMethod, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const remaining = bill.amount - (bill.paid || 0);

  async function confirm() {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => onClose(), 1600);
  }

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-bold tracking-tight">
            Payment received
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹{remaining.toLocaleString("en-IN")} collected via{" "}
            {method.replace("_", " ").toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Collect payment
            </p>
            <p className="mt-0.5 text-sm font-medium">
              {bill.patientName} · {bill.invoiceNo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Amount to collect
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              ₹{remaining.toLocaleString("en-IN")}
            </p>
            {bill.paid > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                (₹{bill.paid.toLocaleString("en-IN")} already paid)
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="mt-6">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment method
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {METHOD_OPTIONS.map(({ id, label, icon: Icon }) => {
                const active = method === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-brand bg-brand-soft text-brand-soft-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:bg-hover/40"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={processing}>
              {processing ? "Processing..." : "Confirm payment"}
            </Button>
          </div>
        </div>
      </div>
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