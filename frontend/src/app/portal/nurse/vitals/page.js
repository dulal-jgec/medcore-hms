"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Activity,
  Heart,
  Clock,
  AlertCircle,
  CheckCircle2,
  Thermometer,
  Wind,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VITALS_QUEUE } from "@/lib/nurse-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "due", label: "Due now" },
  { id: "upcoming", label: "Upcoming" },
];

export default function NurseVitalsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = VITALS_QUEUE;

    if (tab === "due") list = list.filter((v) => v.overdue || v.priority === "URGENT");
    if (tab === "upcoming") list = list.filter((v) => !v.overdue && v.priority !== "URGENT");

    return list.filter((v) => {
      if (!q) return true;
      return (
        v.patientName.toLowerCase().includes(q) ||
        v.bed.toLowerCase().includes(q)
      );
    });
  }, [query, tab]);

  const hasFilters = query || tab !== "all";

  function clearFilters() {
    setQuery("");
    setTab("all");
  }

  const counts = {
    all: VITALS_QUEUE.length,
    due: VITALS_QUEUE.filter((v) => v.overdue || v.priority === "URGENT").length,
    upcoming: VITALS_QUEUE.filter((v) => !v.overdue && v.priority !== "URGENT").length,
  };

  const overdueCount = VITALS_QUEUE.filter((v) => v.overdue).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Ward A · 3rd Floor
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Vitals to record
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {VITALS_QUEUE.length} patients need vitals recorded this shift.
        </p>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {overdueCount} vitals recording{overdueCount > 1 ? "s" : ""} overdue
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Record immediately to keep patient monitoring up to date.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTab("due")}
            className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Show overdue
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name or bed..."
            className="h-11 pl-10"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Vitals filter">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  isActive
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} patient{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((v) => <VitalsRow key={v.id} vitals={v} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
              <CheckCircle2 className="h-6 w-6 text-brand-soft-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">
              Nothing due right now
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              All vitals up to date.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VitalsRow({ vitals }) {
  const isOverdue = vitals.overdue;
  const isUrgent = vitals.priority === "URGENT";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isOverdue
          ? "border-destructive/30 hover:border-destructive/60"
          : "border-border hover:border-brand/40"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isOverdue
              ? "bg-destructive/10 text-destructive"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Activity className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {vitals.patientName}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {vitals.bed}
            </span>
            {isOverdue && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Overdue
              </span>
            )}
            {isUrgent && !isOverdue && (
              <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-highlight-soft-foreground">
                Urgent
              </span>
            )}
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Due at {vitals.dueAt}
          </p>

          {/* Last recorded */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <LastVital icon={Heart} label="BP" value={vitals.lastRecorded.bp} unit="mmHg" />
            <LastVital icon={Activity} label="Pulse" value={vitals.lastRecorded.pulse} unit="bpm" />
            <LastVital icon={Thermometer} label="Temp" value={vitals.lastRecorded.temp} unit="°F" />
            <LastVital icon={Wind} label="SpO₂" value={vitals.lastRecorded.spo2} unit="%" />
          </div>
        </div>

        <Button size="sm" asChild className="shrink-0">
          <Link
            href={`/portal/nurse/vitals/record?patientId=${vitals.patientId}`}
          >
            Record
          </Link>
        </Button>
      </div>
    </div>
  );
}

function LastVital({ icon: Icon, label, value, unit }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">
        {value}
        <span className="ml-0.5 text-[10px] text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}