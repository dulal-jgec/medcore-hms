"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { getMyDoctorProfile } from "@/services/doctor.service";
import { getDoctorAppointments } from "@/services/appointment.service";

const PAGE_SIZE = 100;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "past", label: "Past" },
];

export default function DoctorPatientsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyDoctorProfile();
        const doctor = profileRes.data;

        const apptRes = await getDoctorAppointments(doctor.id, {
          page: 0,
          size: PAGE_SIZE,
        });

        if (!mounted) return;

        const appointments =
          apptRes.data?.items || apptRes.data?.content || [];

        setPatients(buildPatientSummaries(appointments));
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load your patients.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return patients.filter((p) => {
      if (status === "active" && p.upcomingCount === 0) return false;
      if (status === "past" && p.upcomingCount > 0) return false;
      if (!q) return true;

      return (
        p.patientName?.toLowerCase().includes(q) ||
        String(p.patientId).includes(q)
      );
    });
  }, [patients, query, status]);

  const counts = useMemo(
    () => ({
      all: patients.length,
      active: patients.filter((p) => p.upcomingCount > 0).length,
      past: patients.filter((p) => p.upcomingCount === 0).length,
    }),
    [patients]
  );

  const hasFilters = query.trim() !== "" || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load your patients
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Patients
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who has booked an appointment with you.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/portal/doctor/appointments">
            <CalendarCheck className="mr-1.5 h-4 w-4" />
            View appointments
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or ID..."
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

      {/* Status tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Patient filters">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
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

      {filtered.length === 0 ? (
        <EmptyState
          hasAny={patients.length > 0}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />
      ) : (
        <>
          <p className="mt-4 text-xs text-muted-foreground">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((patient) => (
              <PatientCard key={patient.patientId} patient={patient} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════ Patient Card ══════════ */

function PatientCard({ patient }) {
  const initials = (patient.patientName || "P")
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hasUpcoming = patient.upcomingCount > 0;

  return (
    <Link
      href={`/portal/doctor/patients/${patient.patientId}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md",
        hasUpcoming
          ? "border-brand/30 hover:border-brand/60"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
            hasUpcoming
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {patient.patientName || "Patient"}
            </h3>
            {hasUpcoming && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Active
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Patient #{patient.patientId}
          </p>

          {patient.lastReason && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Last reason:{" "}
              </span>
              {patient.lastReason}
            </p>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20">
        <MiniStat
          label="Total"
          value={patient.totalAppointments}
          unit="visits"
        />
        <MiniStat
          label="Upcoming"
          value={patient.upcomingCount}
          unit="booked"
          highlight={hasUpcoming}
        />
        <MiniStat label="Past" value={patient.pastCount} unit="completed" />
      </div>

      {/* Next / last visit */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        {patient.nextAppointment ? (
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
              Next visit
            </p>
            <p className="mt-0.5 truncate text-xs font-medium">
              {formatDate(patient.nextAppointment.appointmentDate)} ·{" "}
              {formatTime(patient.nextAppointment.startTime)}
            </p>
          </div>
        ) : patient.lastAppointment ? (
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Last visit
            </p>
            <p className="mt-0.5 truncate text-xs font-medium">
              {formatDate(patient.lastAppointment.appointmentDate)}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No visits yet</span>
        )}

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}

function MiniStat({ label, value, unit, highlight }) {
  return (
    <div className="p-3 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-lg font-bold leading-tight tracking-tight",
          highlight && "text-brand"
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );
}

function EmptyState({ hasAny, hasFilters, onClear }) {
  if (hasAny && hasFilters) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-5 text-base font-semibold">No patients match</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Try a different search or clear your filters.
        </p>
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <UserRound className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-5 text-base font-semibold">No patients yet</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Patients will appear here once they book an appointment with you.
      </p>
    </div>
  );
}

/* ══════════ Helpers ══════════ */

function buildPatientSummaries(appointments) {
  const today = toIsoDate(new Date());
  const map = new Map();

  for (const apt of appointments) {
    const key = String(apt.patientId ?? "");
    if (!key || key === "undefined" || key === "null") continue;

    if (!map.has(key)) {
      map.set(key, {
        patientId: apt.patientId,
        patientName: apt.patientName,
        appointments: [],
      });
    }
    map.get(key).appointments.push(apt);
  }

  const summaries = [];

  for (const entry of map.values()) {
    const sorted = [...entry.appointments].sort((a, b) =>
      (a.appointmentDate + " " + (a.startTime || "")).localeCompare(
        b.appointmentDate + " " + (b.startTime || "")
      )
    );

    const upcoming = sorted.filter(
      (a) =>
        a.appointmentDate >= today &&
        ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(a.status)
    );

    const past = sorted.filter(
      (a) => a.appointmentDate < today || a.status === "COMPLETED"
    );

    const next = upcoming[0] || null;
    const last = past[past.length - 1] || null;

    summaries.push({
      patientId: entry.patientId,
      patientName: entry.patientName,
      totalAppointments: sorted.length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      nextAppointment: next,
      lastAppointment: last,
      lastReason: last?.reason || next?.reason || null,
    });
  }

  summaries.sort((a, b) => {
    const aDate =
      a.nextAppointment?.appointmentDate ||
      a.lastAppointment?.appointmentDate ||
      "";
    const bDate =
      b.nextAppointment?.appointmentDate ||
      b.lastAppointment?.appointmentDate ||
      "";
    return bDate.localeCompare(aDate);
  });

  return summaries;
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}