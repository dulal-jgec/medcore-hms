import { getPublicHospitals } from "@/services/hospital-public.service";
import { HospitalDirectory } from "@/components/public/hospital-directory";

export const metadata = {
  title: "Hospitals | MedCore",
  description:
    "Explore hospitals available on the MedCore healthcare network. View departments, doctors, and contact information.",
};

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  let hospitals = [];
  let error = "";

  try {
    const result = await getPublicHospitals({
      page: 0,
      size: 100,
      sortBy: "name",
      sortDir: "asc",
    });

    hospitals = Array.isArray(result.data)
      ? result.data
      : result.data?.content || [];
  } catch (err) {
    console.error("[/hospitals] failed to load:", err);
    error = err?.message || "Unable to load hospitals";
  }

  return <HospitalDirectory hospitals={hospitals} serverError={error} />;
}