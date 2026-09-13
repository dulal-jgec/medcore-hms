"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Clock,
  Pill,
  AlertCircle,
  Plus,
  FileText,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Stethoscope,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ASSIGNED_PATIENTS,
  VITALS_QUEUE,
  MEDICATION_ROUNDS,
} from "@/lib/nurse-mock-data";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = Number(params.id);
  const patient = ASSIGNED_PATIENTS.find((p) => p.id === patientId);
  const [tab, setTab] = useState("vitals");

  if (!patient) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">Patient not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/portal/nurse/patients">Back to patients</Link>
        </Button>
      </div>
    );
  }

  const vitalsInfo = VITALS_QUEUE.find((v) => v.patientId === patientId);
  const medicationRounds = MEDICATION_ROUNDS.filter(
    (m) => m.patientId === patientId
  );

  // Mock vitals history
  const vitalsHistory = [
    {
      id: 1,
      recordedAt: "2026-09-13 08:30 AM",
      recordedBy: "Sunita Kumari",
      bp: vitalsInfo?.lastRecorded.bp || "122/80",
      pulse: vitalsInfo?.lastRecorded.pulse || "72",
      temp: vitalsInfo?.lastRecorded.temp || "98.2",
      spo2: vitalsInfo?.lastRecorded.spo2 || "98",
      notes: "Patient stable, no complaints",
    },
    {
      id: 2,
      recordedAt: "2026-09-13 06:30 AM",
      recordedBy: "Night shift nurse",
      bp: "124/82",
      pulse: "74",
      temp: "98.3",
      spo2: "97",
      notes: "",
    },
    {
      id: 3,
      recordedAt: "2026-09-13 04:00 AM",
      recordedBy: "Night shift nurse",
      bp: "126/84",
      pulse: "76",
      temp: "98.4",
      spo2: "97",
      notes: "Mild discomfort — reported to doctor",
    },
    {
      id: 4,
      recordedAt: "2026-09-13 12:00 AM",
      recordedBy: "Night shift nurse",
      bp: "128/86",
      pulse: "78",
      temp: "98.5",
      spo2: "96",
      notes: "",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Breadcrumb */}
      <Link
        href="/portal/nurse/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to patients
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold",
              patient.status === "CRITICAL"
                ? "bg-destructive/10 text-destructive"
                : "bg-brand-soft text-brand-soft-foreground"
            )}
          >
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <StatusBadge status={patient.status} />
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                {patient.age} yrs · {patient.gender}
              </span>
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5" />
                {patient.bed} · {patient.ward}
              </span>
              <span className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5" />
                {patient.bloodGroup}
              </span>
            </div>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Condition: </span>
              <span className="font-medium">{patient.condition}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Primary doctor: {patient.primaryDoctor}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href={`/portal/nurse/vitals/record?patientId=${patient.id}`}>
              <Activity className="mr-1.5 h-4 w-4" />
              Record vitals
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/portal/nurse/medications">
              <Pill className="mr-1.5 h-4 w-4" />
              Medication
            </Link>
          </Button>
        </div>
      </div>

      {/* Allergies alert */}
      {patient.allergies.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Known allergies
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Current vitals snapshot */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Latest vitals · {vitalsInfo?.lastRecorded ? "08:30 AM" : "No data"}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <VitalTile
            icon={Heart}
            label="Blood Pressure"
            value={vitalsInfo?.lastRecorded.bp || "—"}
            unit="mmHg"
          />
          <VitalTile
            icon={Activity}
            label="Pulse"
            value={vitalsInfo?.lastRecorded.pulse || "—"}
            unit="bpm"
          />
          <VitalTile
            icon={Thermometer}
            label="Temperature"
            value={vitalsInfo?.lastRecorded.temp || "—"}
            unit="°F"
          />
          <VitalTile
            icon={Wind}
            label="SpO₂"
            value={vitalsInfo?.lastRecorded.spo2 || "—"}
            unit="%"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-border">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Patient sections">
          {[
            { id: "vitals", label: "Vitals history" },
            { id: "medications", label: "Medications" },
            { id: "notes", label: "Notes" },
          ].map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  active
                    ? "text-foreground after:bg-brand"
                    : "text-muted-foreground hover:text-foreground after:bg-transparent"
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {tab === "vitals" && <VitalsHistory vitals={vitalsHistory} />}
        {tab === "medications" && (
          <MedicationsList rounds={medicationRounds} />
        )}
        {tab === "notes" && <NotesPanel />}
      </div>
    </div>
  );
}

/* ══════════ Sub-components ══════════ */

function VitalsHistory({ vitals }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          Vitals timeline
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {vitals.length} recordings in the last 24 hours
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">BP</th>
              <th className="px-5 py-3">Pulse</th>
              <th className="px-5 py-3">Temp</th>
              <th className="px-5 py-3">SpO₂</th>
              <th className="px-5 py-3">Recorded by</th>
              <th className="px-5 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vitals.map((v) => (
              <tr
                key={v.id}
                className="transition-colors hover:bg-hover/40"
              >
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium">
                  {v.recordedAt.split(" ").slice(-2).join(" ")}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm">
                  <span className="font-semibold">{v.bp}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    mmHg
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm">
                  <span className="font-semibold">{v.pulse}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    bpm
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm">
                  <span className="font-semibold">{v.temp}</span>
                  <span className="ml-1 text-xs text-muted-foreground">°F</span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm">
                  <span className="font-semibold">{v.spo2}</span>
                  <span className="ml-1 text-xs text-muted-foreground">%</span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground">
                  {v.recordedBy}
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  {v.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {vitals.map((v) => (
          <div key={v.id} className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {v.recordedAt.split(" ").slice(-2).join(" ")}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {v.recordedBy}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <MiniVital label="BP" value={v.bp} />
              <MiniVital label="Pulse" value={v.pulse} />
              <MiniVital label="Temp" value={v.temp} />
              <MiniVital label="SpO₂" value={v.spo2} />
            </div>
            {v.notes && (
              <p className="mt-3 text-xs text-muted-foreground">
                {v.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniVital({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function MedicationsList({ rounds }) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <Pill className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No medications scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <div
          key={round.id}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{round.timeSlot}</span>
            </div>
            <RoundStatus status={round.status} />
          </div>

          <ul className="divide-y divide-border">
            {round.medications.map((m) => (
              <li
                key={m.name}
                className="flex items-start justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {m.dose} · {m.route}
                  </p>
                  {m.notes && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {m.notes}
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  Given
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function NotesPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Nursing notes
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Shift observations and handover notes
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add note
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {[
          {
            id: 1,
            author: "Sunita Kumari",
            time: "08:45 AM",
            content:
              "Patient alert and oriented. Ate breakfast fully. No complaints of pain.",
          },
          {
            id: 2,
            author: "Night shift — Rekha Devi",
            time: "06:00 AM",
            content:
              "Slept well through the night. Slight discomfort at 4 AM — informed duty doctor.",
          },
        ].map((note) => (
          <li key={note.id} className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-bold text-brand-soft-foreground">
                {note.author.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-medium">{note.author}</p>
                <p className="text-[11px] text-muted-foreground">
                  {note.time}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {note.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VitalTile({ icon: Icon, label, value, unit }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    STABLE: { label: "Stable", class: "bg-brand-soft text-brand-soft-foreground" },
    CRITICAL: {
      label: "Critical",
      class: "bg-destructive/10 text-destructive",
    },
  };
  const config = map[status] || map.STABLE;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}

function RoundStatus({ status }) {
  const map = {
    OVERDUE: { label: "Overdue", class: "bg-destructive/10 text-destructive" },
    IN_PROGRESS: { label: "In progress", class: "bg-brand text-brand-foreground" },
    PENDING: { label: "Pending", class: "bg-highlight-soft text-highlight-soft-foreground" },
    COMPLETED: { label: "Completed", class: "bg-muted text-muted-foreground" },
  };
  const config = map[status] || map.PENDING;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}