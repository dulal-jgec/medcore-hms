"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  BedDouble,
  User,
  ChevronRight,
  Ban,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MEDICATION_ROUNDS } from "@/lib/nurse-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "OVERDUE", label: "Overdue" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "PENDING", label: "Pending" },
  { id: "COMPLETED", label: "Completed" },
];

const ROUND_STATUS = {
  OVERDUE: {
    label: "Overdue",
    icon: AlertCircle,
    class: "bg-destructive/10 text-destructive",
  },
  IN_PROGRESS: {
    label: "In progress",
    icon: PlayCircle,
    class: "bg-brand text-brand-foreground",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    class: "bg-highlight-soft text-highlight-soft-foreground",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    class: "bg-muted text-muted-foreground",
  },
};

export default function NurseMedicationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [openRound, setOpenRound] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MEDICATION_ROUNDS.filter((r) => {
      const matchQuery =
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.bed.toLowerCase().includes(q);
      const matchStatus = status === "all" || r.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, status]);

  const hasFilters = query || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  const counts = {
    all: MEDICATION_ROUNDS.length,
    OVERDUE: MEDICATION_ROUNDS.filter((r) => r.status === "OVERDUE").length,
    IN_PROGRESS: MEDICATION_ROUNDS.filter((r) => r.status === "IN_PROGRESS").length,
    PENDING: MEDICATION_ROUNDS.filter((r) => r.status === "PENDING").length,
    COMPLETED: MEDICATION_ROUNDS.filter((r) => r.status === "COMPLETED").length,
  };

  const overdueCount = counts.OVERDUE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Ward A · Morning Shift
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Medication rounds
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administer scheduled medicines to all assigned patients.
        </p>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              {overdueCount} round{overdueCount > 1 ? "s" : ""} overdue
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Administer immediately and document the delay.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatus("OVERDUE")}
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
        <nav className="flex gap-6 overflow-x-auto" aria-label="Medication status">
          {STATUS_TABS.map(({ id, label }) => {
            const isActive = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatus(id)}
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
        {filtered.length} round{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((round) => (
            <MedicationRoundCard
              key={round.id}
              round={round}
              expanded={openRound === round.id}
              onToggle={() =>
                setOpenRound(openRound === round.id ? null : round.id)
              }
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No rounds found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Medication Round Card ══════════ */

function MedicationRoundCard({ round, expanded, onToggle }) {
  const config = ROUND_STATUS[round.status];
  const StatusIcon = config.icon;
  const isOverdue = round.status === "OVERDUE";
  const isInProgress = round.status === "IN_PROGRESS";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        isOverdue
          ? "border-destructive/30"
          : isInProgress
          ? "border-brand/40"
          : "border-border"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            config.class
          )}
        >
          <StatusIcon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {round.patientName}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {round.bed}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                config.class
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {round.timeSlot}
            </span>
            <span>
              {round.medications.length} medicine
              {round.medications.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90"
          )}
        />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border">
          <div className="p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medications
            </h4>

            <ul className="mt-4 space-y-3">
              {round.medications.map((med, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                        <Pill className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{med.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {med.dose} · {med.route}
                        </p>
                        {med.notes && (
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] italic text-highlight-soft-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {med.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {round.status !== "COMPLETED" && (
                      <Button size="sm" variant="outline" className="shrink-0">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Given
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Round actions */}
            {round.status !== "COMPLETED" && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
                <Button size="sm" asChild>
                  <Link href={`/portal/nurse/medications/${round.id}`}>
                    <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                    {isInProgress ? "Continue round" : "Start round"}
                  </Link>
                </Button>
                <Button size="sm" variant="outline">
                  <Ban className="mr-1.5 h-3.5 w-3.5" />
                  Patient refused
                </Button>
                <Button size="sm" variant="ghost">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                  Add note
                </Button>
              </div>
            )}

            {round.status === "COMPLETED" && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft-foreground">
                    Round completed
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All medicines administered on schedule.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}