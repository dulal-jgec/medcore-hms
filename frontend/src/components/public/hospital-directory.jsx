"use client";

import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOSPITALS } from "@/lib/hospitals";

// TODO: replace with real API call — GET /api/public/hospitals

export function HospitalDirectory() {
  const [query, setQuery] = useState("");

  const filtered = HOSPITALS.filter((h) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q)
    );
  });

  return (
    <section id="hospitals" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="h-px w-6 bg-brand" />
            Hospital Directory
            <span className="h-px w-6 bg-brand" />
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Find your hospital
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Search from our directory of hospitals. Select yours to continue to
            its secure portal.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by hospital name or city..."
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {filtered.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mx-auto mt-10 max-w-md rounded-lg border border-dashed border-border py-12 text-center">
            <p className="font-medium">No hospitals found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different hospital name or city.
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/hospitals"
            className={cn(buttonVariants({ variant: "default" }), "h-11 px-6")}
          >
            Browse all hospitals
          </Link>
        </div>
      </div>
    </section>
  );
}

function HospitalCard({ hospital }) {
  return (
    <div className="group relative flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-brand/40 hover:bg-hover/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-lg font-bold text-brand-soft-foreground">
        {hospital.name.charAt(0)}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{hospital.name}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {hospital.city}, {hospital.state}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {hospital.type}
        </p>
      </div>

      <Link
        href={`/login?hospitalId=${hospital.id}`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "shrink-0 hover:bg-hover hover:text-hover-foreground",
        )}
      >
        Select
      </Link>
    </div>
  );
}
