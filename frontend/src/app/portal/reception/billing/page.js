"use client";

import { Receipt } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function ReceptionBillingPage() {
  return (
    <FeatureComingSoon
      eyebrow="Billing & Payments"
      title="Billing counter is almost ready"
      description="Soon you'll be able to raise invoices, collect payments via UPI, card, or cash, print receipts, and track daily collections — all from the front desk."
      developerNote="The billing backend — invoices, payments, receipts, daily collection reports — is partially ready. I'm connecting it to this screen now. Once live, you'll be able to handle any patient payment right from here."
      backHref="/portal/reception"
      backLabel="Back to reception"
      icon={Receipt}
    />
  );
}