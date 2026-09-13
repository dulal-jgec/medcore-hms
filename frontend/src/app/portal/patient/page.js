"use client";

import Link from "next/link";
import {
  CalendarCheck,
  Pill,
  FlaskConical,
  Wallet,
  Clock,
  Heart,
  Activity,
  Droplets,
  Weight,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Plus,
  FileText,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PATIENT,
  PATIENT_VITALS,
  UPCOMING_APPOINTMENTS,
  PRESCRIPTIONS,
  LAB_REPORTS,
  BILLS,
  getPatientStats,
} from "@/lib/patient-mock-data";

export default function PatientDashboard() {
  const stats = getPatientStats();
  const nextAppointment = UPCOMING_APPOINTMENTS[0];
  const activePrescriptions = PRESCRIPTIONS.filter((p) => p.status === "active");
  const recentReports = LAB_REPORTS.slice(0, 3);
  const pendingBills = BILLS.filter((b) => b.status === "pending");

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
      {/* ══════════ HERO BANNER ══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-8 lg:p-10">
        {/* Dotted texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Green glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>{today}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">
              {greeting}, {PATIENT.fullName.split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
              You have{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.upcoming} upcoming appointments
              </span>{" "}
              and{" "}
              <span className="font-semibold text-primary-foreground">
                {stats.newReports} new lab reports
              </span>{" "}
              to review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/portal/patient/appointments">
                
                Book appointment
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link href="/portal/patient/lab-reports">
                View reports
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════ NEXT APPOINTMENT — hero card ══════════ */}
      {nextAppointment && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Left: appointment details */}
            <div className="lg:col-span-8 lg:border-r lg:border-border">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-brand" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    Next appointment
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
                  {/* Date box — larger, more prominent */}
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-brand-soft/50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                      {new Date(nextAppointment.date).toLocaleString("en-IN", {
                        month: "short",
                      })}
                    </p>
                    <p className="text-3xl font-bold leading-none text-brand-soft-foreground">
                      {new Date(nextAppointment.date).getDate()}
                    </p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-brand-soft-foreground/80">
                      {new Date(nextAppointment.date).toLocaleString("en-IN", {
                        weekday: "short",
                      })}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold tracking-tight">
                      {nextAppointment.doctorName}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-brand">
                      {nextAppointment.specialty}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {nextAppointment.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {nextAppointment.department}
                      </span>
                    </div>

                    {nextAppointment.reason && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Reason: {nextAppointment.reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/portal/patient/appointments">
                      View details
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/portal/patient/appointments">Reschedule</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: patient identity */}
            <div className="bg-muted/30 p-6 sm:p-8 lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your profile
              </p>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-brand-foreground">
                  {PATIENT.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">
                    {PATIENT.fullName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    MC-{String(PATIENT.id).padStart(5, "0")}
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Blood group</dt>
                  <dd className="font-semibold text-destructive">
                    {PATIENT.bloodGroup}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="font-medium">{PATIENT.age} years</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="truncate font-medium">{PATIENT.phone}</dd>
                </div>
              </dl>

              <Link
                href="/portal/patient/profile"
                className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                View full profile
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ HEALTH SNAPSHOT ══════════ */}
      <div className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Health snapshot
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Last updated {PATIENT_VITALS.lastUpdated}
            </p>
          </div>
          <Link
            href="/portal/patient/profile"
            className="text-xs font-medium text-brand hover:underline"
          >
            Full history
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VitalCard
            icon={Activity}
            label="Blood pressure"
            value={PATIENT_VITALS.bloodPressure.value}
            unit={PATIENT_VITALS.bloodPressure.unit}
            status={PATIENT_VITALS.bloodPressure.status}
          />
          <VitalCard
            icon={Droplets}
            label="Blood sugar"
            value={PATIENT_VITALS.bloodSugar.value}
            unit={PATIENT_VITALS.bloodSugar.unit}
            status={PATIENT_VITALS.bloodSugar.status}
          />
          <VitalCard
            icon={Weight}
            label="Weight"
            value={PATIENT_VITALS.weight.value}
            unit={PATIENT_VITALS.weight.unit}
            status={PATIENT_VITALS.weight.status}
          />
          <VitalCard
            icon={Heart}
            label="Heart rate"
            value={PATIENT_VITALS.heartRate.value}
            unit={PATIENT_VITALS.heartRate.unit}
            status={PATIENT_VITALS.heartRate.status}
          />
        </div>
      </div>

      {/* ══════════ QUICK ACCESS TILES ══════════ */}
      <div className="mt-8">
        <h2 className="text-lg font-bold tracking-tight">Quick access</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Jump to what you need
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ActionTile
            icon={CalendarCheck}
            label="Appointments"
            desc={`${stats.upcoming} upcoming`}
            href="/portal/patient/appointments"
            accent
          />
          <ActionTile
            icon={Pill}
            label="Prescriptions"
            desc={`${stats.activePrescriptions} active`}
            href="/portal/patient/prescriptions"
          />
          <ActionTile
            icon={FlaskConical}
            label="Lab reports"
            desc={`${stats.newReports} ready`}
            href="/portal/patient/lab-reports"
          />
          <ActionTile
            icon={Wallet}
            label="Bills"
            desc={`₹${stats.pendingAmount} pending`}
            href="/portal/patient/bills"
            alert={stats.pendingBills > 0}
          />
        </div>
      </div>

      {/* ══════════ ACTIVITY (2-col) ══════════ */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Recent activity
              </h2>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {recentReports.slice(0, 2).map((r) => (
              <li key={r.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      r.status === "ready"
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-highlight-soft text-highlight-soft-foreground"
                    }`}
                  >
                    <FlaskConical className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {r.testName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {r.orderedBy} · {r.date}
                    </p>
                  </div>
                  <ReportBadge status={r.status} />
                </div>
              </li>
            ))}

            {activePrescriptions.slice(0, 1).map((p) => (
              <li key={p.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                    <Pill className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {p.diagnosis}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.doctorName} · {p.issuedOn}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.medicines.length} medicine
                      {p.medicines.length > 1 ? "s" : ""} prescribed
                    </p>
                  </div>
                </div>
              </li>
            ))}

            <li className="p-5 text-center">
              <Link
                href="/portal/patient/lab-reports"
                className="text-xs font-medium text-brand hover:underline"
              >
                View all activity
              </Link>
            </li>
          </ul>
        </div>

        {/* Pending bills */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                Bills & payments
              </h2>
            </div>
            <Link
              href="/portal/patient/bills"
              className="text-xs font-medium text-brand hover:underline"
            >
              All
            </Link>
          </div>

          {pendingBills.length > 0 ? (
            <div className="border-b border-border bg-destructive/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                    Payment pending
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    ₹{pendingBills[0].amount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pendingBills[0].description}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Due {pendingBills[0].dueDate}
                  </p>
                </div>
                <Button size="sm" variant="destructive">
                  Pay now
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-brand" />
              <p className="mt-3 text-sm font-medium">All bills paid</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No pending payments
              </p>
            </div>
          )}

          <ul className="divide-y divide-border">
            {BILLS.slice(0, 3).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {b.description}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {b.invoiceNo} · {b.issuedOn}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-sm font-semibold">₹{b.amount}</p>
                  <BillBadge status={b.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ══════════ EMERGENCY CONTACT ══════════ */}
      <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">
              Emergency contact
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold">
                {PATIENT.emergencyContact.name}
              </span>{" "}
              <span className="text-muted-foreground">
                ({PATIENT.emergencyContact.relation})
              </span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {PATIENT.emergencyContact.phone}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Update contact
        </Button>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function VitalCard({ icon: Icon, label, value, unit, status }) {
  const statusStyles = {
    normal: "bg-brand-soft text-brand-soft-foreground",
    warning: "bg-highlight-soft text-highlight-soft-foreground",
    alert: "bg-destructive/10 text-destructive",
  };
  const statusLabels = {
    normal: "Normal",
    warning: "Monitor",
    alert: "Attention",
  };
  const iconStyle = statusStyles[status] || statusStyles.normal;
  const statusLabel = statusLabels[status] || "Normal";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${iconStyle}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
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
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
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

function ReportBadge({ status }) {
  if (status === "ready") {
    return (
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand-soft-foreground">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-semibold text-highlight-soft-foreground">
      <AlertCircle className="h-3 w-3" />
      Pending
    </span>
  );
}

function BillBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        status === "paid"
          ? "bg-brand-soft text-brand-soft-foreground"
          : "bg-destructive/10 text-destructive"
      }`}
    >
      {status === "paid" ? "Paid" : "Pending"}
    </span>
  );
}