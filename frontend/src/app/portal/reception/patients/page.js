"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
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
import { searchPatients } from "@/services/receptionist.service";

const DEBOUNCE_MS = 350;

export default function ReceptionPatientsPage() {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    const keyword = query.trim();
    if (!keyword) {
      setResults([]);
      setError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        setError("");
        const res = await searchPatients(keyword, { page: 0, size: 50 });
        setResults(res.data?.items || []);
      } catch (err) {
        setError(err.message || "Search failed.");
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

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6">
        {!hasQuery ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">
              Start typing to search
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter a name, phone, or patient ID above.
            </p>
          </div>
        ) : searching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : results.length === 0 ? (
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
    </div>
  );
}

function PatientCard({ patient }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {patient.fullName?.charAt(0)?.toUpperCase() || "P"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {patient.fullName}
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
                  <span>{patient.bloodGroup}</span>
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