import { notFound } from "next/navigation";

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

  return <main>{children}</main>;
}