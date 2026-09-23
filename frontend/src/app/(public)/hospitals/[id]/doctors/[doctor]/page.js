import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseMedical,
  Clock,
  GraduationCap,
  Languages,
  Stethoscope,
} from "lucide-react";

import { getPublicDoctor } from "@/services/public-doctor.service";
import PublicImage from "@/components/public-hospital/shared/public-image";

export default async function DoctorDetailsPage({
  params,
}) {
  const { id, doctor } = await params;

  let doctorData;

  try {
    const result = await getPublicDoctor(id, doctor);
    doctorData = result.data;
  } catch (error) {
    if (error?.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!doctorData) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/hospitals/${id}/doctors`}
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      <section className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <PublicImage
            src={doctorData.profileImageUrl}
            alt={doctorData.doctorName}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            priority
            className="object-cover"
          />
        </div>

        <div>
          {doctorData.specialization && (
            <p className="text-sm font-medium text-primary">
              {doctorData.specialization}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {doctorData.doctorName}
          </h1>

          {doctorData.departmentName && (
            <p className="mt-2 text-muted-foreground">
              {doctorData.departmentName}
            </p>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <InfoItem
              icon={GraduationCap}
              label="Qualification"
              value={doctorData.qualification}
            />

            <InfoItem
              icon={BriefcaseMedical}
              label="Experience"
              value={
                doctorData.experienceYears != null
                  ? `${doctorData.experienceYears} years`
                  : "Not specified"
              }
            />

            <InfoItem
              icon={Clock}
              label="Consultation"
              value={
                doctorData.consultationFee != null
                  ? `₹${doctorData.consultationFee}${
                      doctorData.consultationDurationMinutes
                        ? ` • ${doctorData.consultationDurationMinutes} min`
                        : ""
                    }`
                  : "Not specified"
              }
            />

            <InfoItem
              icon={Languages}
              label="Languages"
              value={
                doctorData.languages || "Not specified"
              }
            />
          </div>

          {doctorData.bio && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">
                About the Doctor
              </h2>

              <p className="mt-3 leading-7 text-muted-foreground">
                {doctorData.bio}
              </p>
            </div>
          )}

          <div className="mt-10 rounded-2xl border p-5">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-primary" />

              <div>
                <p className="text-sm font-medium">
                  {doctorData.hospitalName}
                </p>

                <p className="text-sm text-muted-foreground">
                  {doctorData.departmentName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <p className="mt-2 text-sm font-medium">
        {value || "Not specified"}
      </p>
    </div>
  );
}