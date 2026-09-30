"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  MapPin,
  PlayCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroTrustBadges } from "./hero-trust-badges";
import { getPublicHospitals } from "@/services/hospital-public.service";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getPublicHospitals({
          page: 0,
          size: 100,
          sortBy: "name",
          sortDir: "asc",
        });
        if (!mounted) return;
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content || [];
        setAllHospitals(list);
      } catch {
        if (mounted) setAllHospitals([]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      const filtered = allHospitals
        .filter(
          (h) =>
            h.name?.toLowerCase().includes(q) ||
            h.city?.toLowerCase().includes(q) ||
            h.state?.toLowerCase().includes(q),
        )
        .slice(0, 6);
      setResults(filtered);
      setSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, allHospitals]);

  useEffect(() => {
    function onClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(hospital) {
    router.push(`/hospitals/${hospital.id}`);
  }

  function submit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/hospitals?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative w-full bg-primary-darker text-white">
      {/* ───── DESKTOP background image (hidden on mobile) ───── */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src="/images/hero-hospital.jpg"
          alt="Modern hospital corridor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-primary-darker/40" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-primary-darker/90 via-primary-darker/55 to-primary-darker/10"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-darker via-primary-darker/60 to-transparent"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:min-h-[92vh] lg:px-8 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* ───── TEXT COLUMN ───── */}
          <div className="lg:col-span-7 lg:max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand backdrop-blur-md sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.18em]">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Trusted across India
            </div>

            <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:mt-7 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.08]">
              The{" "}
              <span className="bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
                connected
              </span>{" "}
              operating system for modern hospitals.
            </h1>

            <p className="mt-3.5 max-w-2xl text-[13px] leading-relaxed text-white/80 sm:mt-6 sm:text-base lg:text-lg">
              One secure, multi-tenant platform for patients, doctors,
              appointments, labs, pharmacy, and billing.
            </p>

            {/* Search */}
            <form
              ref={containerRef}
              onSubmit={submit}
              className="relative mt-6 max-w-2xl sm:mt-10"
            >
              <div className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-2xl backdrop-blur-xl sm:gap-2 sm:p-2">
                <Search className="ml-2.5 h-4 w-4 shrink-0 text-white/70 sm:ml-3 sm:h-5 sm:w-5" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search hospitals..."
                  className="h-10 flex-1 border-0 bg-transparent px-1 text-sm text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-12 sm:text-base"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Clear"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="hidden h-12 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90 sm:inline-flex"
                >
                  Search
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 shrink-0 bg-brand text-brand-foreground hover:bg-brand/90 sm:hidden"
                >
                  Go
                </Button>
              </div>

              {showResults && query.trim() && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
                  {searching ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No hospitals found for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {results.map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => pick(h)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                              <Building2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {h.name}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {[h.city, h.state].filter(Boolean).join(", ") ||
                                  "—"}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>

            {/* CTAs */}
            <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 w-full bg-white text-primary-darker hover:bg-white/90 sm:h-12 sm:w-auto"
              >
                <Link href="/hospitals">
                  Browse hospitals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full border-white/25 bg-white/5 text-white backdrop-blur hover:bg-white/15 hover:text-white sm:h-12 sm:w-auto"
              >
                <Link href="/how-it-works">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </div>

            {/* Trust badges — desktop only in the text column */}
            <div className="mt-10 hidden max-w-2xl lg:block">
              <HeroTrustBadges />
            </div>
          </div>

          {/* ───── MOBILE IMAGE COLUMN (and empty on desktop, bg image shows) ───── */}
          <div className="lg:col-span-5 lg:hidden">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <Image
                src="/images/hero-hospital.jpg"
                alt="Modern hospital corridor"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 0vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-primary-darker/80 via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  Inside MedCore
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile trust badges below the image */}
        <div className="mt-6 lg:hidden">
          <HeroTrustBadges />
        </div>
      </div>
    </section>
  );
}
