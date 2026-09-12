"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Search,
  Star,
  Stethoscope,
  Languages,
  X,
  Calendar,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HOSPITALS } from "@/lib/hospitals";
import { getHospitalDoctors, getHospitalDepartments } from "@/lib/hospital-detail-data";

export default function DoctorsListPage() {
  const params = useParams();
  const hospitalId = Number(params.id);
  const hospital = HOSPITALS.find((h) => h.id === hospitalId);

  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  const doctors = useMemo(() => getHospitalDoctors(hospitalId), [hospitalId]);
  const departments = useMemo(() => getHospitalDepartments(hospitalId), [hospitalId]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return doctors.filter((d) => {
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q);
      const matchDept = dept === "all" || d.departmentId === dept;
      return matchQuery && matchDept;
    });
  }, [query, dept, doctors]);

  if (!hospital) return null;

  const hasFilters = query || dept !== "all";

  function clearFilters() {
    setQuery("");
    setDept("all");
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {hospital.name}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Our doctors
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Book an appointment with senior consultants across every clinical
              specialty.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="h-11 pl-10"
              />
            </div>

            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-64"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-11"
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "doctor" : "doctors"} found
          </p>
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
                >
                  <div className="flex gap-5 p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold tracking-tight">
                        {doc.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-brand">
                        {doc.specialty}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          4.9
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {doc.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-border p-3">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link
                        href={`/hospitals/${hospital.id}/doctors/${doc.id}`}
                      >
                        View Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link
                        href={`/hospitals/${hospital.id}/doctors/${doc.id}#book`}
                      >
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-lg border border-dashed border-border py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">No doctors found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-5">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}