import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { getPublicHospital } from "@/services/hospital-public.service";

export default async function HospitalLayout({ children, params }) {
  const { id } = await params;

  let hospital;

  try {
    const result = await getPublicHospital(id);
    hospital = result.data;
  } catch (error) {
    if (error?.status === 404) notFound();
    throw error;
  }

  if (!hospital) notFound();

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <Link
            href="/hospitals"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Hospitals
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="truncate font-medium text-foreground">
            {hospital.name}
          </span>
        </div>
      </div>

      <main>{children}</main>
    </>
  );
}