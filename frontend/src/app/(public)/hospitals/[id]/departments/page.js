import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BedDouble, Users, Building2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOSPITALS } from "@/lib/hospitals";
import { getHospitalDepartments } from "@/lib/hospital-detail-data";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  if (!hospital) return { title: "Hospital Not Found" };

  return {
    title: `Departments — ${hospital.name}`,
    description: `Clinical departments at ${hospital.name}.`,
  };
}

export default async function DepartmentsListPage({ params }) {
  const { id } = await params;
  const hospital = HOSPITALS.find((h) => h.id === Number(id));
  if (!hospital) notFound();

  const departments = getHospitalDepartments(hospital.id);

  return (
    <>
      {/* Page header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              {hospital.name}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Clinical departments
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Specialized centres of care across {departments.length} clinical
              departments. Each is led by experienced consultants and
              supported by modern diagnostic facilities.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/hospitals/${hospital.id}/departments/${dept.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={dept.image}
                    alt={dept.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      {dept.name}
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-6 text-muted-foreground line-clamp-2">
                    {dept.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    {dept.beds > 0 && (
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-3.5 w-3.5" />
                        {dept.beds} beds
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {dept.doctors} doctors
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {dept.floor}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center lg:p-10">
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Not sure which department you need?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Talk to our general medicine team and they'll guide you to the
                right specialist.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/hospitals/${hospital.id}`}>
                  Back to hospital
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/hospitals/${hospital.id}/departments/general-medicine`}
                >
                  General Medicine
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}