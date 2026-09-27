import Link from "next/link";
import { Building2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPublicHospitals } from "@/services/hospital-public.service";
import HospitalDirectory from "@/components/public-hospital/hospitals/hospital-directory";

export const metadata = {
  title: "Hospitals | MedCore",
  description:
    "Explore hospitals available on the MedCore healthcare network. View departments, doctors, and contact information.",
};

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  let hospitals = [];
  let error = null;

  try {
    const result = await getPublicHospitals({
      page: 0,
      size: 50,
      sortBy: "name",
      sortDir: "asc",
    });

    hospitals = Array.isArray(result.data)
      ? result.data
      : result.data?.content || [];
  } catch (err) {
    console.error("[/hospitals] failed to load hospitals:", err);
    error = err;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Unable to load hospitals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The MedCore service is temporarily unavailable. Please try again in a
          moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/hospitals">Retry</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <HospitalDirectory hospitals={hospitals} />;
}