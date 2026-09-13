"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  BedDouble,
  Moon,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NURSE_PROFILE } from "@/lib/nurse-mock-data";

const WEEK_SCHEDULE = [
  {
    day: "Monday",
    shift: "Morning",
    hours: "07:00 AM – 03:00 PM",
    ward: "Ward A",
    patients: 5,
    status: "COMPLETED",
  },
  {
    day: "Tuesday",
    shift: "Morning",
    hours: "07:00 AM – 03:00 PM",
    ward: "Ward A",
    patients: 5,
    status: "COMPLETED",
  },
  {
    day: "Wednesday",
    shift: "Evening",
    hours: "03:00 PM – 11:00 PM",
    ward: "Ward A",
    patients: 4,
    status: "COMPLETED",
  },
  {
    day: "Thursday",
    shift: "Off",
    hours: "—",
    ward: "—",
    patients: 0,
    status: "OFF",
  },
  {
    day: "Friday",
    shift: "Morning",
    hours: "07:00 AM – 03:00 PM",
    ward: "Ward A",
    patients: 5,
    status: "TODAY",
  },
  {
    day: "Saturday",
    shift: "Night",
    hours: "11:00 PM – 07:00 AM",
    ward: "Ward A",
    patients: 6,
    status: "UPCOMING",
  },
  {
    day: "Sunday",
    shift: "Off",
    hours: "—",
    ward: "—",
    patients: 0,
    status: "OFF",
  },
];

const SHIFT_ICONS = {
  Morning: Sunrise,
  Evening: Sunset,
  Night: Moon,
  Off: Clock,
};

const SHIFT_COLORS = {
  Morning: "bg-highlight-soft text-highlight-soft-foreground",
  Evening: "bg-brand-soft text-brand-soft-foreground",
  Night: "bg-primary text-primary-foreground",
  Off: "bg-muted text-muted-foreground",
};

export default function NurseShiftsPage() {
  const [selectedDay, setSelectedDay] = useState("Friday");

  const today = WEEK_SCHEDULE.find((s) => s.status === "TODAY");

  const stats = {
    thisWeek: WEEK_SCHEDULE.filter((s) => s.status !== "OFF").length,
    workingHours: WEEK_SCHEDULE.filter((s) => s.status !== "OFF").length * 8,
    patientsHandled: WEEK_SCHEDULE.reduce((s, d) => s + d.patients, 0),
    offDays: WEEK_SCHEDULE.filter((s) => s.status === "OFF").length,
  };

  const selectedShift = WEEK_SCHEDULE.find((s) => s.day === selectedDay);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          My Schedule
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Weekly shifts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your assigned shifts for this week.
        </p>
      </div>

      {/* Current shift hero */}
      {today && (
        <div className="mt-6 relative overflow-hidden rounded-3xl bg-primary p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-primary-foreground/70">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-brand" />
                <span>Currently on duty</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                {today.shift} shift · {today.ward}
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/75">
                {today.hours} · {today.patients} patients assigned
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-5">
              <ShiftStat value={today.patients} label="Patients" />
              <ShiftStat value="8" label="Hours" unit="hrs" />
              <ShiftStat value="2" label="Tasks due" />
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <StatBox icon={Calendar} label="Working days" value={stats.thisWeek} />
        <StatBox icon={Clock} label="Total hours" value={`${stats.workingHours}h`} />
        <StatBox icon={Users} label="Patients (week)" value={stats.patientsHandled} />
        <StatBox icon={Moon} label="Off days" value={stats.offDays} />
      </div>

      {/* Week schedule */}
      <div className="mt-8">
        <h2 className="text-base font-semibold tracking-tight">
          This week's schedule
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Click any day to see shift details
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {WEEK_SCHEDULE.map((day) => {
            const ShiftIcon = SHIFT_ICONS[day.shift] || Clock;
            const shiftColor = SHIFT_COLORS[day.shift];
            const isToday = day.status === "TODAY";
            const isOff = day.status === "OFF";
            const isSelected = day.day === selectedDay;

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(day.day)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all hover:shadow-sm",
                  isSelected
                    ? "border-brand bg-brand-soft/40 shadow-sm"
                    : isToday
                    ? "border-brand/40 bg-brand-soft/20"
                    : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      isToday ? "text-brand" : "text-muted-foreground"
                    )}
                  >
                    {day.day.slice(0, 3)}
                  </p>
                  {isToday && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </div>

                <div
                  className={cn(
                    "mt-3 flex h-9 w-9 items-center justify-center rounded-lg",
                    shiftColor
                  )}
                >
                  <ShiftIcon className="h-4 w-4" />
                </div>

                <p
                  className={cn(
                    "mt-3 text-sm font-semibold",
                    isOff && "text-muted-foreground"
                  )}
                >
                  {day.shift}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {isOff ? "Day off" : day.hours.split(" – ")[0]}
                </p>

                {!isOff && (
                  <p className="mt-2 text-[10px] font-medium text-brand">
                    {day.patients} patients
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedShift && (
        <div className="mt-8 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand" />
              <h2 className="text-base font-semibold tracking-tight">
                {selectedShift.day} — {selectedShift.shift} shift
              </h2>
            </div>
            {selectedShift.status === "TODAY" && (
              <span className="rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                Today
              </span>
            )}
            {selectedShift.status === "OFF" && (
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Day off
              </span>
            )}
          </div>

          {selectedShift.status !== "OFF" ? (
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <DetailBox
                icon={Clock}
                label="Shift hours"
                value={selectedShift.hours}
              />
              <DetailBox
                icon={BedDouble}
                label="Ward"
                value={selectedShift.ward}
              />
              <DetailBox
                icon={Users}
                label="Patients assigned"
                value={selectedShift.patients}
              />
            </div>
          ) : (
            <div className="p-8 text-center">
              <Moon className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Rest day</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No shift scheduled — enjoy your day off.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Handover note */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <Sun className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-5 text-muted-foreground">
          Shift timings and ward assignments are set by the nursing supervisor.
          Contact them for any changes or shift swaps.
        </p>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function ShiftStat({ value, label, unit }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tracking-tight text-primary-foreground lg:text-3xl">
        {value}
        {unit && (
          <span className="ml-0.5 text-sm font-normal text-primary-foreground/70">
            {unit}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/60">
        {label}
      </p>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-brand">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}