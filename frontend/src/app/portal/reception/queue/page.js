"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  Phone,
  AlertCircle,
  Users,
  Bell,
  MoreVertical,
  X,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TODAY_APPOINTMENTS } from "@/lib/reception-mock-data";

export default function ReceptionQueuePage() {
  const waitingQueue = TODAY_APPOINTMENTS.filter(
    (a) => a.status === "CHECKED_IN"
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const inConsultation = TODAY_APPOINTMENTS.filter(
    (a) => a.status === "IN_PROGRESS"
  );

  const justCompleted = TODAY_APPOINTMENTS.filter(
    (a) => a.status === "COMPLETED"
  );

  const avgWait = 24; // minutes — mock

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
            Live
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Waiting queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage who's waiting and call the next patient.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QueueStat
          icon={Users}
          label="Waiting now"
          value={waitingQueue.length}
          sub="Checked in, awaiting doctor"
          accent
        />
        <QueueStat
          icon={PlayCircle}
          label="In consultation"
          value={inConsultation.length}
          sub="Currently with doctors"
        />
        <QueueStat
          icon={Clock}
          label="Avg. wait time"
          value={`${avgWait}m`}
          sub="Across today"
        />
      </div>

      {/* Queue list */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Waiting (main) */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  Currently waiting
                </h2>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-soft-foreground">
                  {waitingQueue.length}
                </span>
              </div>
            </div>

            {waitingQueue.length > 0 ? (
              <ul className="divide-y divide-border">
                {waitingQueue.map((apt, index) => (
                  <QueueRow key={apt.id} apt={apt} position={index + 1} />
                ))}
              </ul>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-5 text-base font-semibold">Queue is empty</p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  No patients waiting right now.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* In consultation */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-brand" />
                <h2 className="text-base font-semibold tracking-tight">
                  In consultation
                </h2>
              </div>
            </div>

            {inConsultation.length > 0 ? (
              <ul className="divide-y divide-border">
                {inConsultation.map((apt) => (
                  <li key={apt.id} className="p-5">
                    <p className="text-sm font-semibold">{apt.patientName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {apt.doctorName}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                      In progress
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">
                No consultations in progress
              </p>
            )}
          </div>

          {/* Just completed */}
          <div className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold tracking-tight">
                  Recently completed
                </h2>
              </div>
            </div>

            {justCompleted.length > 0 ? (
              <ul className="divide-y divide-border">
                {justCompleted.slice(0, 3).map((apt) => (
                  <li
                    key={apt.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {apt.patientName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {apt.doctorName}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                      {apt.slot}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">
                No completed visits yet
              </p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Queue order is based on check-in time. Call patients in order to
              keep the doctor on schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Queue Row ══════════ */

function QueueRow({ apt, position }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <li
      className={cn(
        "relative p-4 transition-colors hover:bg-hover/40 sm:p-5",
        position === 1 && "bg-brand-soft/30"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Position badge */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold",
              position === 1
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-foreground"
            )}
          >
            {position}
          </div>
          {position === 1 && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand">
              Next
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {apt.patientName}
            </h3>
            {position === 1 && (
              <span className="flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                <Bell className="h-3 w-3" />
                Call next
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Checked in {apt.checkedInAt}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {apt.patientPhone}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span>
              <span className="text-muted-foreground">Doctor: </span>
              <span className="font-medium">{apt.doctorName}</span>
            </span>
            <span className="text-muted-foreground">
              Slot {apt.slot} · {apt.department}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-start gap-1">
          {position === 1 ? (
            <Button size="sm">
              <Bell className="mr-1.5 h-3.5 w-3.5" />
              Call next
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Notify
            </Button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-popover p-1 shadow-lg">
                  <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-hover">
                    Mark as no-show
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-hover">
                    Remove from queue
                  </button>
                  <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
                    Cancel appointment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function QueueStat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}