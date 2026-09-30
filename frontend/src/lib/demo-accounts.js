const RAW = process.env.NEXT_PUBLIC_DEMO_ACCOUNTS || "";
const MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function isDemoModeEnabled() {
  return MODE && getDemoAccounts().length > 0;
}

export function getDemoAccounts() {
  if (!MODE) return [];
  if (!RAW.trim()) return [];

  try {
    const parsed = JSON.parse(RAW);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (a) =>
          a &&
          typeof a.email === "string" &&
          typeof a.password === "string" &&
          a.email.length > 0 &&
          a.password.length > 0
      )
      .map((a) => ({
        role: typeof a.role === "string" ? a.role : "Demo",
        email: a.email.trim(),
        password: a.password,
        note: typeof a.note === "string" ? a.note : "",
      }));
  } catch {
    return [];
  }
}