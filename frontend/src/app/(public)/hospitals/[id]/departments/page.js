import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDepartments } from "@/services/public-department.service";
import DepartmentCard from "@/components/public-hospital/departments/department-card";

export default async function DepartmentsPage({ params }) {
  const { id } = await params;

  const [hospitalResult, departmentResult] =
    await Promise.all([
      getPublicHospital(id),
      getPublicDepartments(id, {
        page: 0,
        size: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
    ]);

  const hospital = hospitalResult.data;

  if (!hospital) {
    notFound();
  }

  const departments =
    departmentResult.data?.content || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/hospitals/${id}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {hospital.name}
      </Link>

      <section className="mb-10">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-primary" />

          <div>
            <p className="text-sm text-muted-foreground">
              {hospital.name}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Departments
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Explore the medical departments and services available
          at this hospital.
        </p>
      </section>

      {departments.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="font-medium">
            No departments available
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Department information will appear here when available.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              hospitalId={id}
            />
          ))}
        </div>
      )}
    </main>
  );
}