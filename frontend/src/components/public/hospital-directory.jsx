"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  MapPin,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicHospitals } from "@/services/hospital-public.service";

const FALLBACK_IMAGES = [
  "/images/hospital-1.jpg",
  "/images/hospital-2.jpg",
  "/images/hospital-3.jpg",
];

export function HospitalDirectory() {
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicHospitals({
          page: 0,
          size: 12,
          sortBy: "name",
          sortDir: "asc",
        });
        if (!mounted) return;
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setHospitals(list);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load hospitals");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q),
    );
  }, [hospitals, query]);

  return (
    <section id="hospitals" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand sm:text-xs sm:tracking-[0.18em]">
            <span className="h-px w-5 bg-brand sm:w-6" />
            Hospital Directory
            <span className="h-px w-5 bg-brand sm:w-6" />
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Find your hospital
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Search the MedCore network and open your hospital&apos;s portal.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-xl sm:mt-10">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city, or state..."
              className="h-11 pl-11 text-sm sm:h-12 sm:text-base"
            />
          </div>
        </div>

        {loading ? (
          <GridSkeleton />
        ) : error ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center sm:p-8">
            <p className="font-semibold text-destructive">
              Unable to load hospitals
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-border py-12 text-center sm:py-16">
            <Search className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-semibold">No hospitals found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different name or city.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filtered.slice(0, 9).map((h, i) => (
              <HospitalCard key={h.id} hospital={h} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length > 9 && (
          <div className="mt-10 text-center sm:mt-14">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/hospitals">
                View all {filtered.length} hospitals
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function HospitalCard({ hospital, index }) {
  const cover =
    hospital.bannerUrl ||
    hospital.logoUrl ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <Link
      href={`/hospitals/${hospital.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={cover}
          alt={hospital.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary-darker/90 via-primary-darker/30 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">
              {hospital.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/75">
              <MapPin className="h-3 w-3 shrink-0" />
              {[hospital.city, hospital.state].filter(Boolean).join(", ") ||
                "India"}
            </p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform group-hover:scale-110 sm:h-9 sm:w-9">
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5 sm:py-3.5">
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {hospital.description
            ? hospital.description.slice(0, 60) +
              (hospital.description.length > 60 ? "..." : "")
            : "Multispecialty hospital on MedCore"}
        </span>
      </div>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="aspect-[16/10] animate-pulse rounded-2xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}
