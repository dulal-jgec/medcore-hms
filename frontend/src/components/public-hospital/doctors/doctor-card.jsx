import Link from "next/link";
import {
  ArrowRight,
  BriefcaseMedical,
  Stethoscope,
} from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function DoctorCard({
  doctor,
  hospitalId,
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {doctor.profileImageUrl ? (
          <PublicImage
            src={doctor.profileImageUrl}
            alt={doctor.doctorName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Stethoscope className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-lg font-semibold">
          {doctor.doctorName}
        </p>

        {doctor.specialization && (
          <p className="mt-1 text-sm font-medium text-primary">
            {doctor.specialization}
          </p>
        )}

        {doctor.departmentName && (
          <p className="mt-2 text-sm text-muted-foreground">
            {doctor.departmentName}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <BriefcaseMedical className="h-4 w-4" />

          <span>
            {doctor.experienceYears != null
              ? `${doctor.experienceYears} ${
                  doctor.experienceYears === 1
                    ? "year"
                    : "years"
                } experience`
              : "Experience not specified"}
          </span>
        </div>

        <Link
          href={`/hospitals/${hospitalId}/doctors/${doctor.id}`}
          className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium transition hover:bg-muted"
        >
          View Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}