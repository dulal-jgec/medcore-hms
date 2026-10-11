"use client";

import { useMemo, useState } from "react";
import { Search, Stethoscope, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import DoctorCard from "@/components/public-hospital/doctors/doctor-card";

export default function DoctorsSearchGrid({ doctors, hospitalId }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;

    return doctors.filter((d) => {
      const name = (d.doctorName || d.name || "").toLowerCase();
      const spec = (d.specialization || "").toLowerCase();
      return name.includes(q) || spec.includes(q);
    });
  }, [doctors, query]);

  const hasQuery = query.trim().length > 0;

  if (!doctors || doctors.length === 0) {
    return (
      <div className="mt-14 rounded-2xl border border-dashed border-border p-12 text-center sm:p-16">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Stethoscope className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-5 text-base font-semibold">No doctors yet</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Doctor profiles will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="h-11 pl-10 pr-10"
            aria-label="Search doctors"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-hover hover:text-hover-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {hasQuery && (
          <p className="text-xs text-muted-foreground sm:ml-auto">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center sm:p-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-5 text-base font-semibold">No doctors found</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Try a different name or specialization.
          </p>
          <Button
            variant="outline"
            onClick={() => setQuery("")}
            className="mt-5"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              hospitalId={hospitalId}
            />
          ))}
        </div>
      )}
    </div>
  );
}