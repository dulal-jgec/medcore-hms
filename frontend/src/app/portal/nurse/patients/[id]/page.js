"use client";

import { User } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function NursePatientDetailPage() {
  return (
    <FeatureComingSoon
      eyebrow="Patient Details"
      title="Patient profiles are being connected"
      description="Soon you'll be able to view a patient's vitals timeline, medication schedule, nursing notes, and allergies — everything you need for their care."
      developerNote="The patient detail backend is partially ready. I'm connecting it to this screen now. Once live, each patient's full clinical view will open here in one tap."
      backHref="/portal/nurse/patients"
      backLabel="Back to patients"
      icon={User}
    />
  );
}