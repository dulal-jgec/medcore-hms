import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function DepartmentCard({ department, hospitalId }) {
  const initials = department.name
    ?.split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/hospitals/${hospitalId}/departments/${department.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {department.imageUrl ? (
          <PublicImage
            src={department.imageUrl}
            alt={department.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
            <span className="text-6xl font-bold text-brand/80">{initials}</span>
          </div>
        )}

        {/* Gradient overlay — bottom heavy */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        />

        {/* Top chips */}
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          {department.code ? (
            <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {department.code}
            </span>
          ) : (
            <span />
          )}

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-brand-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-white">
            {department.name}
          </h3>
          <p className="mt-1 truncate text-xs text-white/70">
            {department.hospitalName || "Department"}
          </p>
        </div>
      </div>

      {/* Description strip */}
      <div className="flex flex-1 items-start border-t border-border px-5 py-4">
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {department.description ||
            "Explore the services and specialists available in this department."}
        </p>
      </div>
    </Link>
  );
}
