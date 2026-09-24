"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  CalendarCheck,
  Wallet,
  Building2,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Activity,
  Sparkles,
  ChevronRight,
  UserPlus,
  BarChart3,
  Phone,
  MapPin,
  Globe,
  Mail,
  ArrowRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getHospitalProfile } from "@/services/hospital-admin.service";
import { getDoctors } from "@/services/doctor.service";
import { getNurses } from "@/services/nurse.service";
import { getReceptionists } from "@/services/receptionist.service";

// Temporary mock data — replace when the corresponding backend endpoints exist
import {
  HOSPITAL_STATS,
  RECENT_ACTIVITY,
  REVENUE_LAST_7_DAYS,
} from "@/lib/admin-mock-data";

export default function AdminDashboard() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [hospital, setHospital] = useState(null);
  const [staff, setStaff] = useState({
    doctors: [],
    nurses: [],
    receptionists: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, doctorsRes, nursesRes, receptionistsRes] =
          await Promise.all([
            getHospitalProfile(accessToken),
            getDoctors(accessToken, {
              page: 0,
              size: 50,
              sortBy: "id",
              sortDir: "asc",
            }),
            getNurses(accessToken, {
              page: 0,
              size: 50,
              sortBy: "id",
              sortDir: "asc",
            }),
            getReceptionists({
              page: 0,
              size: 50,
              sortBy: "createdAt",
              sortDir: "desc",
            }),
          ]);

        setHospital(profileRes.data);
        setStaff({
          doctors: doctorsRes.data?.items || [],
          nurses: nursesRes.data?.items || nursesRes.data || [],
          receptionists: receptionistsRes.data?.items || [],
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [accessToken]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="font-semibold text-destructive">
                Unable to load dashboard
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <Button
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hospital) return null;

  const doctorStats = countByStatus(staff.doctors);
  const nurseStats = countByStatus(staff.nurses);
  const receptionistStats = countByStatus(staff.receptionists);

  const s = HOSPITAL_STATS;
  const maxRevenue = Math.max(...REVENUE_LAST_7_DAYS.map((item) => item.value));
  const totalRevenue = REVENUE_LAST_7_DAYS.reduce(
    (sum, item) => sum + item.value,
    0
  );

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
      <Hero
        hospital={hospital}
        user={user}
        greeting={greeting}
        today={today}
        stats={s}
      />

      {doctorStats.suspended > 0 && (
        <div className="mt-6">
          <AlertCard
            tone="warning"
            icon={AlertCircle}
            title={`${doctorStats.suspended} suspended doctor${
              doctorStats.suspended > 1 ? "s" : ""
            }`}
            description="Pending account review"
            href="/portal/admin/doctors"
            cta="Review"
          />
        </div>
      )}

      <TopStats stats={s} doctorStats={doctorStats} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <RevenueChart
          data={REVENUE_LAST_7_DAYS}
          maxRevenue={maxRevenue}
          totalRevenue={totalRevenue}
        />
        <HospitalSnapshot hospital={hospital} />
      </div>

      <StaffOverview
        doctors={doctorStats}
        nurses={nurseStats}
        receptionists={receptionistStats}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <RecentActivity items={RECENT_ACTIVITY} />
        <QuickActions />
      </div>
    </div>
  );
}

function countByStatus(list) {
  return {
    total: list.length,
    active: list.filter((x) => x.status === "ACTIVE").length,
    inactive: list.filter((x) => x.status === "INACTIVE").length,
    suspended: list.filter((x) => x.status === "SUSPENDED").length,
  };
}

/* ══════════ HERO ══════════ */

function Hero({ hospital, user, greeting, today, stats }) {
  const pendingAppointments =
    stats.appointmentsToday - stats.appointmentsCompleted;
  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  return (
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
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary-foreground/70">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>{today}</span>
            <span className="opacity-40">·</span>
            <span className="truncate">{hospital.name}</span>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-foreground/10 sm:flex">
              {hospital.logoUrl ? (
                <img
                  src={hospital.logoUrl}
                  alt={hospital.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-brand" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {hospital.city}
                {hospital.state && `, ${hospital.state}`}
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-primary-foreground/75">
            You have{" "}
            <span className="font-semibold text-primary-foreground">
              {pendingAppointments} pending appointment
              {pendingAppointments !== 1 ? "s" : ""}
            </span>{" "}
            and{" "}
            <span className="font-semibold text-primary-foreground">
              {stats.pendingBills} unpaid bill
              {stats.pendingBills !== 1 ? "s" : ""}
            </span>{" "}
            awaiting action today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <Link href="/portal/admin/doctors/new">
              <UserPlus className="mr-1.5 h-4 w-4" />
              Add doctor
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <Link href="/portal/admin/settings">
              <BarChart3 className="mr-1.5 h-4 w-4" />
              Hospital settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════ ALERTS ══════════ */

function AlertCard({ tone, icon: Icon, title, description, href, cta }) {
  const styles =
    tone === "destructive"
      ? {
          wrapper: "border-destructive/20 bg-destructive/5",
          icon: "text-destructive",
          title: "text-destructive",
        }
      : {
          wrapper: "border-highlight-soft-foreground/20 bg-highlight-soft/40",
          icon: "text-highlight-soft-foreground",
          title: "text-highlight-soft-foreground",
        };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        styles.wrapper
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon)} />

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", styles.title)}>{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <Link
        href={href}
        className={cn(
          "shrink-0 text-xs font-medium hover:underline",
          styles.title
        )}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ══════════ TOP STATS ══════════ */

function TopStats({ stats, doctorStats }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Stethoscope}
        label="Doctors"
        value={doctorStats.total}
        sub={`${doctorStats.active} active`}
        href="/portal/admin/doctors"
        accent
      />

      <StatCard
        icon={HeartPulse}
        label="Nurses"
        value={stats.totalNurses}
        sub={`${stats.totalNurses - 3} active`}
        href="/portal/admin/nurses"
      />

      <StatCard
        icon={ClipboardList}
        label="Receptionists"
        value={stats.totalReceptionists}
        sub="Front desk staff"
        href="/portal/admin/receptionists"
      />

      <StatCard
        icon={Users}
        label="Patients"
        value={stats.totalPatients.toLocaleString("en-IN")}
        sub={`+${stats.newPatientsThisMonth} new this month`}
        href="/portal/admin/patients"
        trend="up"
      />
    </div>
  );
}

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

/* ══════════ REVENUE CHART ══════════ */

function RevenueChart({ data, maxRevenue, totalRevenue }) {
  const todayLabel = new Date().toLocaleString("en-IN", { weekday: "short" });

  return (
    <div className="rounded-2xl border border-border bg-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            Revenue overview
          </h2>
          <DemoBadge />
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
        <p className="text-xs text-muted-foreground">
          Last 7 days · ₹{(totalRevenue / 100000).toFixed(2)}L total
        </p>

        <div className="mt-5 flex h-48 items-end gap-3">
          {data.map((item) => {
            const height = (item.value / maxRevenue) * 100;
            const isToday = item.day === todayLabel;

            return (
              <div
                key={item.day}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all hover:opacity-80",
                      isToday ? "bg-brand" : "bg-brand-soft"
                    )}
                    style={{ height: `${height}%` }}
                    title={`₹${item.value.toLocaleString("en-IN")}`}
                  />
                </div>
                <p
                  className={cn(
                    "text-[10px] font-medium",
                    isToday ? "text-brand" : "text-muted-foreground"
                  )}
                >
                  {item.day}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5">
          <Metric
            label="Avg daily"
            value={`₹${Math.round(totalRevenue / 7 / 1000)}K`}
          />
          <Metric
            label="Peak day"
            value={`₹${Math.round(maxRevenue / 1000)}K`}
          />
          <Metric label="Trend" value="+18%" tone="brand" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-lg font-bold tracking-tight",
          tone === "brand" && "text-brand"
        )}
      >
        {tone === "brand" && <TrendingUp className="h-4 w-4" />}
        {value}
      </p>
    </div>
  );
}

/* ══════════ HOSPITAL SNAPSHOT ══════════ */

function HospitalSnapshot({ hospital }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Hospital profile
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Live from your account
        </p>
      </div>

      <ul className="divide-y divide-border">
        <SnapshotRow icon={Building2} label="Name" value={hospital.name} />
        <SnapshotRow icon={MapPin} label="City" value={hospital.city || "—"} />
        <SnapshotRow
          icon={MapPin}
          label="State"
          value={hospital.state || "—"}
        />
        <SnapshotRow
          icon={Phone}
          label="Phone"
          value={hospital.phone || "—"}
        />
        <SnapshotRow icon={Mail} label="Email" value={hospital.email || "—"} />
      </ul>

      <div className="border-t border-border p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Website
        </p>

        {hospital.website ? (
          <a
            href={hospital.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            <Globe className="h-4 w-4" />
            {hospital.website.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No website added
          </p>
        )}
      </div>
    </div>
  );
}

function SnapshotRow({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <span className="max-w-[60%] truncate text-right text-sm font-semibold">
        {value}
      </span>
    </li>
  );
}

/* ══════════ STAFF OVERVIEW ══════════ */

function StaffOverview({ doctors, nurses, receptionists }) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <StaffCard
        icon={Stethoscope}
        label="Doctors"
        total={doctors.total}
        active={doctors.active}
        inactive={doctors.inactive}
        href="/portal/admin/doctors"
        accent
      />
      <StaffCard
        icon={HeartPulse}
        label="Nurses"
        total={nurses.total}
        active={nurses.active}
        inactive={nurses.inactive}
        href="/portal/admin/nurses"
      />
      <StaffCard
        icon={ClipboardList}
        label="Receptionists"
        total={receptionists.total}
        active={receptionists.active}
        inactive={receptionists.inactive}
        href="/portal/admin/receptionists"
      />
    </div>
  );
}

function StaffCard({
  icon: Icon,
  label,
  total,
  active,
  inactive,
  href,
  accent,
}) {
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

/* ══════════ RECENT ACTIVITY ══════════ */

function RecentActivity({ items }) {
  return (
    <div className="rounded-2xl border border-border bg-card lg:col-span-2">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand" />
          <h2 className="text-base font-semibold tracking-tight">
            Recent activity
          </h2>
          <DemoBadge />
        </div>
      </div>

      <ul className="divide-y divide-border">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function ActivityRow({ item }) {
  const config = {
    doctor_added: {
      icon: UserPlus,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    patient_registered: {
      icon: Users,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    bill_paid: {
      icon: Wallet,
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    doctor_status: {
      icon: AlertCircle,
      class: "bg-highlight-soft text-highlight-soft-foreground",
    },
    department: {
      icon: Building2,
      class: "bg-muted text-muted-foreground",
    },
  }[item.type] || {
    icon: Activity,
    class: "bg-muted text-muted-foreground",
  };

  const Icon = config.icon;

  return (
    <li className="flex items-start gap-3 p-4 transition-colors hover:bg-hover/40 sm:p-5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          config.class
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.description}
        </p>
      </div>

      <p className="shrink-0 text-[11px] text-muted-foreground">{item.time}</p>
    </li>
  );
}

/* ══════════ QUICK ACTIONS ══════════ */

function QuickActions() {
  const actions = [
    {
      icon: UserPlus,
      label: "Add doctor",
      desc: "Onboard a specialist",
      href: "/portal/admin/doctors/new",
      accent: true,
    },
    {
      icon: Users,
      label: "Add nurse",
      desc: "Add nursing staff",
      href: "/portal/admin/nurses/new",
    },
    {
      icon: Building2,
      label: "Add department",
      desc: "Create a new unit",
      href: "/portal/admin/departments/new",
    },
    {
      icon: BarChart3,
      label: "Hospital settings",
      desc: "Profile and preferences",
      href: "/portal/admin/settings",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Quick actions
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Common tasks</p>
      </div>

      <div className="p-3">
        {actions.map((action) => (
          <ActionItem key={action.label} {...action} />
        ))}
      </div>
    </div>
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

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

/* ══════════ DEMO BADGE ══════════ */

function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-highlight-soft-foreground">
      <Info className="h-2.5 w-2.5" />
      Demo data
    </span>
  );
}

/* ══════════ SKELETON ══════════ */

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-64 rounded-3xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-72 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}