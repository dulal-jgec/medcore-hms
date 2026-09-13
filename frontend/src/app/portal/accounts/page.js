"use client";

import Link from "next/link";
import {
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  Shield,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCOUNTANT_PROFILE,
  FINANCIAL_SUMMARY,
  PAYMENT_METHODS,
  RECENT_PAYMENTS,
  MONTHLY_REVENUE,
  ALL_ACCOUNTANT_BILLS,
  getOutstandingBills,
  getAccountantStats,
} from "@/lib/accountant-mock-data";

const METHOD_ICONS = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
  "Net Banking": Building,
  Insurance: Shield,
};

const METHOD_LABEL = {
  UPI: "UPI",
  CARD: "Card",
  CASH: "Cash",
  NET_BANKING: "Net Banking",
  INSURANCE: "Insurance",
};

export default function AccountantDashboard() {
  const stats = getAccountantStats();
  const outstandingBills = getOutstandingBills().slice(0, 4);
  const recentPayments = RECENT_PAYMENTS.slice(0, 5);

  const maxMethodAmount = Math.max(...PAYMENT_METHODS.map((m) => m.amount));
  const maxRevenue = Math.max(...MONTHLY_REVENUE.map((m) => m.billed));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>{today}</span>
              <span className="opacity-40">·</span>
              <span>Finance & Accounts</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {ACCOUNTANT_PROFILE.fullName.split(" ")[0]} 💼
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                ₹{(stats.totalOutstanding / 100000).toFixed(1)}L outstanding
              </span>{" "}
              across{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.outstandingCount} bills
              </span>{" "}
              waiting for payment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/accounts/outstanding">
                <AlertCircle className="mr-1.5 h-4 w-4" />
                View outstanding
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/accounts/reports">
                <Download className="mr-1.5 h-4 w-4" />
                Financial report
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ TOP STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Receipt}
          label="Total billed"
          value={`₹${(stats.totalBilled / 100000).toFixed(2)}L`}
          sub={`${stats.totalBills} invoices total`}
          href="/portal/accounts/bills"
          accent
        />
        <StatCard
          icon={CheckCircle2}
          label="Collected"
          value={`₹${(stats.totalCollected / 100000).toFixed(2)}L`}
          sub={`${stats.collectionRate}% collection rate`}
          href="/portal/accounts/payments"
          trend="up"
        />
        <StatCard
          icon={Clock}
          label="Outstanding"
          value={`₹${(stats.totalOutstanding / 100000).toFixed(2)}L`}
          sub={`${stats.outstandingCount} bills pending`}
          href="/portal/accounts/outstanding"
          alert
        />
        <StatCard
          icon={TrendingUp}
          label="Today's collection"
          value="₹18,490"
          sub="+12% vs yesterday"
          href="/portal/accounts/payments"
          trend="up"
        />
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue trend chart (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Billed vs Collected
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last 6 months · Revenue comparison
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-brand" />
                  Billed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-brand-soft" />
                  Collected
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex h-56 items-end gap-3 sm:gap-4">
                {MONTHLY_REVENUE.map((m) => {
                  const billedHeight = (m.billed / maxRevenue) * 100;
                  const collectedHeight = (m.collected / maxRevenue) * 100;
                  return (
                    <div
                      key={m.month}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-full w-full items-end justify-center gap-1">
                        <div
                          className="w-1/2 rounded-t-md bg-brand transition-all hover:opacity-80"
                          style={{ height: `${billedHeight}%` }}
                          title={`Billed: ₹${(m.billed / 1000).toFixed(0)}K`}
                        />
                        <div
                          className="w-1/2 rounded-t-md bg-brand-soft transition-all hover:opacity-80"
                          style={{ height: `${collectedHeight}%` }}
                          title={`Collected: ₹${(m.collected / 1000).toFixed(0)}K`}
                        />
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {m.month}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Footer stats */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
                <FooterStat
                  label="Total billed"
                  value={`₹${(
                    MONTHLY_REVENUE.reduce((s, m) => s + m.billed, 0) / 100000
                  ).toFixed(2)}L`}
                />
                <FooterStat
                  label="Total collected"
                  value={`₹${(
                    MONTHLY_REVENUE.reduce((s, m) => s + m.collected, 0) / 100000
                  ).toFixed(2)}L`}
                  accent
                />
                <FooterStat
                  label="Avg. collection"
                  value={`${Math.round(
                    (MONTHLY_REVENUE.reduce((s, m) => s + m.collected, 0) /
                      MONTHLY_REVENUE.reduce((s, m) => s + m.billed, 0)) *
                      100
                  )}%`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment method breakdown (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Payment methods
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How patients are paying
            </p>
          </div>

          <div className="space-y-4 p-5">
            {PAYMENT_METHODS.map((method) => {
              const Icon = METHOD_ICONS[method.method] || CreditCard;
              const pct = (method.amount / maxMethodAmount) * 100;
              const totalAmount = PAYMENT_METHODS.reduce(
                (s, m) => s + m.amount,
                0
              );
              const share = (method.amount / totalAmount) * 100;

              return (
                <div key={method.method}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{method.method}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {method.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ₹{(method.amount / 100000).toFixed(2)}L
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {share.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════ OUTSTANDING + RECENT PAYMENTS ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Outstanding bills */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h2 className="text-base font-semibold tracking-tight">
                Outstanding bills
              </h2>
            </div>
            <Link
              href="/portal/accounts/outstanding"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {outstandingBills.map((bill) => {
              const paidAmount = bill.paid || 0;
              const remaining = bill.amount - paidAmount;
              const isPartial = bill.status === "PARTIALLY_PAID";

              return (
                <li
                  key={bill.id}
                  className="flex items-start gap-4 p-5 transition-colors hover:bg-hover/40"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isPartial
                        ? "bg-highlight-soft text-highlight-soft-foreground"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    <Receipt className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {bill.patientName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {bill.invoiceNo} · Due {bill.dueDate}
                    </p>
                    {isPartial && (
                      <p className="mt-1 text-[10px] font-medium text-highlight-soft-foreground">
                        ₹{paidAmount.toLocaleString("en-IN")} paid of ₹
                        {bill.amount.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-destructive">
                      ₹{remaining.toLocaleString("en-IN")}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {isPartial ? "remaining" : "due"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Recent payments */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Recent payments
              </h2>
            </div>
            <Link
              href="/portal/accounts/payments"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {recentPayments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-start gap-4 p-5 transition-colors hover:bg-hover/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {payment.patientName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {payment.invoiceNo} · {payment.receivedOn}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-brand">
                    +₹{payment.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    via {METHOD_LABEL[payment.method] || payment.method}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Common accounting tasks
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={Wallet}
            label="Record payment"
            desc="Add a manual payment"
            href="/portal/accounts/payments/new"
            accent
          />
          <ActionTile
            icon={Receipt}
            label="All bills"
            desc="Browse invoices"
            href="/portal/accounts/bills"
          />
          <ActionTile
            icon={AlertCircle}
            label="Outstanding"
            desc={`${stats.outstandingCount} pending`}
            href="/portal/accounts/outstanding"
            alert
          />
          <ActionTile
            icon={TrendingUp}
            label="Reports"
            desc="Financial analysis"
            href="/portal/accounts/reports"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, alert, trend }) {
  const iconStyle = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconStyle
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 flex items-center gap-1 truncate text-[11px]",
          trend === "up" ? "text-brand" : "text-muted-foreground"
        )}
      >
        {trend === "up" && <TrendingUp className="h-3 w-3 shrink-0" />}
        {sub}
      </p>
    </Link>
  );
}

function FooterStat({ label, value, accent }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tracking-tight",
          accent && "text-brand"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ActionTile({ icon: Icon, label, desc, href, accent, alert }) {
  const iconStyle = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          iconStyle
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}