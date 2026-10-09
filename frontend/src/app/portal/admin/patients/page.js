"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Droplets,
  Eye,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getPatients } from "@/services/patient.service";

const PAGE_SIZE = 50;

const TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];

export default function AdminPatientsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getPatients({
          page: 0,
          size: PAGE_SIZE,
          sortBy: "createdAt",
          sortDir: "desc",
        });

        if (!mounted) return;

        setPatients(result.data?.items || result.data?.content || []);
      } catch (err) {
        if (!mounted) return;
        console.error("[admin/patients] load failed:", err);
        setError(friendlyError(err));
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
      const name =
        p.patientName || p.name || p.user?.fullName || "";
      const email = p.email || p.user?.email || "";
      const phone = p.phone || p.user?.phone || "";
      const city = p.city || p.user?.city || "";

      const matchesQuery =
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        phone.includes(q) ||
        city.toLowerCase().includes(q);

      const matchesStatus = status === "all" || p.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [patients, query, status]);

  const counts = useMemo(
    () => ({
      all: patients.length,
      ACTIVE: patients.filter((p) => p.status === "ACTIVE").length,
      INACTIVE: patients.filter((p) => p.status === "INACTIVE").length,
    }),
    [patients]
  );

  const hasFilters = query.trim() !== "" || status !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
  };

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
          Unable to load patients
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Patient Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients registered or booked at your hospital.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat icon={Users} label="Total patients" value={counts.all} accent />
        <MiniStat icon={Heart} label="Active" value={counts.ACTIVE} />
        <MiniStat
          icon={AlertCircle}
          label="Inactive"
          value={counts.INACTIVE}
          muted
        />
      </div>

      {/* Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email, or city..."
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
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map(({ id, label }) => {
            const active = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                  active
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground after:bg-transparent hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active
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

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-5 text-base font-semibold">No patients found</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Patients who book or register will appear here."}
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-5">
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════ Patient Card ══════════ */

function PatientCard({ patient }) {
  const name =
    patient.patientName || patient.name || patient.user?.fullName || "Patient";
  const email = patient.email || patient.user?.email;
  const phone = patient.phone || patient.user?.phone;
  const city = patient.city || patient.user?.city;

  const bloodGroup = formatBloodGroup(patient.bloodGroup);
  const gender = formatEnum(patient.gender);
  const status = patient.status;

  return (
    <Link
      href={`/portal/admin/patients/${patient.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            status === "ACTIVE"
              ? "bg-brand-soft text-brand-soft-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {name}
            </h3>
            <StatusPill status={status} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {gender && <span>{gender}</span>}
            {bloodGroup && (
              <>
                {gender && <span>·</span>}
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" />
                  {bloodGroup}
                </span>
              </>
            )}
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground">
            Patient #{patient.id}
          </p>
        </div>
      </div>

      <div className="mx-5 mb-4 space-y-1.5 rounded-xl border border-border bg-muted/20 p-3 text-xs">
        {phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {city && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/10 px-5 py-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">
            Joined {formatDate(patient.createdAt)}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
          View
          <Eye className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

/* ══════════ Sub-components ══════════ */

function StatusPill({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
    CRITICAL: {
      label: "Critical",
      class: "bg-destructive/10 text-destructive",
    },
    DECEASED: {
      label: "Deceased",
      class: "bg-muted text-muted-foreground",
    },
  };

  const config =
    map[status] || {
      label: formatEnum(status) || "Unknown",
      class: "bg-muted text-muted-foreground",
    };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}

function MiniStat({ icon: Icon, label, value, accent, muted }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          accent
            ? "bg-brand text-brand-foreground"
            : muted
            ? "bg-muted text-muted-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ══════════ Helpers ══════════ */

function friendlyError(err) {
  if (!err) return "Unable to load patients. Please try again.";

  const status = err.status;

  if (status === 401) return "Please sign in again to continue.";
  if (status === 403) return "You do not have access to view patients.";
  if (status === 404) return "Patient data is not available right now.";
  if (status >= 500) return "Server is busy. Please try again in a moment.";

  // Hide raw backend validation messages from users
  return "Unable to load patients. Please try again.";
}

function formatBloodGroup(bg) {
  if (!bg) return "";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatEnum(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}