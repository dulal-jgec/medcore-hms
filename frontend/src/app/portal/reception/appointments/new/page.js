"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Stethoscope,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import {
  getMyReceptionistProfile,
  searchPatients,
} from "@/services/receptionist.service";
import { getPublicDoctors } from "@/services/public-doctor.service";
import {
  createAppointment,
  getAvailableSlots,
} from "@/services/appointment.service";

const SEARCH_DEBOUNCE_MS = 350;

export default function ReceptionNewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  );
}

function NewAppointmentContent() {
  const router = useRouter();
  const params = useSearchParams();
  const preselectedPatientId = params.get("patientId");

  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Patient search / selection
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [patientSearching, setPatientSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Appointment
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load profile + doctors
  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    let mounted = true;

    async function load() {
      try {
        const res = await getMyReceptionistProfile();
        if (!mounted) return;
        setProfile(res.data);

        if (res.data?.hospitalId) {
          setDoctorsLoading(true);
          const doctorsRes = await getPublicDoctors(res.data.hospitalId, {
            page: 0,
            size: 100,
            sortBy: "id",
            sortDir: "asc",
          });
          if (!mounted) return;
          setDoctors(doctorsRes.data?.content || []);
        }
      } catch {
        /* silent */
      } finally {
        if (mounted) setDoctorsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [initialized, isAuthenticated]);

  // Pre-select patient from URL (returning from register)
  useEffect(() => {
    if (!preselectedPatientId || selectedPatient) return;

    async function loadPreselected() {
      try {
        const res = await searchPatients(String(preselectedPatientId), {
          page: 0,
          size: 10,
        });
        const found = (res.data?.items || []).find(
          (p) => String(p.id) === String(preselectedPatientId)
        );
        if (found) setSelectedPatient(found);
      } catch {
        /* ignore */
      }
    }

    loadPreselected();
  }, [preselectedPatientId, selectedPatient]);

  // Debounced patient search
  useEffect(() => {
    const keyword = patientQuery.trim();
    if (!keyword || selectedPatient) {
      setPatientResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setPatientSearching(true);
        const res = await searchPatients(keyword, { page: 0, size: 20 });
        setPatientResults(res.data?.items || []);
      } catch {
        setPatientResults([]);
      } finally {
        setPatientSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [patientQuery, selectedPatient]);

  // Load slots when doctor + date picked
  useEffect(() => {
    if (!doctorId || !appointmentDate) {
      setSlots([]);
      setStartTime("");
      return;
    }

    let mounted = true;

    async function load() {
      try {
        setSlotsLoading(true);
        setSlotsError("");
        setStartTime("");

        const res = await getAvailableSlots(Number(doctorId), appointmentDate);
        if (!mounted) return;
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!mounted) return;
        setSlotsError(err.message || "Unable to load slots.");
        setSlots([]);
      } finally {
        if (mounted) setSlotsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [doctorId, appointmentDate]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d.id) === String(doctorId)),
    [doctors, doctorId]
  );

  const today = toIsoDate(new Date());

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!selectedPatient) {
      setSubmitError("Please select or register a patient first.");
      return;
    }
    if (!doctorId) {
      setSubmitError("Please select a doctor.");
      return;
    }
    if (!appointmentDate) {
      setSubmitError("Please pick a date.");
      return;
    }
    if (!startTime) {
      setSubmitError("Please pick a time slot.");
      return;
    }

    try {
      setSubmitting(true);

      await createAppointment({
        patientId: selectedPatient.id,
        doctorId: Number(doctorId),
        appointmentDate,
        startTime,
        reason: reason.trim() || null,
      });

      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message || "Unable to book appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!initialized || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          Appointment booked
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          <b>{selectedPatient?.fullName || "Patient"}</b>&apos;s appointment
          with <b>{selectedDoctor?.doctorName}</b> on{" "}
          <b>{formatDate(appointmentDate)}</b> at{" "}
          <b>{formatTime(startTime)}</b> is scheduled.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/portal/reception/appointments">View appointments</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setSelectedPatient(null);
              setPatientQuery("");
              setPatientResults([]);
              setDoctorId("");
              setAppointmentDate("");
              setStartTime("");
              setSlots([]);
              setReason("");
            }}
          >
            Book another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/portal/reception/appointments"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to appointments
      </Link>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Front desk
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Book appointment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile?.hospitalName
            ? `Booking at ${profile.hospitalName}`
            : "Register a walk-in or pick an existing patient."}
        </p>
      </div>

      {submitError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* ── PHASE 1: PATIENT ── */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Patient
                </h2>
                <p className="text-xs text-muted-foreground">
                  Search existing or register walk-in
                </p>
              </div>
            </div>

            {!selectedPatient && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/portal/reception/patients/new?returnTo=${encodeURIComponent(
                    "/portal/reception/appointments/new"
                  )}`}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Register new walk-in
                </Link>
              </Button>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {selectedPatient ? (
              <div className="flex items-center gap-4 rounded-xl border border-brand/30 bg-brand-soft/40 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-base font-bold text-brand-foreground">
                  {selectedPatient.fullName?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {selectedPatient.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {selectedPatient.phone || "—"}
                    {selectedPatient.bloodGroup && ` · ${selectedPatient.bloodGroup}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientQuery("");
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Change
                </Button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={patientQuery}
                    onChange={(e) => setPatientQuery(e.target.value)}
                    placeholder="Search by name, phone, or patient id..."
                    className="h-11 pl-10"
                  />
                </div>

                {patientQuery.trim() && (
                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border">
                    {patientSearching ? (
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    ) : patientResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No patients found.{" "}
                        <Link
                          href="/portal/reception/patients/new"
                          className="font-medium text-brand hover:underline"
                        >
                          Register new?
                        </Link>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {patientResults.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatient(p);
                                setPatientQuery("");
                                setPatientResults([]);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-soft-foreground">
                                {p.fullName?.charAt(0)?.toUpperCase() || "P"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {p.fullName}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                  {p.phone} · #{p.id}
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── PHASE 2: APPOINTMENT ── */}
        {selectedPatient && (
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Appointment details
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose doctor and slot
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Doctor <span className="text-destructive">*</span>
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  disabled={doctorsLoading || doctors.length === 0}
                  required
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {doctorsLoading
                      ? "Loading doctors..."
                      : doctors.length === 0
                      ? "No doctors available"
                      : "Select doctor"}
                  </option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.doctorName}
                      {d.specialization ? ` · ${d.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Date <span className="text-destructive">*</span>
                </label>
                <div className="relative sm:max-w-xs">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    min={today}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              {appointmentDate && doctorId && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Time slot <span className="text-destructive">*</span>
                  </label>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading slots...
                    </div>
                  ) : slotsError ? (
                    <p className="text-sm text-destructive">{slotsError}</p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No slots for this day.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {slots.map((s) => {
                        const disabled = !s.available;
                        const selected = startTime === s.startTime;
                        return (
                          <button
                            key={s.startTime}
                            type="button"
                            disabled={disabled}
                            onClick={() => setStartTime(s.startTime)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all",
                              disabled &&
                                "cursor-not-allowed border-border bg-muted/40 text-muted-foreground line-through",
                              !disabled &&
                                !selected &&
                                "border-border bg-background hover:border-brand/40 hover:bg-brand-soft/40",
                              selected &&
                                "border-brand bg-brand text-brand-foreground"
                            )}
                          >
                            {formatTime(s.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Reason <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Brief reason for visit"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/portal/reception/appointments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting || !selectedPatient}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Confirm appointment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(time) {
  if (!time) return "--:--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = ((hour + 11) % 12) + 1;
  return `${String(display).padStart(2, "0")}:${m} ${suffix}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}