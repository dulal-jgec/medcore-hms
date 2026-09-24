import { getPublicHospitals } from "@/services/hospital-public.service";
import HospitalDirectory from "@/components/public-hospital/hospitals/hospital-directory";

export const metadata = {
  title: "Hospitals | MedCore",
  description:
    "Explore hospitals available on the MedCore healthcare network. View departments, doctors, and contact information.",
};

export default async function HospitalsPage() {
  const result = await getPublicHospitals({
    page: 0,
    size: 50,
    sortBy: "name",
    sortDir: "asc",
  });

  const hospitals = Array.isArray(result.data)
    ? result.data
    : result.data?.content || [];

  return <HospitalDirectory hospitals={hospitals} />;
}