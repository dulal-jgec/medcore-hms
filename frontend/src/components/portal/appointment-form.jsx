"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicImage from "@/components/public-hospital/shared/public-image";
import { cn } from "@/lib/utils";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDoctor } from "@/services/public-doctor.service";
import {
  createAppointment,
  getAvailableSlots,
} from "@/services/appointment.service";
import { clearBookingIntent } from "@/lib/booking-intent";

export default function AppointmentForm({ hospitalId, doctorId }) {
  const router = useRouter();

  const [hospital, setHospital] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    appointmentDate: "",
    startTime: "",
    reason: "",
  });

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setMetaLoading(true);
        setMetaError("");

        const [hospitalRes, doctorRes] = await Promise.all([
          getPublicHospital(hospitalId),
          getPublicDoctor(hospitalId, doctorId),
        ]);

        if (!mounted) return;
        setHospital(hospitalRes.data);
        setDoctor(doctorRes.data);
      } catch (err) {
        if (!mounted) return;
        setMetaError(err.message || "Unable to load booking details.");
      } finally {
        if (mounted) setMetaLoading(false);
      }
    }

    if (hospitalId && doctorId) load();
    return () => {
      mounted = false;
    };
  }, [hospitalId, doctorId]);

  useEffect(() => {
    let mounted = true;

    async function loadSlots() {
      if (!doctorId || !form.appointmentDate) {
        setSlots([]);
        return;
      }

      try {
        setSlotsLoading(true);
        setSlotsError("");
        setForm((p) => ({ ...p, startTime: "" }));

        const res = await getAvailableSlots(doctorId, form.appointmentDate);

        if (!mounted) return;
        setSlots(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!mounted) return;
        setSlotsError(err.message || "Unable to load available slots.");
        setSlots([]);
      } finally {
        if (mounted) setSlotsLoading(false);
      }
    }

    loadSlots();
    return () => {
      mounted = false;
    };
  }, [doctorId, form.appointmentDate]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.patientName.trim()) {
      setSubmitError("Please enter the patient's name.");
      return;
    }
    if (!form.appointmentDate) {
      setSubmitError("Please choose an appointment date.");
      return;
    }
    if (!form.startTime) {
      setSubmitError("Please pick an available time slot.");
      return;
    }

    setSubmitting(true);

    try {
      await createAppointment({
        hospitalId: Number(hospitalId),
        doctorId: Number(doctorId),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        reason: form.reason.trim() || null,
      });

      clearBookingIntent();
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message || "Unable to book the appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  const today = toIsoDate(new Date());

  const hasAnySlot = useMemo(() => slots.some((s) => s.available), [slots]);

  if (metaLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (metaError || !hospital || !doctor) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          We couldn&apos;t start your booking
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {metaError || "Missing hospital or doctor information."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/hospitals">Browse hospitals</Link>
        </Button>
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
          <b>{form.patientName}</b>&apos;s appointment with{" "}
          <b>{doctor.doctorName}</b> at <b>{hospital.name}</b> on{" "}
          <b>{formatDate(form.appointmentDate)}</b> at{" "}
          <b>{formatTime(form.startTime)}</b> has been scheduled.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/portal/patient/appointments">
              View my appointments
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/portal/patient">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ══════════ FORM COLUMN ══════════ */}
        <div className="lg:col-span-8">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Book appointment
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Who is this appointment for?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the patient&apos;s name. You can book on behalf of a family
              member.
            </p>
          </header>

          {submitError && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Patient section */}
          <section className="mt-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Patient details
                </h2>
                <p className="text-xs text-muted-foreground">
                  Who is visiting the doctor?
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="patientName"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Patient name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="patientName"
                  value={form.patientName}
                  onChange={(e) => update("patientName", e.target.value)}
                  required
                  placeholder="e.g. Aarav Sharma"
                  className="h-11"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Booking for your son? Enter the son&apos;s name here.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Reason for visit{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id="reason"
                  value={form.reason}
                  onChange={(e) => update("reason", e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the symptoms or reason"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
          </section>

          {/* Schedule section */}
          <section className="mt-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  Appointment slot
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pick a date and time
                </p>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="appointmentDate"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Preferred date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="appointmentDate"
                  type="date"
                  min={today}
                  value={form.appointmentDate}
                  onChange={(e) => update("appointmentDate", e.target.value)}
                  required
                  className="h-11 sm:max-w-xs"
                />
              </div>

              {form.appointmentDate && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Available time slots{" "}
                    <span className="text-destructive">*</span>
                  </label>

                  {slotsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading slots...
                    </div>
                  ) : slotsError ? (
                    <p className="text-sm text-destructive">{slotsError}</p>
                  ) : !hasAnySlot && slots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
                      <p className="text-sm font-medium">
                        No slots on this day
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The doctor is not available. Try another date.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                        {slots.map((slot) => {
                          const disabled = !slot.available;
                          const selected = form.startTime === slot.startTime;

                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              disabled={disabled}
                              onClick={() =>
                                update("startTime", slot.startTime)
                              }
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all",
                                disabled &&
                                  "cursor-not-allowed border-border bg-muted/40 text-muted-foreground line-through",
                                !disabled &&
                                  !selected &&
                                  "border-border bg-background hover:border-brand/40 hover:bg-brand-soft/40",
                                selected &&
                                  "border-brand bg-brand text-brand-foreground",
                              )}
                            >
                              {formatTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 rounded border border-brand bg-brand" />
                          Selected
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 rounded border border-border bg-background" />
                          Available
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 rounded border border-border bg-muted" />
                          Booked
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button asChild variant="outline" type="button">
              <Link href={`/hospitals/${hospitalId}/doctors/${doctorId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
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
        </div>

        {/* ══════════ SUMMARY COLUMN ══════════ */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-brand/20 bg-brand-soft/40">
              <div className="flex items-center gap-4 p-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-background">
                  <PublicImage
                    src={doctor.profileImageUrl}
                    alt={doctor.doctorName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-soft-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    Booking summary
                  </p>
                  <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
                    {doctor.doctorName}
                  </h3>
                  {doctor.specialization && (
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Stethoscope className="h-3 w-3" />
                      {doctor.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-brand/20 bg-background/40 px-5 py-3 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{hospital.name}</span>
              </div>
            </div>

            {doctor.consultationFee != null && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Consultation fee
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                  ₹{doctor.consultationFee}
                </p>
                {doctor.consultationDurationMinutes && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    ~ {doctor.consultationDurationMinutes} minutes per visit
                  </p>
                )}
              </div>
            )}

            {form.startTime && form.appointmentDate && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Selected slot
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {formatDate(form.appointmentDate)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTime(form.startTime)}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}

/* ══════════ Helpers ══════════ */

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
