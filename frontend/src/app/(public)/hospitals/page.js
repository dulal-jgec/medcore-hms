import { getPublicHospitals } from "@/services/hospital-public.service";
import HospitalDirectory from "@/components/public-hospital/hospitals/hospital-directory";

export const metadata = {
  title: "Find a Hospital | MedCore",
  description:
    "Explore hospitals available on the MedCore healthcare network.",
};

export default async function HospitalsPage() {
  const result = await getPublicHospitals({
    page: 0,
    size: 100,
    sortBy: "name",
    sortDir: "asc",
  });

  const hospitals = Array.isArray(result.data)
    ? result.data
    : result.data?.content || [];

  return <HospitalDirectory hospitals={hospitals} />;
}