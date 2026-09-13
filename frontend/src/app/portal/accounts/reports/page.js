"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Wallet,
  Receipt,
  CheckCircle2,
  Clock,
  Filter,
  Printer,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ALL_ACCOUNTANT_BILLS,
  MONTHLY_REVENUE,
  PAYMENT_METHODS,
} from "@/lib/accountant-mock-data";

const PRESET_RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "6m", label: "Last 6 months" },
  { id: "custom", label: "Custom range" },
];

const REPORT_TYPES = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "department", label: "By Department", icon: Filter },
  { id: "method", label: "By Method", icon: Wallet },
  { id: "status", label: "By Status", icon: CheckCircle2 },
];

export default function AccountantReportsPage() {
  const [range, setRange] = useState("30d");
  const [reportType, setReportType] = useState("summary");
  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState("2026-09-13");

  // Compute report data from mock bills
  const reportData = useMemo(() => {
    const total = ALL_ACCOUNTANT_BILLS.reduce((s, b) => s + b.amount, 0);
    const paid = ALL_ACCOUNTANT_BILLS.reduce((s, b) => s + (b.paid || 0), 0);
    const outstanding = total - paid;
    const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;

    // By department
    const deptMap = {};
    ALL_ACCOUNTANT_BILLS.forEach((b) => {
      if (!deptMap[b.department]) {
        deptMap[b.department] = { billed: 0, paid: 0, count: 0 };
      }
      deptMap[b.department].billed += b.amount;
      deptMap[b.department].paid += b.paid || 0;
      deptMap[b.department].count += 1;
    });

    const byDepartment = Object.entries(deptMap)
      .map(([name, data]) => ({
        name,
        ...data,
        outstanding: data.billed - data.paid,
      }))
      .sort((a, b) => b.billed - a.billed);

    // By status
    const statusCounts = {
      PAID: { count: 0, amount: 0 },
      PENDING: { count: 0, amount: 0 },
      PARTIALLY_PAID: { count: 0, amount: 0 },
      CANCELLED: { count: 0, amount: 0 },
    };
    ALL_ACCOUNTANT_BILLS.forEach((b) => {
      statusCounts[b.status].count += 1;
      statusCounts[b.status].amount += b.amount;
    });

    return {
      total,
      paid,
      outstanding,
      collectionRate,
      byDepartment,
      byStatus: statusCounts,
      invoiceCount: ALL_ACCOUNTANT_BILLS.length,
    };
  }, []);

  const maxDeptAmount = Math.max(
    ...reportData.byDepartment.map((d) => d.billed)
  );
  const totalMethods = PAYMENT_METHODS.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Financial reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate, view, and download financial summaries.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
          <Button>
            <Download className="mr-1.5 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-semibold tracking-tight">
              Report filters
            </h2>
          </div>
        </div>

        <div className="p-5">
          {/* Preset range */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date range
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_RANGES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRange(id)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-medium transition-colors",
                    range === id
                      ? "bg-brand text-brand-foreground"
                      : "bg-muted text-muted-foreground hover:bg-hover hover:text-hover-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range inputs */}
          {range === "custom" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  From date
                </label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  To date
                </label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          )}

          {/* Report type */}
          <div className="mt-5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Report type
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {REPORT_TYPES.map(({ id, label, icon: Icon }) => {
                const active = reportType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setReportType(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                      active
                        ? "border-brand bg-brand-soft text-brand-soft-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:bg-hover/40"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex justify-end border-t border-border pt-5">
            <Button>
              <FileText className="mr-1.5 h-4 w-4" />
              Generate report
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Receipt}
          label="Total billed"
          value={`₹${(reportData.total / 100000).toFixed(2)}L`}
          sub={`${reportData.invoiceCount} invoices`}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Total collected"
          value={`₹${(reportData.paid / 100000).toFixed(2)}L`}
          sub={`${reportData.collectionRate}% of billed`}
          accent
        />
        <KpiCard
          icon={Clock}
          label="Outstanding"
          value={`₹${(reportData.outstanding / 100000).toFixed(2)}L`}
          sub="Not yet collected"
          alert
        />
        <KpiCard
          icon={TrendingUp}
          label="Collection rate"
          value={`${reportData.collectionRate}%`}
          sub="For selected period"
        />
      </div>

      {/* Report body — varies by reportType */}
      {reportType === "summary" && (
        <SummaryReport reportData={reportData} />
      )}
      {reportType === "department" && (
        <DepartmentReport
          byDepartment={reportData.byDepartment}
          maxDeptAmount={maxDeptAmount}
        />
      )}
      {reportType === "method" && (
        <MethodReport totalMethods={totalMethods} />
      )}
      {reportType === "status" && (
        <StatusReport byStatus={reportData.byStatus} />
      )}
    </div>
  );
}

/* ══════════ Report Views ══════════ */

function SummaryReport({ reportData }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Monthly trend */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            Monthly revenue trend
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Billed vs collected over 6 months
          </p>
        </div>

        <div className="p-5">
          <div className="flex h-52 items-end gap-3">
            {MONTHLY_REVENUE.map((m) => {
              const max = Math.max(...MONTHLY_REVENUE.map((x) => x.billed));
              const billedH = (m.billed / max) * 100;
              const collectedH = (m.collected / max) * 100;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t-md bg-brand"
                      style={{ height: `${billedH}%` }}
                    />
                    <div
                      className="w-1/2 rounded-t-md bg-brand-soft"
                      style={{ height: `${collectedH}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {m.month}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs">
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
      </div>

      {/* Snapshot */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight">
            Period snapshot
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Summary metrics for the selected range
          </p>
        </div>

        <ul className="divide-y divide-border">
          <SnapshotRow
            icon={Receipt}
            label="Invoices issued"
            value={reportData.invoiceCount}
          />
          <SnapshotRow
            icon={Wallet}
            label="Amount billed"
            value={`₹${reportData.total.toLocaleString("en-IN")}`}
          />
          <SnapshotRow
            icon={CheckCircle2}
            label="Amount collected"
            value={`₹${reportData.paid.toLocaleString("en-IN")}`}
            accent
          />
          <SnapshotRow
            icon={Clock}
            label="Amount outstanding"
            value={`₹${reportData.outstanding.toLocaleString("en-IN")}`}
            alert
          />
          <SnapshotRow
            icon={TrendingUp}
            label="Collection rate"
            value={`${reportData.collectionRate}%`}
          />
        </ul>
      </div>
    </div>
  );
}

function DepartmentReport({ byDepartment, maxDeptAmount }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Revenue by department
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Billed, collected, and outstanding per department
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3 text-right">Invoices</th>
              <th className="px-5 py-3 text-right">Billed</th>
              <th className="px-5 py-3 text-right">Collected</th>
              <th className="px-5 py-3 text-right">Outstanding</th>
              <th className="px-5 py-3">Collection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {byDepartment.map((dept) => {
              const rate =
                dept.billed > 0 ? (dept.paid / dept.billed) * 100 : 0;
              return (
                <tr
                  key={dept.name}
                  className="transition-colors hover:bg-hover/40"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium">{dept.name}</span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-muted-foreground">
                    {dept.count}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold">
                    ₹{(dept.billed / 1000).toFixed(0)}K
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-brand">
                    ₹{(dept.paid / 1000).toFixed(0)}K
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-destructive">
                    ₹{(dept.outstanding / 1000).toFixed(0)}K
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border sm:hidden">
        {byDepartment.map((dept) => {
          const rate = dept.billed > 0 ? (dept.paid / dept.billed) * 100 : 0;
          return (
            <div key={dept.name} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dept.count} invoices
                  </p>
                </div>
                <p className="text-sm font-bold">
                  ₹{(dept.billed / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Collected</p>
                  <p className="mt-0.5 font-semibold text-brand">
                    ₹{(dept.paid / 1000).toFixed(0)}K
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Outstanding</p>
                  <p className="mt-0.5 font-semibold text-destructive">
                    ₹{(dept.outstanding / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MethodReport({ totalMethods }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Collection by payment method
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How patients paid during the selected period
        </p>
      </div>

      <div className="p-5">
        <div className="space-y-5">
          {PAYMENT_METHODS.map((m) => {
            const share = (m.amount / totalMethods) * 100;
            return (
              <div key={m.method}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground text-xs font-bold">
                      {m.method.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{m.method}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      ₹{(m.amount / 100000).toFixed(2)}L
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {share.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total transactions
            </p>
            <p className="mt-1 text-lg font-bold">
              {PAYMENT_METHODS.reduce((s, m) => s + m.transactions, 0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total collected
            </p>
            <p className="mt-1 text-lg font-bold">
              ₹{(totalMethods / 100000).toFixed(2)}L
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Avg. transaction
            </p>
            <p className="mt-1 text-lg font-bold">
              ₹
              {Math.round(
                totalMethods /
                  PAYMENT_METHODS.reduce((s, m) => s + m.transactions, 0)
              ).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusReport({ byStatus }) {
  const items = [
    { key: "PAID", label: "Paid", color: "bg-brand", text: "text-brand" },
    {
      key: "PENDING",
      label: "Pending",
      color: "bg-destructive",
      text: "text-destructive",
    },
    {
      key: "PARTIALLY_PAID",
      label: "Partially paid",
      color: "bg-highlight",
      text: "text-highlight-soft-foreground",
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      color: "bg-muted-foreground",
      text: "text-muted-foreground",
    },
  ];

  const total = Object.values(byStatus).reduce((s, x) => s + x.count, 0);
  const totalAmount = Object.values(byStatus).reduce((s, x) => s + x.amount, 0);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Invoices by status
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Breakdown of the {total} invoices in this period
        </p>
      </div>

      <div className="p-5">
        {/* Horizontal stacked bar */}
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {items.map(({ key, color }) => {
            const pct = (byStatus[key].count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className={cn("h-full", color)}
                style={{ width: `${pct}%` }}
                title={`${byStatus[key].count} invoices`}
              />
            );
          })}
        </div>

        {/* Status grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map(({ key, label, color, text }) => {
            const count = byStatus[key].count;
            const amount = byStatus[key].amount;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div
                key={key}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", color)} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">
                  {count}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pct.toFixed(1)}% of invoices
                </p>
                <p className={cn("mt-2 text-sm font-semibold", text)}>
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total invoices
            </p>
            <p className="mt-1 text-lg font-bold">{total}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total amount
            </p>
            <p className="mt-1 text-lg font-bold">
              ₹{(totalAmount / 100000).toFixed(2)}L
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function SnapshotRow({ icon: Icon, label, value, accent, alert }) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-4">
      <dt className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Icon
          className={cn(
            "h-4 w-4",
            accent
              ? "text-brand"
              : alert
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        />
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm font-semibold",
          accent && "text-brand",
          alert && "text-destructive"
        )}
      >
        {value}
      </dd>
    </li>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent, alert }) {
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