"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Droplets,
  FileText,
  Heart,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPatientById,
  updatePatientStatus,
} from "@/services/patient.service";

/* ══════════ Page ══════════ */

export default function AdminPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!patientId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getPatientById(patientId);
        if (cancelled) return;
        setPatient(res.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load patient.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  async function handleToggleStatus() {
    if (!patient) return;

    const nextStatus =
      patient.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmMessage =
      nextStatus === "INACTIVE"
        ? `Deactivate ${getPatientName(patient)}? They won't be able to book appointments.`
        : `Reactivate ${getPatientName(patient)}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      setMessage("");
      setActionError("");

      const res = await updatePatientStatus(patient.id, nextStatus);
      setPatient((prev) => ({ ...prev, ...res.data }));
      setMessage(
        nextStatus === "INACTIVE"
          ? "Patient deactivated successfully."
          : "Patient reactivated successfully."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update patient status.");
    } finally {
      setUpdating(false);
    }
  }

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
        <h1 className="mt-5 text-xl font-semibold">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This patient record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/admin/patients">Back to patients</Link>
        </Button>
      </div>
    );
  }

  const name = getPatientName(patient);
  const initials = name.charAt(0).toUpperCase();
  const bloodGroup = formatBloodGroup(patient.bloodGroup);
  const allergies = toStringList(patient.allergies);
  const chronicConditions = toStringList(patient.chronicConditions);

  const isActive = patient.status === "ACTIVE";
  const canToggle =
    patient.status === "ACTIVE" || patient.status === "INACTIVE";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/portal/admin/patients")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to patients
      </button>

      {/* Banners */}
      {message && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {actionError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT — identity card */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold",
                  isActive
                    ? "bg-brand text-brand-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {initials}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Patient #{patient.id}
              </p>

              <div className="mt-3">
                <StatusBadge status={patient.status} />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Droplets}
                label="Blood group"
                value={bloodGroup || "—"}
              />
              <Row
                icon={User}
                label="Gender"
                value={formatEnum(patient.gender) || "—"}
              />
              <Row
                icon={Heart}
                label="Marital status"
                value={formatEnum(patient.maritalStatus) || "—"}
              />
              <Row
                icon={Calendar}
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />
              <Row
                icon={Calendar}
                label="Registered"
                value={formatDate(patient.createdAt)}
              />
            </dl>

            <div className="mt-6 space-y-2 border-t border-border pt-5">
              <Button asChild className="w-full">
                <Link href={`/portal/admin/patients/${patient.id}/edit`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit details
                </Link>
              </Button>

              {canToggle && (
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  disabled={updating}
                  className={cn(
                    "w-full",
                    isActive &&
                      "text-destructive hover:bg-destructive/10 hover:text-destructive"
                  )}
                >
                  {updating ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    <Ban className="mr-1.5 h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}
                  {isActive ? "Deactivate" : "Reactivate"}
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT — sections */}
        <div className="space-y-6 lg:col-span-8">
          {/* Contact */}
          <SectionCard
            icon={Phone}
            title="Contact information"
            desc="How to reach this patient."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow
                icon={User}
                label="User ID"
                value={patient.userId ? `#${patient.userId}` : null}
              />
              <InfoRow
                icon={FileText}
                label="Patient ID"
                value={`#${patient.id}`}
              />
            </div>
          </SectionCard>

          {/* Address */}
          {(patient.city || patient.state || patient.pincode || patient.occupation) && (
            <SectionCard
              icon={MapPin}
              title="Address & occupation"
              desc="Where the patient is based."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <InfoRow icon={MapPin} label="City" value={patient.city} />
                <InfoRow icon={MapPin} label="State" value={patient.state} />
                <InfoRow
                  icon={MapPin}
                  label="Pincode"
                  value={patient.pincode}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Occupation"
                  value={patient.occupation}
                />
              </div>
            </SectionCard>
          )}

          {/* Medical */}
          <SectionCard
            icon={HeartPulse}
            title="Medical information"
            desc="Used by doctors during consultation."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={Droplets}
                label="Blood group"
                value={bloodGroup}
              />
              <InfoRow
                icon={User}
                label="Gender"
                value={formatEnum(patient.gender)}
              />
              <InfoRow
                icon={Calendar}
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />
              <InfoRow
                icon={Heart}
                label="Marital status"
                value={formatEnum(patient.maritalStatus)}
              />

              <InfoRow
                icon={AlertCircle}
                label="Allergies"
                value={allergies.length > 0 ? allergies.join(", ") : "None recorded"}
                className="sm:col-span-2"
              />
              <InfoRow
                icon={Heart}
                label="Chronic conditions"
                value={
                  chronicConditions.length > 0
                    ? chronicConditions.join(", ")
                    : "None recorded"
                }
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          {/* Emergency contact */}
          {(patient.emergencyContactName ||
            patient.emergencyContactPhone ||
            patient.emergencyContactRelation) && (
            <SectionCard
              icon={ShieldCheck}
              title="Emergency contact"
              desc="Person to reach in case of emergency."
            >
              <div className="grid gap-5 sm:grid-cols-3">
                <InfoRow
                  icon={UserRound}
                  label="Name"
                  value={patient.emergencyContactName}
                />
                <InfoRow
                  icon={Users}
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
          )}

          {/* Info note */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Personal and medical details are managed by hospital
              administration. Patients can update some fields from their own
              portal.
            </p>
          </div>
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

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="truncate text-right font-medium">{value || "—"}</dd>
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

function StatusBadge({ status }) {
  const map = {
    ACTIVE: {
      label: "Active",
      class: "bg-brand-soft text-brand-soft-foreground",
      icon: CheckCircle2,
    },
    INACTIVE: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
      icon: AlertCircle,
    },
    CRITICAL: {
      label: "Critical",
      class: "bg-destructive/10 text-destructive",
      icon: AlertTriangle,
    },
    DECEASED: {
      label: "Deceased",
      class: "bg-muted text-muted-foreground",
      icon: XCircle,
    },
  };

  const config = map[status] || {
    label: formatEnum(status) || "Unknown",
    class: "bg-muted text-muted-foreground",
    icon: AlertCircle,
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/* ══════════ Helpers ══════════ */

function getPatientName(patient) {
  if (!patient) return "Patient";
  return (
    patient.patientName ||
    patient.fullName ||
    patient.name ||
    patient.user?.fullName ||
    patient.user?.name ||
    "Patient"
  );
}

function toStringList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string" && v.trim() !== "");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function formatBloodGroup(bg) {
  if (!bg) return "";
  return bg.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function formatEnum(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}