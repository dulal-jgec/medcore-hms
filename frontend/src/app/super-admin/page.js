"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Building2,
  CheckCircle2,
  XCircle,
  Trash2,
  UserPlus,
  Plus,
  ArrowUpRight,
  Users,
  MapPin,
  FileText,
  ChevronRight,
  Sparkles,
  Mail,
  Clock3,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import {
  getDashboard,
  getAllHospitals,
  getAllHospitalAdmins,
  resendHospitalAdminInvitation,
} from "@/services/super-admin.service";

const STAT_CONFIG = [
  {
    key: "totalHospitals",
    label: "Total hospitals",
    icon: Building2,
    accent: true,
  },
  {
    key: "activeHospitals",
    label: "Active",
    icon: CheckCircle2,
  },
  {
    key: "inactiveHospitals",
    label: "Inactive",
    icon: XCircle,
    muted: true,
  },
  {
    key: "deletedHospitals",
    label: "Deleted",
    icon: Trash2,
    alert: true,
  },
];

export default function SuperAdminPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [stats, setStats] = useState(null);
  const [recentHospitals, setRecentHospitals] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [idempotencyKeys, setIdempotencyKeys] = useState({});

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getDashboard(),
        getAllHospitals(0, 5, "createdAt", "desc"),
        getAllHospitalAdmins(0, 10),
      ]);

      if (cancelled) return;

      const [statsRes, hospitalsRes, adminsRes] = results;

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value?.data ?? null);
      } else {
        console.error("dashboard failed:", statsRes.reason);
        setError(
          (prev) =>
            prev ||
            `Dashboard: ${
              statsRes.reason?.message || "failed"
            }`
        );
      }

      if (hospitalsRes.status === "fulfilled") {
        setRecentHospitals(
          hospitalsRes.value?.data?.content ?? []
        );
      } else {
        console.error("hospitals failed:", hospitalsRes.reason);
        setError(
          (prev) =>
            prev ||
            `Hospitals: ${
              hospitalsRes.reason?.message || "failed"
            }`
        );
      }

      if (adminsRes.status === "fulfilled") {
        setRecentAdmins(
          adminsRes.value?.data?.content ?? []
        );
      } else {
        console.error("admins failed:", adminsRes.reason);
        setError(
          (prev) =>
            prev ||
            `Admins: ${
              adminsRes.reason?.message || "failed"
            }`
        );
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  async function handleResendInvitation(userId) {
  try {
    setResendingId(userId);
    setError("");
    setSuccess("");

    const key =
      idempotencyKeys[userId] ||
      crypto.randomUUID();

    if (!idempotencyKeys[userId]) {
      setIdempotencyKeys((prev) => ({
        ...prev,
        [userId]: key,
      }));
    }

    const response =
      await resendHospitalAdminInvitation(
        userId,
        key
      );

    setSuccess(
      response?.message ||
        "Invitation email queued successfully."
    );

    const adminsResponse =
      await getAllHospitalAdmins(0, 10);

    setRecentAdmins(
      adminsResponse?.data?.content ?? []
    );
  } catch (err) {
    console.error(
      "resend invitation failed:",
      err
    );

    setError(
      err?.message ||
        "Failed to resend invitation."
    );
  } finally {
    setResendingId(null);
  }
}

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  const totalHospitals =
    Number(stats?.totalHospitals ?? 0);

  const activeHospitals =
    Number(stats?.activeHospitals ?? 0);

  const activePercent =
    totalHospitals > 0
      ? Math.round(
          (activeHospitals / totalHospitals) * 100
        )
      : 0;

  const pendingAdmins = recentAdmins.filter(
    (admin) =>
      admin.status === "PENDING_VERIFICATION"
  );

  const expiredAdmins = recentAdmins.filter(
    (admin) =>
      admin.status === "INVITATION_EXPIRED"
  );

  const invitationAttentionCount =
    pendingAdmins.length + expiredAdmins.length;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
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
              <span>System Administration</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, Super Admin
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              MedCore platform has{" "}
              <span className="font-semibold text-primary-foreground">
                {totalHospitals} hospitals
              </span>{" "}
              registered, with{" "}
              <span className="font-semibold text-primary-foreground">
                {activeHospitals} currently active
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/super-admin/hospitals/create">
                <Plus className="mr-1.5 h-4 w-4" />
                Create hospital
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/super-admin/admins/create">
                <UserPlus className="mr-1.5 h-4 w-4" />
                Create admin
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-brand">
          {success}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CONFIG.map((item) => (
          <StatCard
            key={item.key}
            icon={item.icon}
            label={item.label}
            value={stats?.[item.key] ?? 0}
            accent={item.accent}
            muted={item.muted}
            alert={item.alert}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Platform health
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Hospital status breakdown
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">
                {activePercent}%
              </p>

              <p className="text-sm text-muted-foreground">
                of hospitals active
              </p>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{
                  width: `${activePercent}%`,
                }}
              />
            </div>

            <div className="mt-6 space-y-3">
              <HealthRow
                label="Active"
                value={activeHospitals}
                total={totalHospitals}
                color="bg-brand"
              />

              <HealthRow
                label="Inactive"
                value={Number(
                  stats?.inactiveHospitals ?? 0
                )}
                total={totalHospitals}
                color="bg-muted-foreground/40"
              />

              <HealthRow
                label="Deleted"
                value={Number(
                  stats?.deletedHospitals ?? 0
                )}
                total={totalHospitals}
                color="bg-destructive"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Quick actions
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Common tasks
            </p>
          </div>

          <div className="p-3">
            <ActionItem
              icon={Plus}
              label="Create hospital"
              desc="Add a new hospital to the platform"
              href="/super-admin/hospitals/create"
              accent
            />

            <ActionItem
              icon={UserPlus}
              label="Create admin"
              desc="Assign an admin to a hospital"
              href="/super-admin/admins/create"
            />

            <ActionItem
              icon={Building2}
              label="All hospitals"
              desc="View and manage hospitals"
              href="/super-admin/hospitals"
            />

            <ActionItem
              icon={Users}
              label="All admins"
              desc="View hospital administrators"
              href="/super-admin/admins"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" />

              <h2 className="text-base font-semibold tracking-tight">
                Invitation attention
              </h2>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Hospital admin invitations that need attention
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingAdmins.length > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {pendingAdmins.length} pending
              </span>
            )}

            {expiredAdmins.length > 0 && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                {expiredAdmins.length} expired
              </span>
            )}

            <Link
              href="/super-admin/admins"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {invitationAttentionCount > 0 ? (
          <div className="divide-y divide-border">
            {pendingAdmins.map((admin) => (
              <div
                key={admin.userId}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {admin.fullName}
                      </p>

                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Pending
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {admin.email}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        User ID:{" "}
                        <span className="font-semibold text-foreground">
                          {admin.userId}
                        </span>
                      </span>

                      <span>
                        Hospital:{" "}
                        <span className="font-medium text-foreground">
                          {admin.hospitalName || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    handleResendInvitation(admin.userId)
                  }
                  disabled={resendingId === admin.userId}
                  className="shrink-0"
                >
                  {resendingId === admin.userId ? (
                    <>
                      <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-1.5 h-4 w-4" />
                      Resend invitation
                    </>
                  )}
                </Button>
              </div>
            ))}

            {expiredAdmins.map((admin) => (
              <div
                key={admin.userId}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {admin.fullName}
                      </p>

                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                        Invitation expired
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {admin.email}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        User ID:{" "}
                        <span className="font-semibold text-foreground">
                          {admin.userId}
                        </span>
                      </span>

                      <span>
                        Hospital:{" "}
                        <span className="font-medium text-foreground">
                          {admin.hospitalName || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                >
                  <Link href="/super-admin/admins/create">
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Create new admin
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint
            icon={CheckCircle2}
            title="No invitation requires attention"
            desc="All recently created hospital admin invitations are in a normal state."
          />
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand" />

              <h2 className="text-base font-semibold tracking-tight">
                Recently added hospitals
              </h2>
            </div>

            <Link
              href="/super-admin/hospitals"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentHospitals.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentHospitals.map((hospital) => (
                <li
                  key={hospital.id}
                  className="flex items-center gap-3 p-4 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-soft-foreground">
                    {hospital.name?.charAt(0) || "H"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {hospital.name}
                    </p>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hospital.city || "—"}
                      </span>

                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {hospital.licenseNumber || "—"}
                      </span>
                    </div>
                  </div>

                  <StatusPill
                    status={hospital.status}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint
              icon={Building2}
              title="No hospitals yet"
              desc="Create the first hospital to get started."
            />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand" />

              <h2 className="text-base font-semibold tracking-tight">
                Recently added admins
              </h2>
            </div>

            <Link
              href="/super-admin/admins"
              className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentAdmins.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentAdmins.map((admin) => (
                <li
                  key={admin.userId}
                  className="flex items-center gap-3 p-4 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-soft-foreground">
                    {admin.fullName?.charAt(0) || "A"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {admin.fullName}
                      </p>

                      <StatusPill
                        status={admin.status}
                      />
                    </div>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {admin.email}
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      ID:{" "}
                      <span className="font-medium text-foreground">
                        {admin.userId}
                      </span>
                    </p>
                  </div>

                  <p className="hidden shrink-0 text-xs font-medium text-muted-foreground sm:block">
                    {admin.hospitalName || "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint
              icon={Users}
              title="No admins yet"
              desc="Assign the first admin to a hospital."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  muted,
  alert,
}) {
  const iconStyle = alert
    ? "bg-destructive/10 text-destructive"
    : accent
    ? "bg-brand text-brand-foreground"
    : muted
    ? "bg-muted text-muted-foreground"
    : "bg-brand-soft text-brand-soft-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            iconStyle
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-foreground">
        {label}
      </p>
    </div>
  );
}

function HealthRow({
  label,
  value,
  total,
  color,
}) {
  const pct =
    total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          color
        )}
      />

      <span className="flex-1 text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-xs text-muted-foreground">
        {pct.toFixed(0)}%
      </span>

      <span className="w-8 text-right text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  desc,
  href,
  accent,
}) {
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
        <p className="truncate text-sm font-medium">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {desc}
        </p>
      </div>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

function StatusPill({ status }) {
  const map = {
    ACTIVE:
      "bg-brand-soft text-brand-soft-foreground",

    INACTIVE:
      "bg-muted text-muted-foreground",

    DELETED:
      "bg-destructive/10 text-destructive",

    PENDING_VERIFICATION:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",

    INVITATION_EXPIRED:
      "bg-destructive/10 text-destructive",

    BLOCKED:
      "bg-destructive/10 text-destructive",
  };

  const labelMap = {
    PENDING_VERIFICATION: "PENDING",
    INVITATION_EXPIRED: "EXPIRED",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status] || map.INACTIVE
      )}
    >
      {labelMap[status] || status || "UNKNOWN"}
    </span>
  );
}

function EmptyHint({
  icon: Icon,
  title,
  desc,
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <p className="mt-3 text-sm font-medium">
        {title}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-48 rounded-3xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-72 rounded-2xl bg-muted" />
        </div>

        <div className="h-72 rounded-2xl bg-muted" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 rounded-2xl bg-muted" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}