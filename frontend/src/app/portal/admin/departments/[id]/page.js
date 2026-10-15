"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Hash,
  ImagePlus,
  Layers,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDepartmentById,
  updateDepartmentStatus,
  uploadDepartmentImage,
} from "@/services/department.service";

export default function AdminDepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id;

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!departmentId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await getDepartmentById(departmentId);
        if (cancelled) return;
        setDepartment(res.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load department.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  async function handleToggleStatus() {
    if (!department) return;

    const isActive = department.status === "ACTIVE";
    const nextStatus = isActive ? "INACTIVE" : "ACTIVE";

    const confirmMessage = isActive
      ? `Deactivate ${department.name}? It will be hidden from the public site.`
      : `Activate ${department.name}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setUpdating(true);
      setMessage("");
      setActionError("");

      const res = await updateDepartmentStatus(department.id, nextStatus);
      setDepartment((prev) => ({ ...prev, ...res.data }));
      setMessage(
        isActive
          ? "Department deactivated successfully."
          : "Department activated successfully."
      );
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");
      setActionError("");

      const res = await uploadDepartmentImage(department.id, file);
      setDepartment((prev) => ({ ...prev, ...res.data }));
      setMessage("Department image uploaded successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setActionError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Department not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This department record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/portal/admin/departments">Back to departments</Link>
        </Button>
      </div>
    );
  }

  const isActive = department.status === "ACTIVE";
  const initials = (department.name || "D")
    .split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.push("/portal/admin/departments")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to departments
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
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* LEFT — identity card */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            {/* Image / avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  className={cn(
                    "flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-border text-3xl font-bold",
                    isActive
                      ? "bg-brand text-brand-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {department.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={department.imageUrl}
                      alt={department.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-foreground text-background transition-transform hover:scale-105 disabled:opacity-50"
                  aria-label="Upload department image"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-3.5 w-3.5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {department.name}
              </h2>

              {department.code && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  {department.code}
                </p>
              )}

              <div className="mt-3">
                <StatusBadge status={department.status} />
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={Hash}
                label="Code"
                value={department.code || "—"}
              />
              <Row
                icon={Building2}
                label="Hospital"
                value={department.hospitalName || "—"}
              />
              <Row
                icon={Calendar}
                label="Created"
                value={formatDate(department.createdAt)}
              />
            </dl>

            <div className="mt-6 space-y-2 border-t border-border pt-5">
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
                  <ShieldCheck className="mr-1.5 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                )}
                {isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </aside>

        {/* RIGHT — sections */}
        <div className="space-y-6 lg:col-span-8">
          {/* Overview */}
          <SectionCard
            icon={Layers}
            title="Overview"
            desc="Basic information about this department."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Layers} label="Name" value={department.name} />
              <InfoRow
                icon={Hash}
                label="Code"
                value={department.code}
              />
              <InfoRow
                icon={Building2}
                label="Hospital"
                value={department.hospitalName}
              />
              <InfoRow
                icon={FileText}
                label="Department ID"
                value={`#${department.id}`}
              />
            </div>

            {department.description && (
              <div className="mt-5 border-t border-border pt-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Description
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                  {department.description}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Visibility note */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              {isActive
                ? "This department is publicly visible on the hospital profile and patients can book doctors assigned to it."
                : "This department is hidden from the public site. Activate it to make it available for patients."}
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
  const isActive = status === "ACTIVE";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
        isActive
          ? "bg-brand-soft text-brand-soft-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isActive ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

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