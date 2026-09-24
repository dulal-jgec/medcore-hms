import { notFound } from "next/navigation";
import { Building2, HeartPulse, Layers, Stethoscope } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";
import { getPublicDepartments } from "@/services/public-department.service";
import DepartmentCard from "@/components/public-hospital/departments/department-card";

export const metadata = {
  title: "Departments | MedCore",
};

export default async function DepartmentsPage({ params }) {
  const { id } = await params;

  const [hospitalResult, departmentsResult] = await Promise.all([
    getPublicHospital(id),
    getPublicDepartments(id, {
      page: 0,
      size: 50,
      sortBy: "name",
      sortDir: "asc",
    }),
  ]);

  const hospital = hospitalResult.data;
  if (!hospital) notFound();

  const departments = departmentsResult.data?.content || [];
  const activeCount = departments.filter((d) => d.status !== "INACTIVE").length;

  return (
    <div className="bg-background">
      {/* ══════════ PREMIUM HEADER ══════════ */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand">
              <span className="h-px w-8 bg-brand" />
              Departments
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Centres of care at{" "}
              <span className="text-brand">{hospital.name}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
              Explore {departments.length} specialized medical department
              {departments.length !== 1 ? "s" : ""} staffed by experienced
              consultants and modern diagnostic facilities.
            </p>
          </div>

          {/* Stats strip */}
          {departments.length > 0 && (
            <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
              <StatTile
                icon={Layers}
                value={departments.length}
                label="Total departments"
              />
              <StatTile
                icon={HeartPulse}
                value={activeCount}
                label="Active units"
              />
              <StatTile
                icon={Stethoscope}
                value="24/7"
                label="Emergency support"
              />
            </div>
          )}
        </div>
      </section>

      {/* ══════════ GRID ══════════ */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          {departments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {departments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  hospitalId={id}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-soft-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xl font-bold tracking-tight">{value}</p>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <Building2 className="h-7 w-7 text-brand-soft-foreground" />
      </div>
      <h2 className="mt-6 text-lg font-semibold">
        Departments coming soon
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This hospital is still setting up its department structure. Check back
        soon for available specialties.
      </p>
    </div>
  );
}