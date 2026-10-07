"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  X,
  Stethoscope,
  Mail,
  Award,
  Building2,
  IndianRupee,
  Calendar,
  Pencil,
  Ban,
  CheckCircle2,
  GraduationCap,
  FileText,
  ShieldCheck,
  Loader2,
  Clock3,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import {
  getDoctors,
  searchDoctors,
  updateDoctorStatus,
} from "@/services/doctor.service";
import { resendStaffInvitation } from "@/services/hospital-admin.service";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "ACTIVE", label: "Active" },
  { id: "EXHAUSTED", label: "Invitation expired" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "SUSPENDED", label: "Suspended" },
];

export default function AdminDoctorsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDoctor, setViewDoctor] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!accessToken) return;

    loadDoctors();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  async function loadDoctors() {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const result = await getDoctors({
        page: 0,
        size: PAGE_SIZE,
        sortBy: "id",
        sortDir: "asc",
      });

      if (requestId !== requestIdRef.current) return;

      setDoctors(result.data?.items || []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(err.message || "Failed to load doctors");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  async function runSearch(keyword) {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const result = await searchDoctors(keyword, {
        page: 0,
        size: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return;

      setDoctors(result.data?.items || []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(err.message || "Search failed");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleSearch(value) {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const keyword = value.trim();

      if (!keyword) {
        loadDoctors();
      } else {
        runSearch(keyword);
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  function clearFilters() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setQuery("");
    setStatus("all");

    loadDoctors();
  }

  async function handleToggleStatus(doctor) {
    const nextStatus =
      doctor.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    const doctorName =
      doctor.doctorName || doctor.name || "this doctor";

    const confirmMessage =
      nextStatus === "SUSPENDED"
        ? `Suspend ${doctorName}? Patients won't be able to book this doctor.`
        : `Reactivate ${doctorName}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdatingId(doctor.id);

      const result = await updateDoctorStatus(
        doctor.id,
        nextStatus
      );

      const updated = result.data;

      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctor.id
            ? { ...d, ...updated }
            : d
        )
      );

      setViewDoctor((prev) =>
        prev && prev.id === doctor.id
          ? { ...prev, ...updated }
          : prev
      );
    } catch (err) {
      alert(
        err.message ||
          "Failed to update doctor status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleResendInvitation(doctor) {
    if (!doctor.userId) {
      setActionError(
        "Doctor user information is missing."
      );
      return;
    }

    if (
      doctor.invitationStatus !== "EXHAUSTED"
    ) {
      return;
    }

    if (
      doctor.userStatus === "INVITATION_EXPIRED"
    ) {
      setActionError(
        "This invitation has reached the maximum number of attempts. Please create a new doctor account."
      );
      return;
    }

    try {
      setResendingId(doctor.id);
      setActionMessage("");
      setActionError("");

      const result =
        await resendStaffInvitation(
          doctor.userId
        );

      setActionMessage(
        result?.message ||
          "Invitation email queued successfully."
      );

      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctor.id
            ? {
                ...d,
                invitationStatus: "PENDING",
              }
            : d
        )
      );

      setViewDoctor((prev) =>
        prev && prev.id === doctor.id
          ? {
              ...prev,
              invitationStatus: "PENDING",
            }
          : prev
      );

      setStatus("EXHAUSTED");
    } catch (err) {
      setActionError(
        err.message ||
          "Failed to resend invitation."
      );
    } finally {
      setResendingId(null);
    }
  }

  const filtered = useMemo(() => {
    return doctors.filter((doctor) => {
      if (status === "EXHAUSTED") {
        return (
          doctor.invitationStatus ===
          "EXHAUSTED"
        );
      }

      if (doctor.userStatus !== "ACTIVE") {
        return false;
      }

      if (status === "all") {
        return true;
      }

      return doctor.status === status;
    });
  }, [doctors, status]);

  const counts = useMemo(
    () => ({
      all: doctors.filter(
        (doctor) =>
          doctor.userStatus === "ACTIVE"
      ).length,

      ACTIVE: doctors.filter(
        (doctor) =>
          doctor.userStatus === "ACTIVE" &&
          doctor.status === "ACTIVE"
      ).length,

      EXHAUSTED: doctors.filter(
        (doctor) =>
          doctor.invitationStatus ===
          "EXHAUSTED"
      ).length,

      INACTIVE: doctors.filter(
        (doctor) =>
          doctor.userStatus === "ACTIVE" &&
          doctor.status === "INACTIVE"
      ).length,

      SUSPENDED: doctors.filter(
        (doctor) =>
          doctor.userStatus === "ACTIVE" &&
          doctor.status === "SUSPENDED"
      ).length,
    }),
    [doctors]
  );

  const hasFilters =
    query.trim() !== "" ||
    status !== "all";

  const attentionCount = counts.EXHAUSTED;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Staff Management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Doctors
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your hospital&apos;s medical staff and credentials.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/doctors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Link>
        </Button>
      </div>

      {attentionCount > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Mail className="h-5 w-5" />
            </span>

            <div>
              <p className="text-sm font-semibold">
                Invitations need attention
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {attentionCount} invitation
                {attentionCount !== 1
                  ? "s"
                  : ""}{" "}
                exhausted
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setStatus("EXHAUSTED")
            }
          >
            View exhausted
          </Button>
        </div>
      )}

      {actionMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm text-brand">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) =>
              handleSearch(e.target.value)
            }
            placeholder="Search by specialization..."
            className="h-11 pl-10"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="mt-6 border-b border-border">
        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Doctor status"
        >
          {STATUS_TABS.map(
            ({ id, label }) => {
              const isActive = status === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setStatus(id)
                  }
                  className={cn(
                    "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",
                    isActive
                      ? "text-foreground after:bg-brand"
                      : "text-muted-foreground after:bg-transparent hover:text-foreground"
                  )}
                >
                  {label}

                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {counts[id]}
                  </span>
                </button>
              );
            }
          )}
        </nav>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">
              Unable to load doctors
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {error}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDoctors}
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} doctor
          {filtered.length !== 1
            ? "s"
            : ""}{" "}
          found
        </p>
      )}

      {loading ? (
        <DoctorGridSkeleton />
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onView={() =>
                setViewDoctor(doctor)
              }
              onResend={() =>
                handleResendInvitation(
                  doctor
                )
              }
              resending={
                resendingId === doctor.id
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasFilters={hasFilters}
          status={status}
          onClear={clearFilters}
        />
      )}

      {viewDoctor && (
        <DoctorModal
          doctor={viewDoctor}
          onClose={() =>
            setViewDoctor(null)
          }
          onToggleStatus={
            handleToggleStatus
          }
          onResend={() =>
            handleResendInvitation(
              viewDoctor
            )
          }
          updating={
            updatingId === viewDoctor.id
          }
          resending={
            resendingId === viewDoctor.id
          }
        />
      )}
    </div>
  );
}

function DoctorCard({
  doctor,
  onView,
  onResend,
  resending,
}) {
  const isUserActive =
    doctor.userStatus === "ACTIVE";

  const isActive =
    isUserActive &&
    doctor.status === "ACTIVE";

  const isSuspended =
    isUserActive &&
    doctor.status === "SUSPENDED";

  const isInactive =
    isUserActive &&
    doctor.status === "INACTIVE";

  const isExhausted =
    doctor.invitationStatus ===
    "EXHAUSTED";

  const isInvitationExpired =
    doctor.userStatus ===
    "INVITATION_EXPIRED";

  const canResend =
    isExhausted &&
    !isInvitationExpired;

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        isSuspended
          ? "border-destructive/30"
          : isExhausted
          ? "border-destructive/30"
          : isInactive
          ? "border-border"
          : "border-border hover:border-brand/40"
      )}
    >
      <button
        type="button"
        onClick={onView}
        className="flex items-start gap-4 p-5 text-left"
      >
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isExhausted
              ? "bg-destructive/10 text-destructive"
              : isSuspended
              ? "bg-destructive/10 text-destructive"
              : !isActive
              ? "bg-muted text-muted-foreground"
              : "bg-brand-soft text-brand-soft-foreground"
          )}
        >
          {(
            doctor.doctorName ||
            doctor.name ||
            "D"
          )
            ?.charAt(0)
            ?.toUpperCase() || "D"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {doctor.doctorName ||
                doctor.name}
            </h3>

            <StatusBadge
              status={doctor.status}
              invitationStatus={
                doctor.invitationStatus
              }
              userStatus={
                doctor.userStatus
              }
            />
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-brand">
            {doctor.specialization}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {doctor.departmentName}
            </span>

            <span>·</span>

            <span>
              {doctor.experienceYears} yrs
            </span>
          </div>

          {doctor.email && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />

              <span className="truncate">
                {doctor.email}
              </span>
            </div>
          )}
        </div>
      </button>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border bg-muted/20">
        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Fee
          </p>

          <p className="mt-1 flex items-center justify-center gap-0.5 text-xs font-semibold">
            <IndianRupee className="h-3 w-3" />

            {formatCurrency(
              doctor.consultationFee
            )}
          </p>
        </div>

        <div className="p-3 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Experience
          </p>

          <p className="mt-1 text-xs font-semibold">
            {doctor.experienceYears} yrs
          </p>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-border p-3">
        {canResend ? (
          <Button
            size="sm"
            className="flex-1"
            onClick={onResend}
            disabled={resending}
          >
            <RefreshCw
              className={cn(
                "mr-1.5 h-3.5 w-3.5",
                resending &&
                  "animate-spin"
              )}
            />

            {resending
              ? "Sending..."
              : "Resend"}
          </Button>
        ) : isInvitationExpired ? (
          <Button
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href="/portal/admin/doctors/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create new
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onView}
          >
            View
          </Button>
        )}

        <Button
          size="sm"
          className="flex-1"
          asChild
        >
          <Link
            href={`/portal/admin/doctors/${doctor.id}/edit`}
          >
            Edit
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  invitationStatus,
  userStatus,
}) {
  if (
    invitationStatus === "EXHAUSTED"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        Invitation expired
      </span>
    );
  }

  if (
    userStatus === "PENDING_VERIFICATION"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
        Invitation pending
      </span>
    );
  }

  if (
    userStatus === "INVITATION_EXPIRED"
  ) {
    return (
      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
        Invitation expired
      </span>
    );
  }

  const map = {
    ACTIVE:
      "bg-brand-soft text-brand-soft-foreground",
    INACTIVE:
      "bg-muted text-muted-foreground",
    SUSPENDED:
      "bg-destructive/10 text-destructive",
  };

  const label = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    SUSPENDED: "Suspended",
  };

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status] || map.INACTIVE
      )}
    >
      {label[status] || "Unknown"}
    </span>
  );
}

function DoctorModal({
  doctor,
  onClose,
  onToggleStatus,
  onResend,
  updating,
  resending,
}) {
  const isActive =
    doctor.status === "ACTIVE" &&
    doctor.userStatus === "ACTIVE";

  const isExhausted =
    doctor.invitationStatus ===
    "EXHAUSTED";

  const isInvitationPending =
    doctor.userStatus ===
    "PENDING_VERIFICATION";

  const isInvitationExpired =
    doctor.userStatus ===
    "INVITATION_EXPIRED";

  const canResend =
    isExhausted &&
    !isInvitationExpired;

  const canToggle =
    doctor.userStatus === "ACTIVE" &&
    (doctor.status === "ACTIVE" ||
      doctor.status === "SUSPENDED");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-lg font-bold text-brand-soft-foreground">
              {(
                doctor.doctorName ||
                doctor.name ||
                "D"
              )
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight">
                {doctor.doctorName ||
                  doctor.name}
              </h2>

              <p className="mt-0.5 text-sm font-medium text-brand">
                {doctor.specialization}
              </p>

              <div className="mt-1.5 flex items-center gap-2">
                <StatusBadge
                  status={doctor.status}
                  invitationStatus={
                    doctor.invitationStatus
                  }
                  userStatus={
                    doctor.userStatus
                  }
                />

                <span className="text-xs text-muted-foreground">
                  {doctor.departmentName}
                </span>
              </div>
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

        <div className="p-6">
          {(isInvitationPending ||
            isExhausted ||
            isInvitationExpired) && (
            <div
              className={cn(
                "mb-6 flex items-start gap-3 rounded-xl border p-4",
                isInvitationPending &&
                  !isExhausted
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : "border-destructive/20 bg-destructive/5"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isInvitationPending &&
                    !isExhausted
                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isInvitationPending &&
                !isExhausted ? (
                  <Clock3 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {isInvitationPending &&
                  !isExhausted
                    ? "Invitation pending"
                    : "Invitation exhausted"}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isInvitationPending &&
                  !isExhausted
                    ? "The doctor has not logged in yet. The invitation is currently being processed."
                    : isInvitationExpired
                    ? "This doctor invitation reached the maximum number of invitation rounds. Create a new doctor account."
                    : "The current invitation attempt exhausted all automatic retries. You can resend the invitation."}
                </p>
              </div>
            </div>
          )}

          <SectionTitle>
            Contact
          </SectionTitle>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={Mail}
              label="Email"
              value={doctor.email}
            />

            <InfoBox
              icon={FileText}
              label="Doctor ID"
              value={`#${doctor.id}`}
            />
          </div>

          <SectionTitle className="mt-6">
            Professional
          </SectionTitle>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={GraduationCap}
              label="Qualification"
              value={
                doctor.qualification
              }
            />

            <InfoBox
              icon={Award}
              label="Experience"
              value={`${doctor.experienceYears} years`}
            />

            <InfoBox
              icon={IndianRupee}
              label="Consultation fee"
              value={`₹${formatCurrency(
                doctor.consultationFee
              )}`}
            />

            <InfoBox
              icon={Building2}
              label="Department"
              value={
                doctor.departmentName
              }
            />

            <InfoBox
              icon={Calendar}
              label="Joined on"
              value={formatDate(
                doctor.createdAt
              )}
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-5 text-muted-foreground">
              Professional credentials are
              managed by hospital
              administration. Doctors cannot
              edit these fields themselves.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-card px-6 py-4">
          <Button
            variant="outline"
            asChild
            className="flex-1 sm:flex-none"
          >
            <Link
              href={`/portal/admin/doctors/${doctor.id}/edit`}
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit details
            </Link>
          </Button>

          {canResend && (
            <Button
              onClick={onResend}
              disabled={resending}
              className="flex-1 sm:flex-none"
            >
              {resending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-4 w-4" />
              )}

              {resending
                ? "Resending..."
                : "Resend invitation"}
            </Button>
          )}

          {isInvitationExpired && (
            <Button
              asChild
              className="flex-1 sm:flex-none"
            >
              <Link href="/portal/admin/doctors/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create new
              </Link>
            </Button>
          )}

          {canToggle && (
            <>
              {isActive ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    onToggleStatus(
                      doctor
                    )
                  }
                  disabled={updating}
                  className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                >
                  {updating ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="mr-1.5 h-4 w-4" />
                  )}

                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    onToggleStatus(
                      doctor
                    )
                  }
                  disabled={updating}
                  className="flex-1 sm:flex-none"
                >
                  {updating ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}

                  Reactivate
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className,
}) {
  return (
    <h3
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </h3>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <p className="mt-1 text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function EmptyState({
  hasFilters,
  status,
  onClear,
}) {
  const isExhaustedTab =
    status === "EXHAUSTED";

  let title = "No doctors yet";
  let desc =
    "Add your first doctor to get started.";

  if (isExhaustedTab) {
    title = "No exhausted invitations";
    desc =
      "All doctor invitations are currently in good standing.";
  } else if (status === "ACTIVE") {
    title = "No active doctors";
    desc =
      "There are no active doctors available.";
  } else if (status === "INACTIVE") {
    title = "No inactive doctors";
    desc =
      "There are no inactive doctors.";
  } else if (status === "SUSPENDED") {
    title = "No suspended doctors";
    desc =
      "There are no suspended doctors.";
  } else if (hasFilters) {
    title = "No doctors found";
    desc =
      "Try adjusting your filters.";
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {isExhaustedTab ? (
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Stethoscope className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <p className="mt-5 text-base font-semibold">
        {title}
      </p>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {desc}
      </p>

      {hasFilters &&
        !isExhaustedTab && (
          <Button
            variant="outline"
            onClick={onClear}
            className="mt-5"
          >
            Clear filters
          </Button>
        )}

      {!hasFilters && !isExhaustedTab && (
        <Button
          asChild
          className="mt-5"
        >
          <Link href="/portal/admin/doctors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add doctor
          </Link>
        </Button>
      )}
    </div>
  );
}

function DoctorGridSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(
        (i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl border border-border bg-muted/30"
          />
        )
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatCurrency(value) {
  if (
    value == null ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  ).format(Number(value));
}