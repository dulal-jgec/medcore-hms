"use client";

import Link from "next/link";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Microscope,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  PlayCircle,
  TestTube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LAB_TECH_PROFILE,
  LAB_ORDERS,
  LAB_STATUS_CONFIG,
  getLabStats,
} from "@/lib/lab-mock-data";

export default function LabDashboard() {
  const stats = getLabStats();

  const urgentOrders = LAB_ORDERS.filter(
    (o) => o.priority === "URGENT" && o.status !== "PUBLISHED"
  );
  const readyToPublish = LAB_ORDERS.filter((o) => o.status === "READY");
  const pendingSamples = LAB_ORDERS.filter((o) => o.status === "PENDING");
  const inProgress = LAB_ORDERS.filter(
    (o) => o.status === "SAMPLE_COLLECTED" || o.status === "PROCESSING"
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
              <span>{LAB_TECH_PROFILE.department}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {LAB_TECH_PROFILE.fullName.split(" ")[0]} 🔬
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.ready} report{stats.ready !== 1 ? "s" : ""} ready to
                publish
              </span>{" "}
              and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.pending} sample{stats.pending !== 1 ? "s" : ""}
              </span>{" "}
              awaiting collection.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/lab/orders">
                <FlaskConical className="mr-1.5 h-4 w-4" />
                View orders
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/lab/reports">
                <FileText className="mr-1.5 h-4 w-4" />
                Published reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={AlertCircle}
          label="Pending samples"
          value={stats.pending}
          sub="Awaiting collection"
          href="/portal/lab/orders?status=PENDING"
          alert={stats.pending > 0}
        />
        <StatCard
          icon={Microscope}
          label="In processing"
          value={stats.collected + stats.processing}
          sub="Analysis in progress"
          href="/portal/lab/orders?status=PROCESSING"
        />
        <StatCard
          icon={CheckCircle2}
          label="Ready to publish"
          value={stats.ready}
          sub="Reports awaiting release"
          href="/portal/lab/orders?status=READY"
          accent
        />
        <StatCard
          icon={FileText}
          label="Published today"
          value={stats.published}
          sub="Sent to doctors"
          href="/portal/lab/reports"
        />
      </div>

      {/* ══════════ URGENT ALERT ══════════ */}
      {urgentOrders.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {urgentOrders.length} urgent order
              {urgentOrders.length > 1 ? "s" : ""} require attention
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {urgentOrders.map((o) => o.testName).join(" · ")}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            asChild
            className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Link href="/portal/lab/orders?priority=URGENT">View</Link>
          </Button>
        </div>
      )}

      {/* ══════════ MAIN GRID ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Ready to publish (2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Ready to publish
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {readyToPublish.length}
                </span>
              </div>
              <Link
                href="/portal/lab/orders?status=READY"
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {readyToPublish.length > 0 ? (
              <ul className="divide-y divide-border">
                {readyToPublish.map((order) => (
                  <li
                    key={order.id}
                    className="flex items-start gap-4 p-5 transition-colors hover:bg-hover/40"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        order.hasAbnormal
                          ? "bg-destructive/10 text-destructive"
                          : "bg-brand-soft text-brand-soft-foreground"
                      )}
                    >
                      <FlaskConical className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {order.testName}
                        </p>
                        {order.priority === "URGENT" && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                            Urgent
                          </span>
                        )}
                        {order.hasAbnormal && (
                          <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-highlight-soft-foreground">
                            Abnormal
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.patientName} · {order.patientAge} yrs ·{" "}
                        {order.patientGender}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {order.orderedBy} · {order.orderNo}
                      </p>
                    </div>
                    <Button size="sm" asChild className="shrink-0">
                      <Link href={`/portal/lab/orders/${order.id}`}>
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Review
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  All caught up
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No reports waiting for publishing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pending samples (1 col) */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Awaiting samples
              </h2>
            </div>
          </div>

          {pendingSamples.length > 0 ? (
            <ul className="divide-y divide-border">
              {pendingSamples.map((order) => (
                <li key={order.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        order.priority === "URGENT"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Clock className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {order.patientName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.testName}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                        {order.sampleType} sample
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                  >
                    <Link href={`/portal/lab/orders/${order.id}`}>
                      Collect sample
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No pending samples.
            </div>
          )}
        </div>
      </div>

      {/* ══════════ IN PROGRESS + ACTIVITY ══════════ */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* In progress */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                In processing
              </h2>
            </div>
            <Link
              href="/portal/lab/samples"
              className="text-xs font-medium text-brand hover:underline"
            >
              All samples
            </Link>
          </div>

          {inProgress.length > 0 ? (
            <ul className="divide-y divide-border">
              {inProgress.map((order) => {
                const config = LAB_STATUS_CONFIG[order.status];
                return (
                  <li key={order.id} className="flex items-start gap-3 p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-highlight-soft-foreground">
                      <PlayCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {order.testName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.patientName} · {order.patientAge} yrs
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {order.sampleType} · Collected{" "}
                        {order.sampleCollectedAt?.split(" ")[1]}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        config.class
                      )}
                    >
                      {config.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No samples in processing.
            </div>
          )}
        </div>

        {/* Recent published */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Recently published
              </h2>
            </div>
            <Link
              href="/portal/lab/reports"
              className="text-xs font-medium text-brand hover:underline"
            >
              All reports
            </Link>
          </div>

          <ul className="divide-y divide-border">
            {LAB_ORDERS.filter((o) => o.status === "PUBLISHED")
              .slice(0, 3)
              .map((order) => (
                <li
                  key={order.id}
                  className="flex items-center gap-3 p-5"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      order.hasAbnormal
                        ? "bg-highlight-soft text-highlight-soft-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {order.testName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {order.patientName} · {order.publishedAt?.split(" ")[0]}
                    </p>
                  </div>
                  {order.hasAbnormal && (
                    <span className="shrink-0 rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-highlight-soft-foreground">
                      Abnormal
                    </span>
                  )}
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
          Common lab tasks
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={TestTube}
            label="Collect sample"
            desc={`${stats.pending} pending`}
            href="/portal/lab/orders?status=PENDING"
            accent
          />
          <ActionTile
            icon={Microscope}
            label="Processing queue"
            desc={`${stats.collected + stats.processing} in progress`}
            href="/portal/lab/samples"
          />
          <ActionTile
            icon={CheckCircle2}
            label="Ready to publish"
            desc={`${stats.ready} reports`}
            href="/portal/lab/orders?status=READY"
          />
          <ActionTile
            icon={FileText}
            label="Published reports"
            desc="View archive"
            href="/portal/lab/reports"
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function StatCard({ icon: Icon, label, value, sub, href, accent, alert }) {
  const style = alert
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
            style
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {sub}
      </p>
    </Link>
  );
}

function ActionTile({ icon: Icon, label, desc, href, accent }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
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