import Link from "next/link";
import { ArrowRight, Building2, Mail, MapPin, Phone } from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function HospitalCard({ hospital }) {
  const initials = hospital.name
    ?.split(" ")
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const location = [hospital.city, hospital.state].filter(Boolean).join(", ");

  return (
    <Link
      href={`/hospitals/${hospital.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
    >
      {/* ══════════ IMAGE ══════════ */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {hospital.bannerUrl ? (
          <PublicImage
            src={hospital.bannerUrl}
            alt={hospital.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
        ) : hospital.logoUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/90">
            <PublicImage
              src={hospital.logoUrl}
              alt={hospital.name}
              width={200}
              height={200}
              className="max-h-24 max-w-[60%] object-contain"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/90">
            <span className="text-6xl font-bold text-brand/80">{initials}</span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        />

        {/* Top chips */}
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Active
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-brand-foreground">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Bottom content — over the image */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-white">
            {hospital.name}
          </h3>

          {location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/80">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>
      </div>

      {/* ══════════ META ══════════ */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {hospital.address && (
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{hospital.address}</span>
          </div>
        )}

        {hospital.phone && (
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{hospital.phone}</span>
          </div>
        )}

        {hospital.email && (
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{hospital.email}</span>
          </div>
        )}
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3.5">
        <span className="text-xs font-semibold text-brand">View hospital</span>
        <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
