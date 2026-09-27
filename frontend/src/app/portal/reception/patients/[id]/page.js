"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Clock,
  Droplets,
  Heart,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPatientById } from "@/services/receptionist.service";

export default function ReceptionPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getPatientById(patientId);
        if (!mounted) return;
        setPatient(res.data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Unable to load patient.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Patient not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This patient record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/reception/patients">Back to patients</Link>
        </Button>
      </div>
    );
  }

  const name = getPatientName(patient);
  const email = patient.email || patient.user?.email;
  const phone = patient.phone || patient.user?.phone;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-brand-foreground">
                {name.charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Patient #{patient.id}
              </p>

              {patient.status && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {patient.status}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <QuickRow
                icon={Droplets}
                label="Blood group"
                value={formatBloodGroup(patient.bloodGroup)}
              />
              <QuickRow
                icon={User}
                label="Gender"
                value={patient.gender || "—"}
              />
              <QuickRow
                icon={Calendar}
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />
              <QuickRow
                icon={Clock}
                label="Registered"
                value={formatDate(patient.createdAt)}
              />
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <Button asChild className="w-full">
                <Link
                  href={`/portal/reception/appointments/new?patientId=${patient.id}`}
                >
                  <CalendarPlus className="mr-1.5 h-4 w-4" />
                  Book appointment
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            icon={Phone}
            title="Contact information"
            desc="How to reach this patient."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Phone} label="Phone" value={phone} />
              <InfoRow icon={Mail} label="Email" value={email} />
            </div>
          </SectionCard>

          <SectionCard
            icon={Heart}
            title="Medical information"
            desc="Used by doctors during consultation."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={Droplets}
                label="Blood group"
                value={formatBloodGroup(patient.bloodGroup)}
              />
              <InfoRow
                icon={User}
                label="Gender"
                value={patient.gender}
              />
              <InfoRow
                icon={AlertCircle}
                label="Allergies"
                value={patient.allergies}
                className="sm:col-span-2"
              />
              <InfoRow
                icon={Heart}
                label="Chronic conditions"
                value={patient.chronicConditions}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={ShieldCheck}
            title="Emergency contact"
            desc="Person to reach in case of emergency."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <InfoRow
                icon={User}
                label="Name"
                value={patient.emergencyContactName}
              />
              <InfoRow
                icon={User}
                label="Relation"
                value={patient.emergencyContactRelation}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={patient.emergencyContactPhone}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Components ══════════ */

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {desc && (
            <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, className }) {
  return (
    <div className={cn(className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 break-words text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function QuickRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="truncate text-right font-medium">{value || "—"}</span>
    </div>
  );
}

/* ══════════ Helpers ══════════ */

function getPatientName(patient) {
  if (!patient) return "Unknown";
  return (
    patient.patientName ||       // ⬅ your backend field
    patient.fullName ||
    patient.name ||
    patient.user?.fullName ||
    patient.user?.name ||
    "Unknown"
  );
}
function formatBloodGroup(bg) {
  if (!bg) return "—";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}