import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Clock,
  GraduationCap,
  Languages,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import PublicImage from "@/components/public-hospital/shared/public-image";
import BookAppointmentButton from "@/components/public-hospital/doctors/book-appointment-button";
import { getPublicDoctor } from "@/services/public-doctor.service";

export default async function DoctorDetailsPage({ params }) {
  const { id, doctor } = await params;

  let doctorData;

  try {
    const result = await getPublicDoctor(id, doctor);
    doctorData = result.data;
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!doctorData) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href={`/hospitals/${id}/doctors`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All doctors
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:col-span-5 xl:col-span-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-muted">
            <PublicImage
              src={doctorData.profileImageUrl}
              alt={doctorData.doctorName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />

            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary via-primary/40 to-transparent"
            />

            {doctorData.specialization && (
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                  <Stethoscope className="h-3 w-3" />
                  {doctorData.specialization}
                </span>
              </div>
            )}
          </div>

          {doctorData.consultationFee != null && (
            <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-soft-foreground">
                Consultation fee
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                ₹{doctorData.consultationFee}
              </p>
              {doctorData.consultationDurationMinutes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Approximately {doctorData.consultationDurationMinutes} minutes
                </p>
              )}

              <BookAppointmentButton
                hospitalId={id}
                hospitalName={doctorData.hospitalName}
                doctor={doctorData}
                size="lg"
                className="mt-5 w-full bg-brand text-brand-foreground hover:bg-brand/90"
              />
            </div>
          )}
        </aside>

        <div className="lg:col-span-7 xl:col-span-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Doctor profile
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {doctorData.doctorName}
          </h1>

          {doctorData.departmentName && (
            <p className="mt-3 text-lg text-muted-foreground">
              {doctorData.departmentName}
            </p>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <InfoTile
              icon={GraduationCap}
              label="Qualification"
              value={doctorData.qualification}
            />
            <InfoTile
              icon={Award}
              label="Experience"
              value={
                doctorData.experienceYears != null
                  ? `${doctorData.experienceYears} years`
                  : null
              }
            />
            <InfoTile
              icon={Languages}
              label="Languages"
              value={doctorData.languages}
            />
            <InfoTile
              icon={Clock}
              label="Consultation"
              value={
                doctorData.consultationDurationMinutes
                  ? `${doctorData.consultationDurationMinutes} min`
                  : null
              }
            />
          </div>

          {doctorData.bio && (
            <div className="mt-10 rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <Briefcase className="h-3.5 w-3.5" />
                About the doctor
              </div>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {doctorData.bio}
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Hospital
                </p>
                <p className="mt-1 truncate text-sm font-medium">
                  {doctorData.hospitalName || "—"}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {doctorData.departmentName || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-brand">
                  Verified by MedCore
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Available for consultation
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-8">
            <BookAppointmentButton
              hospitalId={id}
              hospitalName={doctorData.hospitalName}
              doctor={doctorData}
            />

            <Button asChild size="lg" variant="outline">
              <Link href={`/hospitals/${id}`}>Back to hospital</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium leading-6">
        {value || "Not specified"}
      </p>
    </div>
  );
}