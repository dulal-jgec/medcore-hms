"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  BedDouble,
  Building2,
  Home,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HOSPITALS } from "@/lib/hospitals";

export default function HospitalsPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");

  // Derive unique cities & types from data so filters always match reality
  const cities = useMemo(
    () => ["all", ...new Set(HOSPITALS.map((h) => h.city))].sort(),
    []
  );
  const types = useMemo(
    () => ["all", ...new Set(HOSPITALS.map((h) => h.type))].sort(),
    []
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return HOSPITALS.filter((h) => {
      const matchQuery =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q);
      const matchCity = city === "all" || h.city === city;
      const matchType = type === "all" || h.type === type;
      return matchQuery && matchCity && matchType;
    });
  }, [query, city, type]);

  const hasFilters = query || city !== "all" || type !== "all";

  function clearFilters() {
    setQuery("");
    setCity("all");
    setType("all");
  }

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 hover:text-foreground">
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="opacity-40">/</span>
          <span className="text-foreground">Hospitals</span>
        </div>
      </div>

      {/* ── Page header ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <span className="h-px w-6 bg-brand" />
              Directory
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Find your hospital
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Browse hospitals registered on MedCore. Select yours to sign in
              to its secure portal.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hospital, city, or state..."
                className="h-11 pl-10"
              />
            </div>

            {/* City */}
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-48"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All cities" : c}
                </option>
              ))}
            </select>

            {/* Type */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-56"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11 hover:bg-hover hover:text-hover-foreground"
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Result count */}
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "hospital" : "hospitals"} found
            {hasFilters && " — filtered"}
          </p>
        </div>
      </section>

      {/* ── Results ── */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-lg border border-dashed border-border py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">No hospitals found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-5 hover:bg-hover hover:text-hover-foreground"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function HospitalCard({ hospital }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-sm">
      {/* Top band with tile */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-lg font-bold text-brand-soft-foreground">
          {hospital.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {hospital.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {hospital.city}, {hospital.state}
            </span>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20 text-center">
        <div className="px-2 py-3">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Type</span>
          </div>
          <p className="mt-1 truncate px-1 text-xs font-semibold" title={hospital.type}>
            {hospital.type.replace(" Hospital", "")}
          </p>
        </div>
        <div className="px-2 py-3">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <BedDouble className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Beds</span>
          </div>
          <p className="mt-1 text-xs font-semibold">{hospital.beds}</p>
        </div>
        <div className="px-2 py-3">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Depts</span>
          </div>
          <p className="mt-1 text-xs font-semibold">{hospital.departments}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 border-t border-border p-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 hover:bg-hover hover:text-hover-foreground"
        >
          <Link href={`/hospitals/${hospital.id}`}>View Details</Link>
        </Button>
        <Button
  asChild
  size="sm"
  className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
>
  <Link href={`/login?hospitalId=${hospital.id}`}>Select</Link>
</Button>
      </div>
    </div>
  );
}