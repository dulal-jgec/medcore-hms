import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Stethoscope } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDoctors } from "@/services/public-doctor.service";
import DoctorsSearchGrid from "@/components/public-hospital/doctors/doctors-search-grid";

export default async function DoctorsPage({ params }) {
  const { id } = await params;

  const [hospitalResult, doctorsResult] = await Promise.all([
    getPublicHospital(id),
    getPublicDoctors(id, {
      page: 0,
      size: 100,
      sortBy: "id",
      sortDir: "asc",
    }),
  ]);

  const hospital = hospitalResult.data;
  if (!hospital) notFound();

  // ⚠️ Only show ACTIVE doctors
  const allDoctors = doctorsResult.data?.content || [];
  const doctors = allDoctors.filter(
    (d) => d.status === "ACTIVE"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <Link
        href={`/hospitals/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {hospital.name}
      </Link>

      <header className="mt-10 max-w-2xl">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          <Stethoscope className="h-4 w-4" />
          Medical team
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Our specialists
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Consult with experienced doctors practicing at {hospital.name}.
        </p>
      </header>

      {/* Client component handles search + filtered grid */}
      <DoctorsSearchGrid doctors={doctors} hospitalId={id} />
    </div>
  );
}