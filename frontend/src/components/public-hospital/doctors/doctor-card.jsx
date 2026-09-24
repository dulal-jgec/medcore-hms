import Link from "next/link";
import { ArrowUpRight, Stethoscope } from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function DoctorCard({ doctor, hospitalId }) {
  const initials = doctor.doctorName
    ?.replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/hospitals/${hospitalId}/doctors/${doctor.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {doctor.profileImageUrl ? (
          <PublicImage
            src={doctor.profileImageUrl}
            alt={doctor.doctorName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/85">
            <span className="text-5xl font-bold text-brand">{initials}</span>
          </div>
        )}

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"
        />

        {doctor.specialization && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
            <Stethoscope className="h-3 w-3" />
            {doctor.specialization}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
            {doctor.doctorName}
          </h3>

          {doctor.departmentName && (
            <p className="mt-1 truncate text-xs text-white/75">
              {doctor.departmentName}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Experience
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {doctor.experienceYears != null
              ? `${doctor.experienceYears} years`
              : "Not specified"}
          </p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-soft-foreground transition-transform group-hover:scale-110">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}