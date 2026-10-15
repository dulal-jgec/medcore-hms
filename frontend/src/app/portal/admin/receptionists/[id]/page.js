"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getReceptionistById,
  activateReceptionist,
  deactivateReceptionist,
} from "@/services/receptionist.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

export default function AdminReceptionistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receptionistId = params.id;

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!receptionistId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getReceptionistById(receptionistId);
        if (cancelled) return;
        setStaff(res.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load receptionist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [receptionistId]);

  async function handleToggleStatus() {
    if (!staff) return;

    const isActive = staff.status === "ACTIVE";

    const confirmMessage = isActive
      ? `Deactivate ${staff.name}? They will not be able to log in.`
      : `Activate ${staff.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      setMessage("");
      setActionError("");

      if (isActive) {
        await deactivateReceptionist(staff.id);
      } else {
        await activateReceptionist(staff.id);
      }

      // Refetch to get updated data
      const res = await getReceptionistById(staff.id);
      setStaff(res.data);

      setMessage(
        isActive
          ? "Receptionist deactivated successfully."
          : "Receptionist activated successfully."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleResend() {
    if (!staff?.userId) {
      setActionError("Receptionist user information is missing.");
      return;
    }

    try {
      setResending(true);
      setMessage("");
      setActionError("");

      const res = await resendStaffInvitation(staff.userId);
      setMessage(res?.message || "Invitation email queued successfully.");

      setStaff((prev) => ({
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

  if (error || !staff) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Receptionist not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This receptionist record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/admin/receptionists">
            Back to receptionists
          </Link>
        </Button>
      </div>
    );
  }

  const isUserActive = staff.userStatus === "ACTIVE";
  const isActive = isUserActive && staff.status === "ACTIVE";
  const isInactive = isUserActive && staff.status === "INACTIVE";
  const isExhausted = staff.invitationStatus === "EXHAUSTED";
  const isInvitationPending =
    staff.userStatus === "PENDING_VERIFICATION";
  const isInvitationExpired =
    staff.userStatus === "INVITATION_EXPIRED";

  const canResend = isExhausted && !isInvitationExpired;
  const canToggle =
    staff.userStatus === "ACTIVE" &&
    (staff.status === "ACTIVE" || staff.status === "INACTIVE");

  const initials = (staff.name || "R").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/portal/admin/receptionists")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to receptionists
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

      {/* Invitation notice */}
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
                ? "The receptionist has not logged in yet. The invitation is currently being processed."
                : isInvitationExpired
                ? "This receptionist invitation reached the maximum number of invitation rounds. Create a new account."
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
              <div
                className={cn(
                  "flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold",
                  isExhausted || isInactive
                    ? "bg-destructive/10 text-destructive"
                    : !isActive
                    ? "bg-muted text-muted-foreground"
                    : "bg-brand text-brand-foreground"
                )}
              >
                {initials}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {staff.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-brand">
                {staff.designation || "Receptionist"}
              </p>

              <div className="mt-3">
                <StatusBadge
                  status={staff.status}
                  invitationStatus={staff.invitationStatus}
                  userStatus={staff.userStatus}
                />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row icon={Mail} label="Email" value={staff.email} />
              <Row
                icon={ClipboardList}
                label="Employee ID"
                value={`#${staff.id}`}
              />
              <Row
                icon={Building2}
                label="Hospital ID"
                value={staff.hospitalId ? `#${staff.hospitalId}` : "—"}
              />
            </dl>

            <div className="mt-6 space-y-2 border-t border-border pt-5">
              <Button asChild className="w-full">
                <Link
                  href={`/portal/admin/receptionists/${staff.id}/edit`}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit details
                </Link>
              </Button>

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
                  <Link href="/portal/admin/receptionists/new">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create new receptionist
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
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT — sections */}
        <div className="space-y-6 lg:col-span-8">
          {/* Contact */}
          <SectionCard
            icon={Mail}
            title="Contact information"
            desc="How to reach this receptionist."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email" value={staff.email} />
              <InfoRow
                icon={User}
                label="User ID"
                value={staff.userId ? `#${staff.userId}` : null}
              />
              <InfoRow
                icon={ClipboardList}
                label="Receptionist ID"
                value={`#${staff.id}`}
              />
              <InfoRow
                icon={Building2}
                label="Hospital ID"
                value={staff.hospitalId ? `#${staff.hospitalId}` : null}
              />
            </div>
          </SectionCard>

          {/* Professional */}
          <SectionCard
            icon={ClipboardList}
            title="Employment details"
            desc="Role and designation."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={ClipboardList}
                label="Designation"
                value={staff.designation || "Receptionist"}
              />
              <InfoRow
                icon={ShieldCheck}
                label="Account status"
                value={staff.status}
              />
              <InfoRow
                icon={User}
                label="User status"
                value={staff.userStatus}
              />
              <InfoRow
                icon={FileText}
                label="Invitation status"
                value={staff.invitationStatus || "—"}
              />
            </div>
          </SectionCard>

          {/* Info note */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Employment info and account status are managed by hospital
              administration. Receptionists cannot edit these fields themselves.
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