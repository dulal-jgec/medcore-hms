"use client";

import { useMemo, useState } from "react";
import { Search, Building2, MapPin, Layers, X, Sparkles } from "lucide-react";

import HospitalCard from "./hospital-card";

export default function HospitalDirectory({ hospitals = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const cities = useMemo(() => {
    const set = new Set();
    hospitals.forEach((h) => {
      if (h.city) set.add(h.city);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [hospitals]);

  const states = useMemo(() => {
    const set = new Set();
    hospitals.forEach((h) => {
      if (h.state) set.add(h.state);
    });
    return set.size;
  }, [hospitals]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return hospitals.filter((h) => {
      const matchesSearch =
        !q ||
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q);

      const matchesCity =
        selectedCity === "all" ||
        h.city?.toLowerCase() === selectedCity.toLowerCase();

      return matchesSearch && matchesCity;
    });
  }, [hospitals, searchQuery, selectedCity]);

  const hasFilters = searchQuery.trim() !== "" || selectedCity !== "all";

  function clearFilters() {
    setSearchQuery("");
    setSelectedCity("all");
  }

  return (
    <div className="bg-background">
      {/* ══════════ PREMIUM HEADER ══════════ */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand">
              <span className="h-px w-8 bg-brand" />
              MedCore Network
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Find your hospital in the{" "}
              <span className="text-brand">MedCore network</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
              Explore hospitals registered on MedCore. View their departments,
              doctors, facilities, and contact information — all in one place.
            </p>
          </div>

          {hospitals.length > 0 && (
            <div className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
              <StatTile
                icon={Building2}
                value={hospitals.length}
                label="Hospitals"
              />
              <StatTile
                icon={MapPin}
                value={cities.length}
                label="Cities covered"
              />
              <StatTile
                icon={Layers}
                value={states}
                label={`State${states !== 1 ? "s" : ""} live`}
              />
            </div>
          )}
        </div>
      </section>

      {/* ══════════ SEARCH + FILTERS ══════════ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hospital name, city, or state..."
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-base outline-none transition-all placeholder:text-muted-foreground focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* City chips */}
            {cities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Filter:
                </span>

                <CityChip
                  active={selectedCity === "all"}
                  onClick={() => setSelectedCity("all")}
                >
                  All cities
                </CityChip>

                {cities.map((city) => (
                  <CityChip
                    key={city}
                    active={selectedCity === city}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </CityChip>
                ))}

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ RESULTS ══════════ */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          {hospitals.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No hospitals yet"
              message="No hospitals are registered on the MedCore network yet. Check back soon."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No hospitals match your search"
              message="Try a different search term or clear the filters to see all hospitals."
              action={{ label: "Clear filters", onClick: clearFilters }}
            />
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hospitals
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    {filtered.length} hospital
                    {filtered.length !== 1 ? "s" : ""} available
                  </h2>
                </div>

                {hasFilters && (
                  <p className="text-xs text-muted-foreground">
                    Filtered from {hospitals.length} total
                  </p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

function CityChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-brand bg-brand text-brand-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <Icon className="h-7 w-7 text-brand-soft-foreground" />
      </div>
      <h2 className="mt-6 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-hover hover:text-hover-foreground"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
