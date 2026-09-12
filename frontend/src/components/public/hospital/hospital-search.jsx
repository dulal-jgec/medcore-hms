"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Stethoscope, Building2, X } from "lucide-react";

import { Input } from "@/components/ui/input";

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
      departments: departments.filter((d) => d.name.toLowerCase().includes(q)),
      doctors: doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q),
      ),
    };
  }, [query, departments, doctors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hasResults =
    results.departments.length > 0 || results.doctors.length > 0;
  const showDropdown = open && query.length > 0;

  function goTo(href) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={wrapRef} className="relative w-full lg:max-w-md">
      <Search
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
          compact ? "left-2.5 h-3.5 w-3.5" : "left-3 h-4 w-4"
        }`}
      />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={
          compact ? "Search…" : "Search doctors, departments, specialties..."
        }
        className={compact ? "h-9 pl-9 pr-8 text-sm" : "h-11 pl-10 pr-10"}
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover p-2 shadow-lg">
          {!hasResults ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </p>
          ) : (
            <>
              {results.departments.length > 0 && (
                <div className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Departments
                  </p>
                  {results.departments.map((d) => (
                    <button
                      key={d.id}
                      onClick={() =>
                        goTo(`/hospitals/${hospitalId}/departments/${d.id}`)
                      }
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-hover"
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-brand" />
                      <span className="font-medium">{d.name}</span>
                      {d.beds > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {d.beds} beds
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {results.doctors.length > 0 && (
                <div className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Doctors
                  </p>
                  {results.doctors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() =>
                        goTo(`/hospitals/${hospitalId}/doctors/${d.id}`)
                      }
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-hover"
                    >
                      <Stethoscope className="h-4 w-4 shrink-0 text-brand" />
                      <span className="font-medium">{d.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {d.specialty}
                      </span>
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
