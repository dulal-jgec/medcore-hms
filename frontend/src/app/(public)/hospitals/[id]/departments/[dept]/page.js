import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Hash,
  Hospital,
  Layers,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublicDepartment } from "@/services/public-department.service";
import PublicImage from "@/components/public-hospital/shared/public-image";

export default async function DepartmentDetailPage({ params }) {
  const { id, dept } = await params;

  let department;

  try {
    const result = await getPublicDepartment(id, dept);
    department = result.data;
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!department) notFound();

  const initials = department.name
    ?.split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-background">
      {/* ══════════ CINEMATIC HERO ══════════ */}
      <section className="relative">
        <div className="relative h-[520px] w-full overflow-hidden sm:h-[580px] lg:h-[620px]">
          {department.imageUrl ? (
            <PublicImage
              src={department.imageUrl}
              alt={department.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary">
              <span className="text-[180px] font-bold leading-none text-brand/20 sm:text-[220px]">
                {initials}
              </span>
            </div>
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20"
          />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-2">
                {department.code && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                    <Hash className="h-3 w-3" />
                    {department.code}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <CheckCircle2 className="h-3 w-3 text-brand" />
                  Active department
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {department.name}
              </h1>

              {department.hospitalName && (
                <p className="mt-5 flex items-center gap-2 text-sm text-white/85">
                  <Building2 className="h-4 w-4" />
                  {department.hospitalName}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href={`/hospitals/${id}/doctors`}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Meet our doctors
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href={`/hospitals/${id}/departments`}>
                    All departments
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ QUICK INFO STRIP ══════════ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoTile
              icon={Hospital}
              label="Hospital"
              value={department.hospitalName || "—"}
            />
            <InfoTile
              icon={Hash}
              label="Department code"
              value={department.code || "—"}
            />
            <InfoTile
              icon={Layers}
              label="Department ID"
              value={`#${department.id}`}
            />
          </div>
        </div>
      </section>

      {/* ══════════ DESCRIPTION ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand">
                <span className="h-px w-8 bg-brand" />
                Overview
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                About this department
              </h2>

              <p className="mt-6 text-base leading-8 text-muted-foreground lg:text-lg">
                {department.description ||
                  `The ${department.name} department at ${
                    department.hospitalName || "this hospital"
                  } provides specialized medical care backed by experienced consultants and modern diagnostic facilities.`}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  "OPD consultations",
                  "Diagnostic investigations",
                  "Inpatient care",
                  "Follow-up & rehabilitation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                    Ready to visit?
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight">
                    Consult a specialist
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Book an appointment with a consultant in this department.
                  </p>
                  <Button asChild className="mt-5 w-full">
                    <Link href={`/hospitals/${id}/doctors`}>
                      Find a doctor
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                    <Building2 className="h-3.5 w-3.5" />
                    Hospital
                  </div>
                  <p className="mt-3 truncate text-sm font-medium">
                    {department.hospitalName || "—"}
                  </p>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link href={`/hospitals/${id}`}>
                      View hospital
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                  Need care in {department.name}?
                </h3>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/75">
                  Our specialists are available for consultations. Book an
                  appointment or explore other departments.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link href={`/hospitals/${id}/doctors`}>
                    Book appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href={`/hospitals/${id}/departments`}>
                    All departments
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}