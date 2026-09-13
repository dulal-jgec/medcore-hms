"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  BedDouble,
  User,
  Wrench,
  FileText,
  Heart,
  TestTube,
  LogOut,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NURSING_TASKS } from "@/lib/nurse-mock-data";

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "COMPLETED", label: "Completed" },
];

const PRIORITY_CONFIG = {
  HIGH: { label: "High", class: "bg-destructive/10 text-destructive" },
  MEDIUM: {
    label: "Medium",
    class: "bg-highlight-soft text-highlight-soft-foreground",
  },
  LOW: { label: "Low", class: "bg-muted text-muted-foreground" },
};

const CATEGORY_ICONS = {
  PROCEDURE: Wrench,
  ASSIST: Stethoscope,
  SAMPLE: TestTube,
  CARE: Heart,
  DOCUMENTATION: FileText,
  DISCHARGE: LogOut,
};

export default function NurseTasksPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return NURSING_TASKS.filter((t) => {
      const matchQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.patientName && t.patientName.toLowerCase().includes(q));
      const matchStatus = status === "all" || t.status === status;
      const matchPriority = priority === "all" || t.priority === priority;
      return matchQuery && matchStatus && matchPriority;
    });
  }, [query, status, priority]);

  const hasFilters = query || status !== "all" || priority !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  const counts = {
    all: NURSING_TASKS.length,
    PENDING: NURSING_TASKS.filter((t) => t.status === "PENDING").length,
    IN_PROGRESS: NURSING_TASKS.filter((t) => t.status === "IN_PROGRESS").length,
    COMPLETED: NURSING_TASKS.filter((t) => t.status === "COMPLETED").length,
  };

  const highPriority = NURSING_TASKS.filter(
    (t) => t.priority === "HIGH" && t.status !== "COMPLETED"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Ward A · Morning Shift
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My tasks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nursing tasks assigned to you this shift.
        </p>
      </div>

      {/* Alert */}
      {highPriority > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm">
            <span className="font-semibold text-destructive">
              {highPriority} high priority task{highPriority > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              require immediate attention.
            </span>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks or patients..."
            className="h-11 pl-10"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 lg:w-44"
        >
          <option value="all">All priorities</option>
          <option value="HIGH">High only</option>
          <option value="MEDIUM">Medium only</option>
          <option value="LOW">Low only</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-11">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Task status">
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
        {filtered.length} task{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* List */}
      <div className="mt-6 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((task) => <TaskRow key={task.id} task={task} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-5 text-base font-semibold">No tasks found</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════ Task Row ══════════ */

function TaskRow({ task }) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const CategoryIcon = CATEGORY_ICONS[task.category] || ClipboardList;
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";
  const isHighPriority = task.priority === "HIGH" && !isCompleted;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",
        isHighPriority
          ? "border-destructive/30"
          : isInProgress
          ? "border-brand/40"
          : isCompleted
          ? "border-border opacity-70"
          : "border-border"
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Category icon */}
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isCompleted
              ? "bg-muted text-muted-foreground"
              : isHighPriority
              ? "bg-destructive/10 text-destructive"
              : isInProgress
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <CategoryIcon className="h-5 w-5" />
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "text-base font-semibold tracking-tight",
                isCompleted && "line-through decoration-muted-foreground/50"
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                priorityConfig.class
              )}
            >
              {priorityConfig.label}
            </span>
            {isInProgress && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                In progress
              </span>
            )}
            {isCompleted && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Completed
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {task.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {task.patientName && (
              <span className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                <span className="font-medium text-foreground">
                  {task.patientName}
                </span>
                · Bed {task.bed}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Due {task.dueAt}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {!isCompleted && !isInProgress && (
            <Button size="sm">
              <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
              Start
            </Button>
          )}
          {isInProgress && (
            <Button size="sm">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Complete
            </Button>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
}