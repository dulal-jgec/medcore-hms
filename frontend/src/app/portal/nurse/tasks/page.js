"use client";

import { ClipboardList } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function NurseTasksPage() {
  return (
    <FeatureComingSoon
      eyebrow="Nursing Tasks"
      title="Your task list is coming together"
      description="Soon you'll see every nursing task assigned to you — procedures, samples, documentation, discharge prep — sorted by priority and due time."
      developerNote="The tasks backend is partially ready. I'm connecting it to this screen now. Once live, your tasks will appear here the moment they're assigned to you."
      backHref="/portal/nurse"
      backLabel="Back to dashboard"
      icon={ClipboardList}
    />
  );
}