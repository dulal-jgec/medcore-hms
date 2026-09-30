"use client";

import { Activity } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function RecordVitalsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Record Vitals"
      title="Vitals entry form is being built"
      description="Soon you'll be able to record blood pressure, pulse, temperature, SpO₂, and respiratory rate for any patient — with automatic flagging for abnormal values."
      developerNote="The vitals recording backend is partially ready. I'm connecting this form now. Once it's live, you can log readings right from the patient's bedside."
      backHref="/portal/nurse/vitals"
      backLabel="Back to vitals"
      icon={Activity}
    />
  );
}