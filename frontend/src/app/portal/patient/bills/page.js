"use client";

import { Receipt } from "lucide-react";

import FeatureComingSoon from "@/components/portal/feature-coming-soon";

export default function PatientBillsPage() {
  return (
    <FeatureComingSoon
      eyebrow="Bills & Payments"
      title="Billing module is on the way"
      description="Soon you'll be able to view invoices, download receipts, and pay pending bills directly from your MedCore account."
      developerNote="The backend for billing and payments is partially ready. I'm wiring it up to this page now — invoices, receipts, and payment options will all be available very soon."
      icon={Receipt}
    />
  );
}