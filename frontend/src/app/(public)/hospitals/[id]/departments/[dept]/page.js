import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

import { getPublicDepartment } from "@/services/public-department.service";
import PublicImage from "@/components/public-hospital/shared/public-image";

export default async function DepartmentDetailsPage({
  params,
}) {
  const { id, dept } = await params;

  let department;

  try {
    const result = await getPublicDepartment(id, dept);
    department = result.data;
  } catch (error) {
    if (error?.status === 404) {
      notFound();
    }

    throw error;
  }

  if (!department) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/hospitals/${id}/departments`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to departments
      </Link>

      <section className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-muted">
          <PublicImage
            src={department.imageUrl}
            alt={department.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          {department.code && (
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              {department.code}
            </p>
          )}

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            {department.name}
          </h1>

          {department.hospitalName && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {department.hospitalName}
            </div>
          )}

          {department.description && (
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {department.description}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}