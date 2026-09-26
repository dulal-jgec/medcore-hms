"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Globe2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  createDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedules,
  getMyDoctorProfile,
  updateDoctorSchedule,
} from "@/services/doctor.service";

const DAYS = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
];

export default function DoctorSchedulePage() {
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const profileRes = await getMyDoctorProfile();
        const doc = profileRes.data;
        if (!mounted) return;
        setDoctor(doc);

        const scheduleRes = await getDoctorSchedules(doc.id);
        if (!mounted) return;
        setSchedules(
          Array.isArray(scheduleRes.data) ? scheduleRes.data : []
        );
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load your schedule.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    for (const day of DAYS) map[day.value] = [];
    for (const s of schedules) {
      if (map[s.dayOfWeek]) map[s.dayOfWeek].push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      );
    }
    return map;
  }, [schedules]);

  const stats = useMemo(() => {
    const active = schedules.filter((s) => s.available);
    const workingDays = new Set(active.map((s) => s.dayOfWeek)).size;

    const totalMinutes = active.reduce(
      (sum, s) => sum + minutesBetween(s.startTime, s.endTime),
      0
    );

    return {
      totalSlots: active.length,
      workingDays,
      weeklyHours: Math.round(totalMinutes / 60),
    };
  }, [schedules]);

  function openCreate(day) {
    setEditing({ dayOfWeek: day || "MONDAY" });
    setEditorOpen(true);
  }

  function openEdit(schedule) {
    setEditing(schedule);
    setEditorOpen(true);
  }

  async function handleDelete(schedule) {
    if (
      !window.confirm(
        `Delete ${labelForDay(schedule.dayOfWeek)} ${formatTime(
          schedule.startTime
        )}–${formatTime(schedule.endTime)}?`
      )
    ) {
      return;
    }

    try {
      await deleteDoctorSchedule(schedule.id);
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } catch (err) {
      alert(err.message || "Unable to delete the slot.");
    }
  }

  function handleSaved(saved, mode) {
    setSchedules((prev) => {
      if (mode === "create") return [...prev, saved];
      return prev.map((s) => (s.id === saved.id ? { ...s, ...saved } : s));
    });
    setEditorOpen(false);
    setEditing(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load your schedule
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Doctor profile is missing."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/doctor"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Button onClick={() => openCreate("MONDAY")}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add time slot
        </Button>
      </div>

      {/* Public visibility notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Globe2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brand-soft-foreground">
            Publicly visible
          </p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            These slots appear on your public doctor profile. Patients can
            pick any open slot to book.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat
          icon={CalendarClock}
          label="Weekly slots"
          value={stats.totalSlots}
          sub="active blocks"
        />
        <MiniStat
          icon={Clock}
          label="Weekly hours"
          value={`${stats.weeklyHours}h`}
          sub="OPD time"
          accent
        />
        <MiniStat
          icon={TrendingUp}
          label="Working days"
          value={stats.workingDays}
          sub="per week"
        />
      </div>

      {/* Schedule table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="hidden grid-cols-12 gap-4 border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
          <span className="col-span-3">Day</span>
          <span className="col-span-7">Time blocks</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        <div className="divide-y divide-border">
          {DAYS.map((day) => (
            <DayRow
              key={day.value}
              day={day}
              slots={grouped[day.value] || []}
              onAdd={() => openCreate(day.value)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Note:</span> Changes
          to your schedule affect new bookings only. Existing appointments
          remain unchanged.
        </p>
      </div>

      {editorOpen && editing && (
        <ScheduleEditor
          doctorId={doctor.id}
          initial={editing}
          onClose={() => {
            setEditorOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

/* ══════════ Day Row ══════════ */

function DayRow({ day, slots, onAdd, onEdit, onDelete }) {
  const isToday =
    new Date().toLocaleString("en-IN", { weekday: "long" }) === day.label;

  return (
    <div
      className={cn(
        "grid gap-3 px-6 py-4 sm:grid-cols-12 sm:items-center sm:gap-4",
        isToday && "bg-brand-soft/30"
      )}
    >
      <div className="sm:col-span-3">
        <p
          className={cn(
            "text-sm font-semibold",
            isToday && "text-brand-soft-foreground"
          )}
        >
          {day.label}
          {isToday && (
            <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground">
              Today
            </span>
          )}
        </p>
      </div>

      <div className="sm:col-span-7">
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No availability</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <ScheduleChip
                key={slot.id}
                slot={slot}
                onEdit={() => onEdit(slot)}
                onDelete={() => onDelete(slot)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sm:col-span-2 sm:text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={onAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

function ScheduleChip({ slot, onEdit, onDelete }) {
  return (
    <div
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
        slot.available
          ? "border-brand/30 bg-brand-soft text-brand-soft-foreground"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      <Clock className="h-3 w-3" />
      <span
        className={cn(
          "font-semibold",
          !slot.available && "line-through opacity-70"
        )}
      >
        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
      </span>

      <span className="flex items-center gap-0.5 border-l border-current/20 pl-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-black/5"
          aria-label="Edit slot"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-black/5"
          aria-label="Delete slot"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </span>
    </div>
  );
}

/* ══════════ Modal ══════════ */

function ScheduleEditor({ doctorId, initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState({
    dayOfWeek: initial.dayOfWeek || "MONDAY",
    startTime: normalizeInputTime(initial.startTime) || "09:00",
    endTime: normalizeInputTime(initial.endTime) || "13:00",
    available: initial.available === undefined ? true : initial.available,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        const res = await updateDoctorSchedule(initial.id, {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          available: form.available,
        });
        onSaved(res.data, "update");
      } else {
        const res = await createDoctorSchedule({
          doctorId,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        onSaved(res.data, "create");
      }
    } catch (err) {
      setError(err.message || "Unable to save the slot.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
              <CalendarClock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                {isEdit ? "Edit time slot" : "Add time slot"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Update this availability block."
                  : "Define a new availability block."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Day of week
              </label>
              <select
                value={form.dayOfWeek}
                onChange={(e) => update("dayOfWeek", e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Start time
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => update("startTime", e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  End time
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => update("endTime", e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>

            {isEdit && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => update("available", e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <div>
                  <p className="text-sm font-medium">
                    Available for booking
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Uncheck to temporarily hide this slot.
                  </p>
                </div>
              </label>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isEdit ? "Save changes" : "Create slot"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════ Small components ══════════ */

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

/* ══════════ Helpers ══════════ */

function labelForDay(value) {
  return DAYS.find((d) => d.value === value)?.label || value;
}

function formatTime(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}

function normalizeInputTime(time) {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return "";
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
}

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}