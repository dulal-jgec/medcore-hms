"use client";

import { FlaskConical } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function LabDashboardPage() {
  return (
    <FeatureComingSoon
      eyebrow="Lab Dashboard"
      title="Your lab workspace is coming together"
      description="Soon your dashboard will show everything at a glance — samples to collect, tests in progress, reports ready to publish, and recent activity — without opening a single sidebar page."
      developerNote="The lab backend — orders, samples, processing, reports — is partially ready and tested. I'm connecting it to this dashboard now. Once it's live, you won't need to open Orders, Samples, or Reports individually. Everything you need will appear right here the moment you sign in."
      backHref="/"
      backLabel="Go to home"
      icon={FlaskConical}
    />
  );
}