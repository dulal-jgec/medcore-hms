"use client";

import Link from "next/link";
import {
  Users,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  CalendarCheck,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertCircle,
  BedDouble,
  Activity,
  Sparkles,
  CheckCircle2,
  Plus,
  ChevronRight,
  UserPlus,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  HOSPITAL,
  HOSPITAL_STATS,
  ALL_DOCTORS,
  RECENT_ACTIVITY,
  REVENUE_LAST_7_DAYS,
} from "@/lib/admin-mock-data";

export default function AdminDashboard() {
  const s = HOSPITAL_STATS;
  const activeDoctors = ALL_DOCTORS.filter((d) => d.status === "ACTIVE");
  const suspendedDoctors = ALL_DOCTORS.filter((d) => d.status === "SUSPENDED");

  const maxRevenue = Math.max(...REVENUE_LAST_7_DAYS.map((d) => d.value));
  const totalRevenue = REVENUE_LAST_7_DAYS.reduce((sum, d) => sum + d.value, 0);

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
              <span>{HOSPITAL.name}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, Admin 🏥
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {s.appointmentsToday - s.appointmentsCompleted} appointments
              </span>{" "}
              pending today, and{" "}
              <span className="font-semibold text-primary-foreground">
                {s.pendingBills} bills
              </span>{" "}
              awaiting payment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/admin/doctors/new">
                 
                Add doctor
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/admin/reports">View reports</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ ALERT BANNERS ══════════ */}
      {(s.criticalPatients > 0 || suspendedDoctors.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {s.criticalPatients > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">
                  {s.criticalPatients} critical patients
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Require immediate attention
                </p>
              </div>
              <Link
                href="/portal/admin/patients"
                className="shrink-0 text-xs font-medium text-destructive hover:underline"
              >
                View
              </Link>
            </div>
          )}

          {suspendedDoctors.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/40 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-highlight-soft-foreground" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-highlight-soft-foreground">
                  {suspendedDoctors.length} suspended doctor
                  {suspendedDoctors.length > 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pending review
                </p>
              </div>
              <Link
                href="/portal/admin/doctors?status=SUSPENDED"
                className="shrink-0 text-xs font-medium text-highlight-soft-foreground hover:underline"
              >
                Review
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TOP STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Appointments today"
          value={s.appointmentsToday}
          sub={`${s.appointmentsCompleted} completed`}
          href="/portal/admin/appointments"
          accent
        />
        <StatCard
          icon={Wallet}
          label="Revenue today"
          value={`₹${(s.revenueToday / 1000).toFixed(1)}K`}
          sub={`₹${(s.revenueThisMonth / 100000).toFixed(1)}L this month`}
          href="/portal/admin/billing"
          trend="up"
        />
        <StatCard
          icon={Users}
          label="Total patients"
          value={s.totalPatients.toLocaleString("en-IN")}
          sub={`+${s.newPatientsThisMonth} new this month`}
          href="/portal/admin/patients"
          trend="up"
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={s.totalDoctors}
          sub={`${s.activeDoctors} active`}
          href="/portal/admin/doctors"
        />
      </div>

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue chart (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Revenue overview
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last 7 days · ₹{(totalRevenue / 100000).toFixed(2)}L total
                </p>
              </div>
              <Link
                href="/portal/admin/billing"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View details
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5">
              {/* Chart */}
              <div className="flex h-48 items-end gap-3">
                {REVENUE_LAST_7_DAYS.map((d) => {
                  const height = (d.value / maxRevenue) * 100;
                  const isToday =
                    d.day ===
                    new Date().toLocaleString("en-IN", {
                      weekday: "short",
                    });
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={cn(
                            "w-full rounded-t-lg transition-all hover:opacity-80",
                            isToday
                              ? "bg-brand"
                              : "bg-brand-soft"
                          )}
                          style={{ height: `${height}%` }}
                          title={`₹${d.value.toLocaleString("en-IN")}`}
                        />
                      </div>
                      <p
                        className={cn(
                          "text-[10px] font-medium",
                          isToday
                            ? "text-brand"
                            : "text-muted-foreground"
                        )}
                      >
                        {d.day}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom stats */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Avg daily
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-tight">
                    ₹{Math.round(totalRevenue / 7 / 1000)}K
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Peak day
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-tight">
                    ₹{Math.round(maxRevenue / 1000)}K
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Trend
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-lg font-bold tracking-tight text-brand">
                    <TrendingUp className="h-4 w-4" />
                    +18%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital snapshot (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Hospital snapshot
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {HOSPITAL.type}
            </p>
          </div>

          <ul className="divide-y divide-border">
            <SnapshotRow
              icon={BedDouble}
              label="Beds"
              value={HOSPITAL.beds}
            />
            <SnapshotRow
              icon={Building2}
              label="Departments"
              value={s.departmentsCount}
            />
            <SnapshotRow
              icon={Stethoscope}
              label="Doctors"
              value={s.totalDoctors}
            />
            <SnapshotRow
              icon={HeartPulse}
              label="Nurses"
              value={s.totalNurses}
            />
            <SnapshotRow
              icon={ClipboardList}
              label="Receptionists"
              value={s.totalReceptionists}
            />
          </ul>

          <div className="border-t border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bed occupancy
              </p>
              <p className="text-sm font-bold">{s.occupancy}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${s.occupancy}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {Math.round((s.occupancy * HOSPITAL.beds) / 100)} of{" "}
              {HOSPITAL.beds} beds occupied
            </p>
          </div>
        </div>
      </div>

      {/* ══════════ STAFF SECTION ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <StaffCard
          icon={Stethoscope}
          label="Doctors"
          total={s.totalDoctors}
          active={s.activeDoctors}
          href="/portal/admin/doctors"
          accent
        />
        <StaffCard
          icon={HeartPulse}
          label="Nurses"
          total={s.totalNurses}
          active={s.totalNurses - 3}
          href="/portal/admin/nurses"
        />
        <StaffCard
          icon={ClipboardList}
          label="Receptionists"
          total={s.totalReceptionists}
          active={s.totalReceptionists}
          href="/portal/admin/receptionists"
        />
      </div>

      {/* ══════════ ACTIVITY + QUICK ACTIONS ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent activity (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Recent activity
                </h2>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {RECENT_ACTIVITY.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-hover/40 sm:p-5"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      item.type === "doctor_status"
                        ? "bg-highlight-soft text-highlight-soft-foreground"
                        : item.type === "bill_paid"
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.type === "doctor_added" && (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {item.type === "patient_registered" && (
                      <Users className="h-4 w-4" />
                    )}
                    {item.type === "bill_paid" && (
                      <Wallet className="h-4 w-4" />
                    )}
                    {item.type === "doctor_status" && (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {item.type === "department" && (
                      <Building2 className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] text-muted-foreground">
                    {item.time}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick actions (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Quick actions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Common admin tasks
            </p>
          </div>

          <div className="p-3">
            <ActionItem
              icon={UserPlus}
              label="Add doctor"
              desc="Onboard new specialist"
              href="/portal/admin/doctors/new"
              accent
            />
            <ActionItem
              icon={Users}
              label="Register patient"
              desc="Add new patient record"
              href="/portal/admin/patients/new"
            />
            <ActionItem
              icon={Building2}
              label="Add department"
              desc="Create new unit"
              href="/portal/admin/departments/new"
            />
            <ActionItem
              icon={BarChart3}
              label="View reports"
              desc="Revenue & operations"
              href="/portal/admin/reports"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, trend }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
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

function SnapshotRow({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </li>
  );
}

function StaffCard({ icon: Icon, label, total, active, href, accent }) {
  const inactive = total - active;

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight">{total}</p>
        <p className="text-sm text-muted-foreground">{label.toLowerCase()}</p>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          {active} active
        </span>
        {inactive > 0 && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            {inactive} inactive
          </span>
        )}
      </div>
    </Link>
  );
}

function ActionItem({ icon: Icon, label, desc, href, accent }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-hover"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}