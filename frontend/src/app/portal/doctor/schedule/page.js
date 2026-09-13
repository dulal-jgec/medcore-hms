"use client";

import { useState } from "react";
import {
  Clock,
  Plus,
  Calendar,
  Users,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Save,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WEEKLY_SCHEDULE } from "@/lib/doctor-mock-data";

const DEFAULT_SLOTS = ["Morning", "Afternoon", "Evening"];

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState(WEEKLY_SCHEDULE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(WEEKLY_SCHEDULE);
  const [saved, setSaved] = useState(false);

  const totalSlots = schedule.reduce((s, d) => s + d.slots, 0);
  const totalBooked = schedule.reduce((s, d) => s + d.booked, 0);
  const workingDays = schedule.filter((d) => d.slots > 0).length;
  const utilization =
    totalSlots > 0 ? Math.round((totalBooked / totalSlots) * 100) : 0;

  function startEdit() {
    setDraft(JSON.parse(JSON.stringify(schedule)));
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(JSON.parse(JSON.stringify(schedule)));
    setEditing(false);
  }

  function updateDraft(day, field, value) {
    setDraft((prev) =>
      prev.map((d) => (d.day === day ? { ...d, [field]: value } : d))
    );
  }

  // TODO: PUT /api/v1/doctor-schedules/me
  async function save() {
    await new Promise((r) => setTimeout(r, 500));
    setSchedule(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            My Schedule
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Weekly availability
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your OPD hours. Patients book appointments within these slots.
          </p>
        </div>
        {!editing && (
          <Button onClick={startEdit}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit schedule
          </Button>
        )}
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft/50 px-4 py-3 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
          <p className="font-medium text-brand-soft-foreground">
            Schedule updated successfully
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MiniStat
          icon={Clock}
          label="Weekly slots"
          value={totalSlots}
          sub="total"
        />
        <MiniStat
          icon={Users}
          label="Booked"
          value={totalBooked}
          sub="this week"
          accent
        />
        <MiniStat
          icon={Calendar}
          label="Working days"
          value={workingDays}
          sub="per week"
        />
        <MiniStat
          icon={TrendingUp}
          label="Utilization"
          value={`${utilization}%`}
          sub="slots filled"
        />
      </div>

      {/* Schedule table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-12 sm:gap-4">
          <span className="sm:col-span-3">Day</span>
          <span className="sm:col-span-5">Hours</span>
          <span className="sm:col-span-2">Slots</span>
          <span className="sm:col-span-2 text-right">Status</span>
        </div>

        <div className="divide-y divide-border">
          {(editing ? draft : schedule).map((day) => (
            <DayRow
              key={day.day}
              day={day}
              editing={editing}
              onChange={(field, value) => updateDraft(day.day, field, value)}
            />
          ))}
        </div>
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={cancelEdit}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={save}>
            <Save className="mr-1.5 h-4 w-4" />
            Save changes
          </Button>
        </div>
      )}

      {/* Info note */}
      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> Changes to
          your schedule will affect new bookings only. Existing appointments
          remain unchanged. Slots can also be managed by your hospital
          administrator.
        </p>
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function DayRow({ day, editing, onChange }) {
  const isOff = day.slots === 0;
  const isToday =
    day.day === new Date().toLocaleString("en-IN", { weekday: "long" });

  return (
    <div
      className={cn(
        "grid gap-3 px-6 py-4 sm:grid-cols-12 sm:items-center sm:gap-4",
        isToday && "bg-brand-soft/30"
      )}
    >
      {/* Day name */}
      <div className="sm:col-span-3">
        <p
          className={cn(
            "text-sm font-semibold",
            isToday && "text-brand-soft-foreground"
          )}
        >
          {day.day}
          {isToday && (
            <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground">
              Today
            </span>
          )}
        </p>
      </div>

      {/* Hours */}
      <div className="sm:col-span-5">
        {editing ? (
          <input
            value={day.hours}
            onChange={(e) => onChange("hours", e.target.value)}
            disabled={isOff}
            placeholder="e.g. 10:00 AM – 2:00 PM"
            className={cn(
              "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30",
              isOff && "cursor-not-allowed opacity-50"
            )}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{day.hours}</p>
        )}
      </div>

      {/* Slots */}
      <div className="sm:col-span-2">
        {editing ? (
          <input
            type="number"
            value={day.slots}
            onChange={(e) =>
              onChange("slots", Math.max(0, parseInt(e.target.value) || 0))
            }
            min={0}
            max={20}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        ) : (
          <div className="flex items-center gap-2">
            {!isOff ? (
              <>
                <p className="text-sm font-semibold">{day.slots}</p>
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{
                      width: `${day.slots > 0 ? (day.booked / day.slots) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {day.booked}/{day.slots}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="sm:col-span-2 sm:text-right">
        {isOff ? (
          <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Off
          </span>
        ) : (
          <span className="inline-block rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
            Active
          </span>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent
              ? "bg-brand text-brand-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
        </div>
      </div>
    </div>
  );
}