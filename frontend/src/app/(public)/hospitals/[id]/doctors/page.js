import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDoctors } from "@/services/public-doctor.service";
import DoctorCard from "@/components/public-hospital/doctors/doctor-card";

export default async function DoctorsPage({ params }) {
  const { id } = await params;

  const [hospitalResult, doctorsResult] = await Promise.all([
    getPublicHospital(id),
    getPublicDoctors(id, {
      page: 0,
      size: 50,
      sortBy: "id",
      sortDir: "asc",
    }),
  ]);

  const hospital = hospitalResult.data;
  if (!hospital) return null;

  const doctors = doctorsResult.data?.content || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <Link
        href={`/hospitals/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {hospital.name}
      </Link>

      <header className="mt-10 max-w-2xl">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand">
          <Stethoscope className="h-4 w-4" />
          Medical team
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Our specialists
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Consult with experienced doctors practicing at {hospital.name}.
        </p>
      </header>

      {doctors.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Stethoscope className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-5 text-base font-semibold">No doctors yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Doctor profiles will appear here once added.
          </p>
        </div>
      ) : (
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              hospitalId={id}
            />
          ))}
        </div>
      )}
    </div>
  );
}