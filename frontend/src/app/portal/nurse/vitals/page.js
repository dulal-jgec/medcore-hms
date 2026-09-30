"use client";

import { Activity } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function NurseVitalsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Patient Vitals"
      title="Vitals monitoring is on the way"
      description="Soon you'll see every patient who needs vitals recorded — with last readings, due times, and overdue alerts — all in one queue."
      developerNote="The vitals backend is partially ready. I'm connecting it to this screen now. Once live, your vitals queue will update in real time as readings are entered."
      backHref="/portal/nurse"
      backLabel="Back to dashboard"
      icon={Activity}
    />
  );
}