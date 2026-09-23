import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDoctors } from "@/services/public-doctor.service";
import DoctorCard from "@/components/public-hospital/doctors/doctor-card";

export default async function DoctorsPage({ params }) {
  const { id } = await params;

  const [hospitalResult, doctorResult] =
    await Promise.all([
      getPublicHospital(id),
      getPublicDoctors(id, {
        page: 0,
        size: 100,
        sortBy: "id",
        sortDir: "asc",
      }),
    ]);

  const hospital = hospitalResult.data;

  if (!hospital) {
    return null;
  }

  const doctors = doctorResult.data?.content || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/hospitals/${id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {hospital.name}
      </Link>

      <section className="mb-10">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-7 w-7 text-primary" />

          <div>
            <p className="text-sm text-muted-foreground">
              {hospital.name}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Our Doctors
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Meet the medical professionals serving patients at this
          hospital.
        </p>
      </section>

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="font-medium">No doctors available</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Doctor information will appear here when available.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              hospitalId={id}
            />
          ))}
        </div>
      )}
    </main>
  );
}