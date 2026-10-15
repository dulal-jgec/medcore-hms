"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Siren,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Try super-admin endpoint first, fall back to public endpoint
import { getPublicHospital } from "@/services/hospital-public.service";
import { getHospitalById } from "@/services/super-admin.service";

/* ══════════ Page ══════════ */

export default function SuperAdminHospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id;

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hospitalId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        let res;

        try {
          // Preferred: super-admin endpoint (works even if hospital inactive)
          res = await getHospitalById(hospitalId);
        } catch (err) {
          // Fallback: public endpoint (only returns active hospitals)
          if (err?.status === 404 || err?.status === 403) {
            res = await getPublicHospital(hospitalId);
          } else {
            throw err;
          }
        }

        const payload = res?.data ?? res;

        if (cancelled) return;
        setHospital(payload);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load hospital.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Hospital not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "This hospital record doesn't exist."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/super-admin/hospitals">Back to hospitals</Link>
        </Button>
      </div>
    );
  }

  const logoUrl = getHospitalLogo(hospital);
  const name = hospital.name || "Hospital";
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* ── LEFT: identity card ── */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col items-center text-center">
              {/* Logo / fallback */}
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-brand text-4xl font-bold text-brand-foreground">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector("[data-fallback]")) {
                        const span = document.createElement("span");
                        span.dataset.fallback = "true";
                        span.textContent = initials;
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold tracking-tight">
                {name}
              </h2>

              {hospital.licenseNumber && (
                <p className="mt-1 text-xs text-muted-foreground">
                  License {hospital.licenseNumber}
                </p>
              )}

              {hospital.status && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  {hospital.status}
                </span>
              )}
            </div>

            {/* Quick info list */}
            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <Row
                icon={MapPin}
                label="Location"
                value={
                  [hospital.city, hospital.state].filter(Boolean).join(", ") ||
                  "—"
                }
              />
              <Row
                icon={Phone}
                label="Phone"
                value={hospital.phone || "—"}
              />
              <Row
                icon={Mail}
                label="Email"
                value={hospital.email || "—"}
              />
              <Row
                icon={Calendar}
                label="Registered"
                value={formatDate(hospital.createdAt)}
              />
            </dl>

            {/* Actions */}
            <div className="mt-6 space-y-2 border-t border-border pt-5">
              <Button asChild className="w-full">
                <Link
                  href={`/super-admin/admins/create?hospitalId=${hospital.id}`}
                >
                  <User className="mr-1.5 h-4 w-4" />
                  Add admin
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link
                  href={`/super-admin/hospitals/${hospital.id}/edit`}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit hospital
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: sections ── */}
        <div className="space-y-6 lg:col-span-8">
          {/* Overview */}
          <SectionCard
            icon={Building2}
            title="Overview"
            desc="Basic information about this hospital."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Building2} label="Name" value={hospital.name} />
              <InfoRow
                icon={FileText}
                label="License number"
                value={hospital.licenseNumber}
              />
              <InfoRow icon={Mail} label="Email" value={hospital.email} />
              <InfoRow
                icon={ShieldCheck}
                label="Status"
                value={hospital.status}
              />
            </div>

            {hospital.description && (
              <div className="mt-5 border-t border-border pt-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  About
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                  {hospital.description}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Contact */}
          <SectionCard
            icon={Phone}
            title="Contact information"
            desc="How to reach this hospital."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow icon={Phone} label="Phone" value={hospital.phone} />
              <InfoRow
                icon={Siren}
                label="Emergency phone"
                value={hospital.emergencyPhone}
              />
              <InfoRow icon={Mail} label="Email" value={hospital.email} />
              <InfoRow
                icon={ShieldCheck}
                label="Status"
                value={hospital.status}
              />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard
            icon={MapPin}
            title="Address"
            desc="Physical location."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={MapPin}
                label="Address"
                value={hospital.address}
                className="sm:col-span-2"
              />
              <InfoRow icon={MapPin} label="City" value={hospital.city} />
              <InfoRow icon={MapPin} label="State" value={hospital.state} />
              <InfoRow
                icon={MapPin}
                label="Pincode"
                value={hospital.pincode}
              />
            </div>
          </SectionCard>

          {/* Timeline */}
          <SectionCard
            icon={Calendar}
            title="Timeline"
            desc="Registration details."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoRow
                icon={Calendar}
                label="Registered on"
                value={formatDate(hospital.createdAt)}
              />
              <InfoRow
                icon={Building2}
                label="Hospital ID"
                value={`#${hospital.id}`}
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

/* ══════════ Helpers ══════════ */

function getHospitalLogo(hospital) {
  if (!hospital) return null;
  return (
    hospital.logoUrl ||
    hospital.logo ||
    hospital.logoURL ||
    hospital.profileImageUrl ||
    null
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}