"use client";

import { useState } from "react";
import {
  Wallet,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  Receipt,
  CreditCard,
  ChevronDown,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BILLS } from "@/lib/patient-mock-data";

export default function PatientBillsPage() {
  const [tab, setTab] = useState("pending");
  const [openId, setOpenId] = useState(null);
  const [payOpen, setPayOpen] = useState(null);

  const pending = BILLS.filter((b) => b.status === "pending");
  const paid = BILLS.filter((b) => b.status === "paid");

  const bills = tab === "pending" ? pending : paid;

  const totalPending = pending.reduce((s, b) => s + b.total, 0);
  const totalPaid = paid.reduce((s, b) => s + b.total, 0);

  const tabs = [
    { id: "pending", label: "Pending", count: pending.length },
    { id: "paid", label: "Paid", count: paid.length },
  ];

  const billToPay = BILLS.find((b) => b.id === payOpen);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Bills & Payments
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My bills
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View invoices, download receipts, and pay pending bills.
        </p>
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="Pending amount"
          value={`₹${totalPending}`}
          accent={totalPending > 0}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Total paid"
          value={`₹${totalPaid}`}
        />
        <SummaryCard
          icon={Receipt}
          label="Total invoices"
          value={BILLS.length}
        />
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Bill filters">
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
        {bills.length > 0 ? (
          bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              isOpen={openId === bill.id}
              onToggle={() => setOpenId(openId === bill.id ? null : bill.id)}
              onPay={() => setPayOpen(bill.id)}
            />
          ))
        ) : (
          <EmptyState tab={tab} />
        )}
      </div>

      {/* Payment modal — simple */}
      {billToPay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPayOpen(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    Pay invoice
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {billToPay.invoiceNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayOpen(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total amount
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                ₹{billToPay.total}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose payment method
              </p>
              {["UPI", "Credit / Debit Card", "Net Banking"].map((method) => (
                <button
                  key={method}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-hover/40"
                >
                  {method}
                  <span className="text-xs text-muted-foreground">
                    Select →
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Demo — payment gateway will be integrated with the backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function BillCard({ bill, isOpen, onToggle, onPay }) {
  const isPending = bill.status === "pending";
  const issuedDate = new Date(bill.issuedOn);

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
        {/* Icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isPending
              ? "bg-destructive/10 text-destructive"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Receipt className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {bill.description}
            </h3>
            <StatusPill status={bill.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              {bill.invoiceNo}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {issuedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {isPending && bill.dueDate && (
              <span className="font-medium text-destructive">
                Due {bill.dueDate}
              </span>
            )}
          </div>
        </div>

        {/* Amount + chevron */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-bold tracking-tight">₹{bill.total}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {bill.items.length} item{bill.items.length > 1 ? "s" : ""}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded details */}
      {isOpen && (
        <div className="border-t border-border">
          <div className="p-5 sm:p-6">
            {/* Items breakdown */}
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Invoice breakdown
            </h4>

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              {bill.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">₹{item.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 bg-muted/40 px-4 py-3 text-sm">
                <span className="font-semibold">Total</span>
                <span className="text-base font-bold">₹{bill.total}</span>
              </div>
            </div>

            {/* Payment info (paid) */}
            {!isPending && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-brand-soft/30 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
                    Payment received
                  </p>
                  <p className="mt-1 text-sm">
                    Paid on {bill.paidOn} via {bill.paymentMethod}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              {isPending ? (
                <>
                  <Button size="sm" onClick={onPay}>
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Pay now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download invoice
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download receipt
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: {
      label: "Pending",
      icon: AlertCircle,
      class: "bg-destructive/10 text-destructive",
    },
    paid: {
      label: "Paid",
      icon: CheckCircle2,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
  };
  const config = map[status] || map.pending;
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
              ? "bg-destructive/10 text-destructive"
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
        <Receipt className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">
        {tab === "pending" ? "No pending bills" : "No paid bills"}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {tab === "pending"
          ? "You're all caught up!"
          : "Your payment history will appear here."}
      </p>
    </div>
  );
}