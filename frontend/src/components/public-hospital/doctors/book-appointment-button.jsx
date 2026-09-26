"use client";

import { useRouter } from "next/navigation";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  buildBookingUrl,
  buildLoginUrl,
  setBookingIntent,
} from "@/lib/booking-intent";

export default function BookAppointmentButton({
  hospitalId,
  hospitalName,
  doctor,
  size = "lg",
  variant = "default",
  className,
  label = "Book appointment",
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [navigating, setNavigating] = useState(false);

  function handleClick() {
    if (navigating) return;
    setNavigating(true);

    const intent = {
      hospitalId,
      hospitalName,
      doctorId: doctor.id,
      doctorName: doctor.doctorName,
      specialization: doctor.specialization,
      profileImageUrl: doctor.profileImageUrl,
      consultationFee: doctor.consultationFee,
    };

    setBookingIntent(intent);

    const bookingUrl = buildBookingUrl(intent);

    if (accessToken) {
      router.push(bookingUrl);
    } else {
      router.push(buildLoginUrl(bookingUrl));
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={navigating}
    >
      {navigating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Calendar className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}