import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import PublicImage from "@/components/public-hospital/shared/public-image";

export default function HospitalCard({ hospital }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-muted">
        {hospital.bannerUrl ? (
          <PublicImage
            src={hospital.bannerUrl}
            alt={hospital.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : hospital.logoUrl ? (
          <div className="flex h-full items-center justify-center">
            <PublicImage
              src={hospital.logoUrl}
              alt={hospital.name}
              width={240}
              height={160}
              className="max-h-24 max-w-[70%] object-contain"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-full border bg-background/95 px-3 py-1 text-xs font-medium">
          Active
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-semibold">
          {hospital.name}
        </h3>

        {(hospital.city || hospital.state) && (
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              {[hospital.city, hospital.state]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}

        {hospital.address && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {hospital.address}
          </p>
        )}

        <div className="mt-4 space-y-2 border-t pt-4">
          {hospital.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{hospital.phone}</span>
            </div>
          )}

          {hospital.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {hospital.email}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/hospitals/${hospital.id}`}
          className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
        >
          View Hospital
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}