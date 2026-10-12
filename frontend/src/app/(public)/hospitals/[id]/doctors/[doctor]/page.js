import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Clock,
  GraduationCap,
  Languages,
  ShieldAlert,
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
    // Only true 404 → hard not found page
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!doctorData) notFound();

  // ⚠️ Inactive doctor → show a nice "not available" page (not 404)
  if (doctorData.status && doctorData.status !== "ACTIVE") {
    return (
      <DoctorNotAvailable
        hospitalId={id}
        doctorName={doctorData.doctorName}
        specialization={doctorData.specialization}
        hospitalName={doctorData.hospitalName}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <Link
        href={`/hospitals/${id}/doctors`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All doctors
      </Link>

      <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-14">
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
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary-darker via-primary-darker/40 to-transparent"
            />

            {doctorData.specialization && (
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
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
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <span className="h-px w-6 bg-brand" />
            Doctor profile
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {doctorData.doctorName}
          </h1>

          {doctorData.departmentName && (
            <p className="mt-3 text-base text-muted-foreground lg:text-lg">
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
            <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-7">
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
                <ShieldAlert className="h-4 w-4" />
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

/* ══════════ Inactive doctor view ══════════ */

function DoctorNotAvailable({
  hospitalId,
  doctorName,
  specialization,
  hospitalName,
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <Link
        href={`/hospitals/${hospitalId}/doctors`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All doctors
      </Link>

      <div className="mt-10 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted">
          <ShieldAlert className="h-9 w-9 text-muted-foreground" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Not available
        </p>

        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          This doctor is currently unavailable
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          {doctorName ? (
            <>
              <span className="font-medium text-foreground">
                Dr. {doctorName}
              </span>
              {specialization ? (
                <>
                  {" "}
                  ({specialization})
                </>
              ) : null}{" "}
              is not accepting appointments at the moment
              {hospitalName ? (
                <>
                  {" "}
                  at <span className="font-medium text-foreground">
                    {hospitalName}
                  </span>
                </>
              ) : null}
              . Please check back later or browse other doctors.
            </>
          ) : (
            <>
              This doctor is not accepting appointments at the moment. Please
              check back later or browse other doctors.
            </>
          )}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/hospitals/${hospitalId}/doctors`}>
              <Stethoscope className="mr-2 h-4 w-4" />
              Browse other doctors
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href={`/hospitals/${hospitalId}`}>
              Back to hospital
            </Link>
          </Button>
        </div>

        <div className="mt-10 w-full max-w-md rounded-2xl border border-border bg-muted/30 p-5 text-left">
          <p className="text-xs leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Doctors
            may be temporarily unavailable due to leave, schedule updates, or
            verification status changes.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Small components ══════════ */

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