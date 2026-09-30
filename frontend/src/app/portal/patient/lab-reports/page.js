"use client";

import { FlaskConical } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function PatientLabReportsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Lab Reports"
      title="Lab reports, coming right up"
      description="Soon you'll be able to view every lab test your doctors have ordered — with values, reference ranges, and downloadable PDFs — all in one place."
      developerNote="The backend for lab reports is partially ready. I'm connecting it to this page now. Reports from your next test will appear here automatically, ready to download and share."
      icon={FlaskConical}
    />
  );
}