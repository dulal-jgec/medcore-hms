"use client";

import { useMemo, useState } from "react";
import { Search, Building2, Loader2, AlertCircle } from "lucide-react";

import HospitalCard from "./hospital-card";

export default function HospitalDirectory({ hospitals = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  const cities = useMemo(() => {
    const citySet = new Set();

    hospitals.forEach((hospital) => {
      if (hospital.city) {
        citySet.add(hospital.city);
      }
    });

    return Array.from(citySet).sort((a, b) => a.localeCompare(b));
  }, [hospitals]);

  const filteredHospitals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return hospitals.filter((hospital) => {
      const matchesSearch =
        !query ||
        hospital.name?.toLowerCase().includes(query) ||
        hospital.city?.toLowerCase().includes(query) ||
        hospital.state?.toLowerCase().includes(query);

      const matchesCity =
        selectedCity === "all" ||
        hospital.city?.toLowerCase() === selectedCity.toLowerCase();

      return matchesSearch && matchesCity;
    });
  }, [hospitals, searchQuery, selectedCity]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              MedCore Healthcare Network
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Find a Hospital
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore hospitals available on the MedCore healthcare network and
              view their departments, doctors, and contact information.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search hospital, city or state..."
                className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="w-full lg:w-56">
              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All cities</option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {hospitals.length === 0 ? (
            <EmptyState
              title="No hospitals available"
              message="There are currently no active hospitals available on the MedCore network."
            />
          ) : filteredHospitals.length === 0 ? (
            <EmptyState
              title="No hospitals found"
              message="Try changing your search or city filter."
            />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Hospitals</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredHospitals.length} hospital
                  {filteredHospitals.length !== 1 ? "s" : ""} available
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredHospitals.map((hospital) => (
                  <HospitalCard key={hospital.id} hospital={hospital} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border bg-card p-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="text-lg font-semibold">{title}</h2>

      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
