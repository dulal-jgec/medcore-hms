"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  Loader2,
  Phone,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getRecentPatients,
  searchPatients,
} from "@/services/receptionist.service";

const DEBOUNCE_MS = 350;
const RECENT_LIMIT = 5;

export default function ReceptionPatientsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        setRecentLoading(true);
        setRecentError("");
        const res = await getRecentPatients(RECENT_LIMIT);
        if (!mounted) return;
        setRecent(res.data || []);
      } catch (err) {
        if (!mounted) return;
        setRecentError(err.message || "Unable to load recent patients.");
      } finally {
        if (mounted) setRecentLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated]);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      setSearchError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError("");
        const res = await searchPatients(keyword, { page: 0, size: 50 });
        setResults(res.data?.items || []);
      } catch (err) {
        setSearchError(err.message || "Search failed.");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, initialized, isAuthenticated]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Front Desk
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Patients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Look up a patient by name, phone, or ID.
          </p>
        </div>
        <Button asChild>
          <Link href="/portal/reception/patients/new">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Register patient
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or patient ID..."
            className="h-11 pl-10"
          />
        </div>
        {hasQuery && (
          <Button variant="ghost" onClick={() => setQuery("")} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {hasQuery ? (
        <SearchSection
          searching={searching}
          error={searchError}
          results={results}
        />
      ) : (
        <RecentSection
          loading={recentLoading}
          error={recentError}
          patients={recent}
        />
      )}
    </div>
  );
}

/* ══════════ Recent registrations ══════════ */

function RecentSection({ loading, error, patients }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Recent registrations
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest patients registered at your hospital
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : patients.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-5 text-base font-semibold">No patients yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Register your first walk-in patient to get started.
          </p>
          <Button asChild className="mt-5">
            <Link href="/portal/reception/patients/new">
              <UserPlus className="mr-1.5 h-4 w-4" />
              Register patient
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {patients.map((p, index) => (
            <RecentRow key={p.id} patient={p} position={index + 1} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentRow({ patient, position }) {
  const registeredLabel = formatRelative(patient.createdAt);
  const name = getPatientName(patient);

  return (
    <li className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/30 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand-soft-foreground">
        {position}
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-bold text-brand-foreground">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{name}</h3>
          {patient.bloodGroup && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {formatBloodGroup(patient.bloodGroup)}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {patient.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              {patient.phone}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {registeredLabel}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/portal/reception/patients/${patient.id}`}>View</Link>
        </Button>
        <Button asChild size="sm">
          <Link
            href={`/portal/reception/appointments/new?patientId=${patient.id}`}
          >
            Book
          </Link>
        </Button>
      </div>
    </li>
  );
}

/* ══════════ Search results ══════════ */

function SearchSection({ searching, error, results }) {
  if (searching) {
    return (
      <div className="mt-8 flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-5 text-base font-semibold">No patients found</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Try a different search or register a new patient.
          </p>
          <Button asChild className="mt-5">
            <Link href="/portal/reception/patients/new">
              <UserPlus className="mr-1.5 h-4 w-4" />
              Register patient
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-muted-foreground">
            {results.length} patient{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PatientCard({ patient }) {
  const name = getPatientName(patient);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-soft-foreground">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {name}
            </h3>
            {patient.status && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {patient.status}
              </span>
            )}
          </div>

          {(patient.bloodGroup || patient.gender) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {patient.gender && <span>{patient.gender}</span>}
              {patient.bloodGroup && (
                <>
                  <span>·</span>
                  <span>{formatBloodGroup(patient.bloodGroup)}</span>
                </>
              )}
            </div>
          )}

          {patient.phone && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              {patient.phone}
            </div>
          )}

          <p className="mt-1 text-[11px] text-muted-foreground">
            Patient #{patient.id}
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link href={`/portal/reception/patients/${patient.id}`}>View</Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link
            href={`/portal/reception/appointments/new?patientId=${patient.id}`}
          >
            Book
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ══════════ Helpers ══════════ */

function getPatientName(patient) {
  if (!patient) return "Unknown";
  return (
    patient.patientName ||       // ⬅ your backend field
    patient.fullName ||
    patient.name ||
    patient.user?.fullName ||
    patient.user?.name ||
    "Unknown"
  );
}

function formatBloodGroup(bg) {
  if (!bg) return "—";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatRelative(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}