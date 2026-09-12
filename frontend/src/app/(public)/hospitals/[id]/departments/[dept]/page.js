import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Users,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOSPITALS } from "@/lib/hospitals";
import {
  getDepartmentById,
  getHospitalDepartments,
  getHospitalDoctors,
} from "@/lib/hospital-detail-data";

export async function generateMetadata({ params }) {
  const { id, dept } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  const department = getDepartmentById(dept);
  if (!hospital || !department) return { title: "Department Not Found" };

  return {
    title: `${department.name} — ${hospital.name}`,
    description: department.description,
  };
}

export default async function DepartmentDetailPage({ params }) {
  const { id, dept } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  const department = getDepartmentById(dept);
  if (!hospital || !department) notFound();

  // Doctors in this department
  const allDoctors = getHospitalDoctors(hospital.id);
  const departmentDoctors = allDoctors.filter(
    (d) => d.departmentId === dept
  );

  return (
    <>
      {/* ══════════ HERO ══════════ */}
      <section className="relative">
        <div className="relative h-[360px] w-full overflow-hidden sm:h-[420px]">
          <Image
            src={department.image}
            alt={department.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/20"
          />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
              <Link
                href={`/hospitals/${hospital.id}/departments`}
                className="text-xs font-medium text-white/70 hover:text-white"
              >
                ← All departments
              </Link>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
                {department.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
                {department.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  <Link
                    href={`/hospitals/${hospital.id}/doctors`}
                  >
                    Book Appointment
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <a href="tel:+919000000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Call department
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ QUICK INFO STRIP ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoRow
              icon={BedDouble}
              label="Inpatient beds"
              value={department.beds > 0 ? department.beds : "OPD only"}
            />
            <InfoRow
              icon={Users}
              label="Consultants"
              value={`${department.doctors} doctors`}
            />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={department.floor}
            />
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT DEPARTMENT ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Overview
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                About the {department.name} department
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                The {department.name} department at {hospital.name} delivers
                specialized care backed by advanced diagnostic technology and
                a team of experienced consultants. Patients receive
                comprehensive evaluation, treatment, and follow-up under one
                roof.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                The department works closely with related specialties —
                radiology, pathology, and critical care — ensuring seamless
                coordination throughout the patient's care journey.
              </p>

              <h3 className="mt-10 text-base font-semibold tracking-tight">
                Services offered
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "OPD consultations",
                  "Diagnostic investigations",
                  "Inpatient care",
                  "Minor procedures",
                  "Follow-up & rehabilitation",
                  "Emergency support",
                ].map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-muted/30 p-6">
                <div className="flex items-center gap-2 text-brand">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    Department info
                  </p>
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">OPD hours</dt>
                    <dd className="font-medium">Mon – Sat · 9 AM – 5 PM</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Emergency</dt>
                    <dd className="font-medium">24/7 support</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="text-right font-medium">
                      {department.floor}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Beds</dt>
                    <dd className="font-medium">
                      {department.beds > 0 ? department.beds : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════════ DOCTORS IN THIS DEPARTMENT ══════════ */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Consultants
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Doctors in this department
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Book an appointment directly with any of our consultants.
              </p>
            </div>
          </div>

          {departmentDoctors.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {departmentDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
                >
                  <div className="flex gap-5 p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={doc.image}
                        alt={doc.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold tracking-tight">
                        {doc.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-brand">
                        {doc.specialty}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          4.9
                        </span>
                        <span>{doc.experience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-border p-3">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link
                        href={`/hospitals/${hospital.id}/doctors/${doc.id}`}
                      >
                        View Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link
                        href={`/hospitals/${hospital.id}/doctors/${doc.id}#book`}
                      >
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-md rounded-lg border border-dashed border-border py-12 text-center">
              <Stethoscope className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                Consultant details coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please check back later or call the hospital directly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ OTHER DEPARTMENTS ══════════ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Explore more
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Other departments
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link href={`/hospitals/${hospital.id}/departments`}>
                View all
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getHospitalDepartments(hospital.id)
              .filter((d) => d.id !== dept)
              .slice(0, 4)
              .map((d) => (
                <Link
                  key={d.id}
                  href={`/hospitals/${hospital.id}/departments/${d.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-brand/40 hover:bg-hover/40"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{d.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.doctors} doctors
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center lg:p-10">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Ready to see a {department.name} specialist?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book an appointment with a consultant in this department.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={`/hospitals/${hospital.id}/doctors`}>
                Book appointment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}