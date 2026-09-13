"use client";

import { useState, useMemo } from "react";
import {
  Search,
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Shield,
  CheckCircle2,
  Download,
  Receipt,
  TrendingUp,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  RECENT_PAYMENTS,
  PAYMENT_METHODS,
} from "@/lib/accountant-mock-data";

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

const METHOD_TABS = [
  { id: "all", label: "All" },
  { id: "UPI", label: "UPI" },
  { id: "CARD", label: "Card" },
  { id: "CASH", label: "Cash" },
  { id: "NET_BANKING", label: "Net Banking" },
  { id: "INSURANCE", label: "Insurance" },
];

export default function AccountantPaymentsPage() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");

  // Build a fake larger payment list by repeating recent payments with new ids
  // Real backend এ paginated response আসবে
  const allPayments = useMemo(() => {
    const base = [...RECENT_PAYMENTS];
    // Duplicate for demo — real app এ backend থেকে 50+ rows আসবে
    const extended = [
      ...base,
      ...base.map((p) => ({ ...p, id: p.id + 100 })),
      ...base.map((p) => ({ ...p, id: p.id + 200 })),
    ];
    return extended;
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allPayments.filter((p) => {
      const matchQuery =
        !q ||
        p.patientName.toLowerCase().includes(q) ||
        p.invoiceNo.toLowerCase().includes(q);
      const matchMethod = method === "all" || p.method === method;
      return matchQuery && matchMethod;
    });
  }, [allPayments, query, method]);

  const hasFilters = query || method !== "all";

  function clearFilters() {
    setQuery("");
    setMethod("all");
  }

  const counts = {
    all: allPayments.length,
    UPI: allPayments.filter((p) => p.method === "UPI").length,
    CARD: allPayments.filter((p) => p.method === "CARD").length,
    CASH: allPayments.filter((p) => p.method === "CASH").length,
    NET_BANKING: allPayments.filter((p) => p.method === "NET_BANKING").length,
    INSURANCE: allPayments.filter((p) => p.method === "INSURANCE").length,
  };

  const totalCollected = allPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Payment history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every payment received — searchable by patient, invoice, or method.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={TrendingUp}
          label="Total collected"
          value={`₹${(totalCollected / 100000).toFixed(2)}L`}
          sub={`${counts.all} transactions`}
          accent
        />
        <MiniStat
          icon={Calendar}
          label="Today"
          value="₹18,490"
          sub="7 transactions"
        />
        <MiniStat
          icon={CheckCircle2}
          label="Avg. transaction"
          value={`₹${Math.round(totalCollected / counts.all).toLocaleString(
            "en-IN"
          )}`}
          sub="per payment"
        />
      </div>

      {/* Method breakdown */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          By payment method
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PAYMENT_METHODS.map((m) => {
            const Icon = METHOD_ICONS[m.method] || CreditCard;
            return (
              <div key={m.method} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium">{m.method}</p>
                  <p className="text-sm font-bold">
                    ₹{(m.amount / 100000).toFixed(2)}L
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {m.transactions} txns
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient or invoice..."
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

      {/* Method tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Method filters">
          {METHOD_TABS.map(({ id, label }) => {
            const isActive = method === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMethod(id)}
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
        {filtered.length} payment{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Desktop header */}
        <div className="hidden border-b border-border bg-muted/30 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:grid lg:grid-cols-12 lg:gap-4">
          <span className="lg:col-span-4">Patient & Invoice</span>
          <span className="lg:col-span-3">Date & Time</span>
          <span className="lg:col-span-2">Method</span>
          <span className="lg:col-span-2">Received by</span>
          <span className="lg:col-span-1 text-right">Amount</span>
        </div>

        <div className="divide-y divide-border">
          {filtered.length > 0 ? (
            filtered.map((payment) => {
              const Icon = METHOD_ICONS[payment.method] || CreditCard;
              return (
                <div
                  key={payment.id}
                  className="grid gap-3 p-5 transition-colors hover:bg-hover/40 lg:grid-cols-12 lg:items-center lg:gap-4 lg:py-4"
                >
                  {/* Patient */}
                  <div className="flex items-center gap-3 lg:col-span-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {payment.patientName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground font-mono">
                        {payment.invoiceNo}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-3">
                    <p className="text-sm">{payment.receivedOn}</p>
                  </div>

                  {/* Method */}
                  <div className="flex items-center gap-2 lg:col-span-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground lg:hidden" />
                    <span className="text-sm">
                      {METHOD_LABEL[payment.method] || payment.method}
                    </span>
                  </div>

                  {/* Received by */}
                  <div className="lg:col-span-2">
                    <p className="text-xs text-muted-foreground">
                      {payment.receivedBy}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="lg:col-span-1 lg:text-right">
                    <p className="text-base font-bold text-brand">
                      +₹{payment.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-5 text-base font-semibold">No payments found</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
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