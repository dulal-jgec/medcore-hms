"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDoctorById,
  updateDoctorStatus,
} from "@/services/doctor.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

export default function AdminDoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id;

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getDoctorById(doctorId);
        if (cancelled) return;
        setDoctor(res.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load doctor.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  async function handleToggleStatus() {
    if (!doctor) return;

    const nextStatus =
      doctor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const confirmMessage =
      nextStatus === "SUSPENDED"
        ? `Suspend ${doctor.doctorName}? Patients won't be able to book this doctor.`
        : `Reactivate ${doctor.doctorName}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      setMessage("");
      setActionError("");

      const res = await updateDoctorStatus(doctor.id, nextStatus);
      setDoctor((prev) => ({ ...prev, ...res.data }));
      setMessage(
        nextStatus === "SUSPENDED"
          ? "Doctor suspended successfully."
          : "Doctor reactivated successfully."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update doctor status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleResend() {
    if (!doctor?.userId) {
      setActionError("Doctor user information is missing.");
      return;
    }

    try {
      setResending(true);
      setMessage("");
      setActionError("");

      const res = await resendStaffInvitation(doctor.userId);
      setMessage(res?.message || "Invitation email queued successfully.");

      setDoctor((prev) => ({
        ...prev,
        invitationStatus: "PENDING",
      }));

      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to resend invitation.");
    } finally {
      setResending(false);
    }
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
        <h1 className="mt-5 text-xl font-semibold">Doctor not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This doctor record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/admin/doctors">Back to doctors</Link>
        </Button>
      </div>
    );
  }

  const isUserActive = doctor.userStatus === "ACTIVE";
  const isActive = isUserActive && doctor.status === "ACTIVE";
  const isSuspended = isUserActive && doctor.status === "SUSPENDED";
  const isExhausted = doctor.invitationStatus === "EXHAUSTED";
  const isInvitationPending =
    doctor.userStatus === "PENDING_VERIFICATION";
  const isInvitationExpired =
    doctor.userStatus === "INVITATION_EXPIRED";

  const canResend = isExhausted && !isInvitationExpired;
  const canToggle =
    doctor.userStatus === "ACTIVE" &&
    (doctor.status === "ACTIVE" || doctor.status === "SUSPENDED");

  const initials = (doctor.doctorName || "D").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <button
        type="button"
        onClick={() => router.push("/portal/admin/doctors")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to doctors
      </button>

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

      {(isInvitationPending || isExhausted || isInvitationExpired) && (
        <div
          className={cn(
            "mt-6 flex items-start gap-3 rounded-xl border p-4",
            isInvitationPending && !isExhausted
              ? "border-yellow-500/20 bg-yellow-500/5"
              : "border-destructive/20 bg-destructive/5"
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              isInvitationPending && !isExhausted
                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {isInvitationPending && !isExhausted ? (
              <Clock3 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {isInvitationPending && !isExhausted
                ? "Invitation pending"
                : "Invitation exhausted"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isInvitationPending && !isExhausted
                ? "The doctor has not logged in yet. The invitation is currently being processed."
                : isInvitationExpired
                ? "This doctor invitation reached the maximum number of invitation rounds. Create a new doctor account."
                : "The current invitation attempt exhausted all automatic retries. You can resend the invitation."}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT — identity card */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with image support */}
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl text-4xl font-bold",
                  isExhausted || isSuspended
                    ? "bg-destructive/10 text-destructive"
                    : !isActive
                    ? "bg-muted text-muted-foreground"
                    : "bg-brand text-brand-foreground"
                )}
              >
                {doctor.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doctor.profileImageUrl}
                    alt={doctor.doctorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {doctor.doctorName}
              </h2>

              {doctor.specialization && (
                <p className="mt-1 text-sm font-medium text-brand">
                  {doctor.specialization}
                </p>
              )}

              {doctor.departmentName && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {doctor.departmentName}
                </p>
              )}

              <div className="mt-3">
                <StatusBadge
                  status={doctor.status}
                  invitationStatus={doctor.invitationStatus}
                  userStatus={doctor.userStatus}
                />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row icon={Mail} label="Email" value={doctor.email} />
              <Row
                icon={IndianRupee}
                label="Fee"
                value={
                  doctor.consultationFee != null
                    ? `₹${formatCurrency(doctor.consultationFee)}`
                    : "—"
                }
              />
              <Row
                icon={Award}
                label="Experience"
                value={
                  doctor.experienceYears != null
                    ? `${doctor.experienceYears} yrs`
                    : "—"
                }
              />
              <Row
                icon={Calendar}
                label="Joined"
                value={formatDate(doctor.createdAt)}
              />
            </dl>

            <div className="mt-6 space-y-2 border-t border-border pt-5">
              {canResend && (
                <Button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full"
                >
                  {resending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                  )}
                  {resending ? "Resending..." : "Resend invitation"}
                </Button>
              )}

              {isInvitationExpired && (
                <Button asChild className="w-full">
                  <Link href="/portal/admin/doctors/new">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create new doctor
                  </Link>
                </Button>
              )}

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
                  {isActive ? "Suspend" : "Reactivate"}
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT — sections */}
        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            icon={Mail}
            title="Contact information"
            desc="How to reach this doctor."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={doctor.email} />
              <InfoRow icon={Phone} label="Phone" value={doctor.phone} />
              <InfoRow
                icon={User}
                label="User ID"
                value={doctor.userId ? `#${doctor.userId}` : null}
              />
              <InfoRow
                icon={FileText}
                label="Doctor ID"
                value={`#${doctor.id}`}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Stethoscope}
            title="Professional details"
            desc="Medical credentials and specialization."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={GraduationCap}
                label="Qualification"
                value={doctor.qualification}
              />
              <InfoRow
                icon={Award}
                label="Experience"
                value={
                  doctor.experienceYears != null
                    ? `${doctor.experienceYears} years`
                    : null
                }
              />
              <InfoRow
                icon={Stethoscope}
                label="Specialization"
                value={doctor.specialization}
              />
              <InfoRow
                icon={IndianRupee}
                label="Consultation fee"
                value={
                  doctor.consultationFee != null
                    ? `₹${formatCurrency(doctor.consultationFee)}`
                    : null
                }
              />
              <InfoRow
                icon={Clock3}
                label="Consultation duration"
                value={
                  doctor.consultationDurationMinutes
                    ? `${doctor.consultationDurationMinutes} minutes`
                    : null
                }
              />
              <InfoRow
                icon={Calendar}
                label="Joined on"
                value={formatDate(doctor.createdAt)}
              />
            </div>
          </SectionCard>

          <SectionCard
            icon={Building2}
            title="Hospital & department"
            desc="Workplace assignment."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={Building2}
                label="Hospital"
                value={doctor.hospitalName}
              />
              <InfoRow
                icon={Building2}
                label="Hospital ID"
                value={doctor.hospitalId ? `#${doctor.hospitalId}` : null}
              />
              <InfoRow
                icon={FileText}
                label="Department"
                value={doctor.departmentName}
              />
              <InfoRow
                icon={FileText}
                label="Department ID"
                value={
                  doctor.departmentId ? `#${doctor.departmentId}` : null
                }
              />
            </div>
          </SectionCard>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials are managed by hospital administration.
              Doctors cannot edit these fields themselves.
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

function StatusBadge({ status, invitationStatus, userStatus }) {
  if (invitationStatus === "EXHAUSTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Invitation expired
      </span>
    );
  }

  if (userStatus === "PENDING_VERIFICATION") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
        <Clock3 className="h-3 w-3" />
        Invitation pending
      </span>
    );
  }

  if (userStatus === "INVITATION_EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Invitation expired
      </span>
    );
  }

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
    SUSPENDED: {
      label: "Suspended",
      class: "bg-destructive/10 text-destructive",
      icon: Ban,
    },
  };

  const config = map[status] || map.INACTIVE;
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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}