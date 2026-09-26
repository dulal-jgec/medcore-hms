const KEY = "medcore:booking-intent";
const MAX_AGE_MS = 1000 * 60 * 60;

export function setBookingIntent(intent) {
  if (typeof window === "undefined") return;

  const payload = {
    hospitalId: intent.hospitalId ?? null,
    hospitalName: intent.hospitalName ?? null,
    doctorId: intent.doctorId ?? null,
    doctorName: intent.doctorName ?? null,
    specialization: intent.specialization ?? null,
    profileImageUrl: intent.profileImageUrl ?? null,
    consultationFee: intent.consultationFee ?? null,
    savedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function getBookingIntent() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(KEY);
    return null;
  }
}

export function clearBookingIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function buildBookingUrl(intent) {
  const params = new URLSearchParams();

  if (intent?.hospitalId != null) {
    params.set("hospitalId", String(intent.hospitalId));
  }
  if (intent?.doctorId != null) {
    params.set("doctorId", String(intent.doctorId));
  }

  const qs = params.toString();
  return qs
    ? `/portal/patient/appointments/new?${qs}`
    : "/portal/patient/appointments/new";
}

export function buildLoginUrl(redirectTo) {
  if (!redirectTo) return "/login";
  return `/login?next=${encodeURIComponent(redirectTo)}`;
}