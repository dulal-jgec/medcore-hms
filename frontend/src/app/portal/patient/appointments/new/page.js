"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import AppointmentForm from "@/components/portal/appointment-form";

function NewAppointmentContent() {
  const params = useSearchParams();

  const hospitalId = params.get("hospitalId");
  const doctorId = params.get("doctorId");

  if (!hospitalId || !doctorId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-semibold">
          Missing booking details
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please choose a doctor from a hospital page to start a booking.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <AppointmentForm
        hospitalId={Number(hospitalId)}
        doctorId={Number(doctorId)}
      />
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  );
}