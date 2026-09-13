"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  Stethoscope,
  Star,
  Download,
  ArrowUpRight,
  Clock,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  REVENUE_BY_DEPARTMENT,
  PATIENT_TREND_6_MONTHS,
  APPOINTMENT_STATUS_BREAKDOWN,
  TOP_DOCTORS,
  getBillingStats,
} from "@/lib/admin-mock-data";

const RANGE_TABS = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "30 days" },
  { id: "6m", label: "6 months" },
];

export default function AdminReportsPage() {
  const [range, setRange] = useState("6m");
  const billing = getBillingStats();

  const maxRevenue = Math.max(...REVENUE_BY_DEPARTMENT.map((d) => d.value));
  const totalDeptRevenue = REVENUE_BY_DEPARTMENT.reduce((s, d) => s + d.value, 0);

  const maxPatients = Math.max(...PATIENT_TREND_6_MONTHS.map((m) => m.newPatients));
  const maxAppointments = Math.max(
    ...PATIENT_TREND_6_MONTHS.map((m) => m.appointments)
  );

  const totalAppointments = APPOINTMENT_STATUS_BREAKDOWN.reduce(
    (s, a) => s + a.value,
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Analytics
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Reports & insights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hospital-wide performance across revenue, patients, and staff.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-1.5 h-4 w-4" />
          Export report
        </Button>
      </div>

      {/* Range tabs */}
      <div className="mt-6 flex items-center gap-1 rounded-lg border border-border bg-background p-1 sm:w-fit">
        {RANGE_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setRange(id)}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors",
              range === id
                ? "bg-brand-soft text-brand-soft-foreground"
                : "text-muted-foreground hover:bg-hover hover:text-hover-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label="Total revenue"
          value={`₹${(billing.totalRevenue / 100000).toFixed(2)}L`}
          trend="+18%"
          trendUp
          accent
        />
        <KpiCard
          icon={CalendarCheck}
          label="Appointments"
          value="1,075"
          trend="+12%"
          trendUp
        />
        <KpiCard
          icon={Users}
          label="New patients"
          value="732"
          trend="+24%"
          trendUp
        />
        <KpiCard
          icon={Star}
          label="Avg. satisfaction"
          value="4.8"
          trend="+0.1"
          trendUp
        />
      </div>

      {/* Revenue by department + Appointment breakdown */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue by department (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold tracking-tight">
                Revenue by department
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                ₹{(totalDeptRevenue / 100000).toFixed(2)}L total · {range === "6m" ? "Last 6 months" : range === "30d" ? "Last 30 days" : "Last 7 days"}
              </p>
            </div>

            <div className="space-y-4 p-5">
              {REVENUE_BY_DEPARTMENT.map((dept) => {
                const pct = (dept.value / maxRevenue) * 100;
                const sharePct = (dept.value / totalDeptRevenue) * 100;
                return (
                  <div key={dept.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {sharePct.toFixed(1)}%
                        </span>
                        <span className="font-semibold">
                          ₹{(dept.value / 100000).toFixed(2)}L
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
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

        {/* Appointment breakdown (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Appointments
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalAppointments.toLocaleString("en-IN")} total
            </p>
          </div>

          <div className="p-5">
            {/* Bar breakdown */}
            <div className="space-y-3">
              {APPOINTMENT_STATUS_BREAKDOWN.map((item) => {
                const pct = (item.value / totalAppointments) * 100;
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.status}
                      </span>
                      <span className="font-medium">
                        {item.value} · {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total circle visual */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-brand-soft">
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tight">
                    {(
                      (APPOINTMENT_STATUS_BREAKDOWN[0].value / totalAppointments) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient trend chart */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Patient & appointment trend
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monthly comparison over {PATIENT_TREND_6_MONTHS.length} months
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-brand" />
              Appointments
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-highlight" />
              New patients
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex h-64 items-end gap-3 sm:gap-4">
            {PATIENT_TREND_6_MONTHS.map((m) => {
              const apptHeight = (m.appointments / maxAppointments) * 100;
              const patHeight = (m.newPatients / maxAppointments) * 100 * 8; // scale up
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t-md bg-brand transition-all hover:opacity-80"
                      style={{ height: `${apptHeight}%` }}
                      title={`${m.appointments} appointments`}
                    />
                    <div
                      className="w-1/4 rounded-t-md bg-highlight transition-all hover:opacity-80"
                      style={{ height: `${Math.min(patHeight, 100)}%` }}
                      title={`${m.newPatients} new patients`}
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
              label="Total appointments"
              value={PATIENT_TREND_6_MONTHS.reduce(
                (s, m) => s + m.appointments,
                0
              ).toLocaleString("en-IN")}
            />
            <FooterStat
              label="Total new patients"
              value={PATIENT_TREND_6_MONTHS.reduce(
                (s, m) => s + m.newPatients,
                0
              ).toLocaleString("en-IN")}
            />
            <FooterStat
              label="Avg per month"
              value={Math.round(
                PATIENT_TREND_6_MONTHS.reduce(
                  (s, m) => s + m.appointments,
                  0
                ) / PATIENT_TREND_6_MONTHS.length
              ).toLocaleString("en-IN")}
            />
          </div>
        </div>
      </div>

      {/* Top doctors */}
      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-brand" />
            <h2 className="text-base font-semibold tracking-tight">
              Top performing doctors
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ranked by appointments and revenue
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Doctor</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Appointments</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TOP_DOCTORS.map((doc, i) => (
                <tr key={doc.name} className="transition-colors hover:bg-hover/40">
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
                        i === 0
                          ? "bg-highlight text-highlight-foreground"
                          : i === 1
                          ? "bg-muted text-foreground"
                          : i === 2
                          ? "bg-brand-soft text-brand-soft-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                        {doc.name.replace("Dr. ", "").charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {doc.department}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold">
                    {doc.appointments}
                  </td>
                  <td className="px-5 py-4 text-right text-sm font-semibold">
                    ₹{(doc.revenue / 1000).toFixed(0)}K
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="h-3 w-3 fill-highlight text-highlight" />
                      {doc.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-border sm:hidden">
          {TOP_DOCTORS.map((doc, i) => (
            <div key={doc.name} className="flex items-center gap-3 p-4">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                  i === 0
                    ? "bg-highlight text-highlight-foreground"
                    : i === 1
                    ? "bg-muted text-foreground"
                    : i === 2
                    ? "bg-brand-soft text-brand-soft-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {doc.department}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{doc.appointments}</p>
                <p className="text-[10px] text-muted-foreground">appts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function KpiCard({ icon: Icon, label, value, trend, trendUp, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex items-center justify-between">
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
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            trendUp
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {trendUp && <TrendingUp className="h-3 w-3" />}
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function FooterStat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}