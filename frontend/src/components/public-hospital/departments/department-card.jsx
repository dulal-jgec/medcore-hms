import Link from "next/link";
import { ArrowRight, Building2, HeartPulse } from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function DepartmentCard({ department, hospitalId }) {
  return (
    <Link
      href={`/hospitals/${hospitalId}/departments/${department.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {department.imageUrl ? (
          <PublicImage
            src={department.imageUrl}
            alt={department.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <HeartPulse className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-5">
        {department.code && (
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            {department.code}
          </p>
        )}

        <h3 className="mt-2 text-base font-semibold tracking-tight">
          {department.name}
        </h3>

        {department.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {department.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
          View department
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
