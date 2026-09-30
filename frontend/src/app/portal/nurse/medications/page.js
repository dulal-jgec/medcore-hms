"use client";

import { Pill } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function NurseMedicationsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Medication Rounds"
      title="Medication rounds are being wired up"
      description="Soon you'll see every patient's medication schedule — what's due, what's overdue, and what's already been given — with one-tap administration."
      developerNote="The medication round backend is partially ready and tested. I'm connecting it to this screen now. Once live, your shift's rounds will appear here automatically the moment you sign in."
      backHref="/portal/nurse"
      backLabel="Back to dashboard"
      icon={Pill}
    />
  );
}