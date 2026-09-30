"use client";

import { Pill } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function PatientPrescriptionsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Prescriptions"
      title="Your prescriptions are almost here"
      description="Soon you'll be able to view every prescription your doctors have written — with medicines, dosages, timings, and notes — all in one place."
      developerNote="The backend for prescriptions is partially ready and tested. I'm connecting it to this page right now. Once it's live, every prescription will appear here automatically after each visit."
      icon={Pill}
    />
  );
}