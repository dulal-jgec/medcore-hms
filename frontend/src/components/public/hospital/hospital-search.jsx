"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Search, Stethoscope, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HospitalSearch({
  hospitalId,
  departments = [],
  doctors = [],
  compact = false,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { departments: [], doctors: [] };

    return {
      departments: departments.filter((d) => d.name?.toLowerCase().includes(q)),
      doctors: doctors.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q),
      ),
    };
  }, [query, departments, doctors]);

  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const totalResults = results.departments.length + results.doctors.length;
  const showDropdown = open && query.trim().length > 0;

  function goTo(href) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full", compact ? "lg:max-w-sm" : "lg:max-w-md")}
    >
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "left-3 h-3.5 w-3.5" : "left-3.5 h-4 w-4",
        )}
      />

      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={
          compact ? "Search..." : "Search doctors, departments, specialties"
        }
        className={cn(
          "bg-background",
          compact ? "h-10 pl-9 pr-9 text-sm" : "h-11 pl-11 pr-10",
        )}
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-hover hover:text-hover-foreground",
            compact ? "right-2" : "right-3",
          )}
          aria-label="Clear search"
        >
          <X className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-2xl sm:max-h-[28rem]">
          {totalResults === 0 ? (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">No results</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Nothing matched &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <>
              {results.departments.length > 0 && (
                <div className="py-1">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Departments
                  </p>
                  {results.departments.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        goTo(`/hospitals/${hospitalId}/departments/${d.id}`)
                      }
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-hover"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {d.name}
                        </span>
                        {d.beds > 0 && (
                          <span className="mt-0.5 block text-[11px] text-muted-foreground">
                            {d.beds} beds
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}

              {results.doctors.length > 0 && (
                <div className="py-1">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Doctors
                  </p>
                  {results.doctors.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        goTo(`/hospitals/${hospitalId}/doctors/${d.id}`)
                      }
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-hover"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                        <Stethoscope className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {d.name}
                        </span>
                        {d.specialty && (
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {d.specialty}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
