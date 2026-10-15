import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export async function sendContactEmail(payload) {
  // Debug logging — remove later
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("[contact] Missing EmailJS env vars:", {
      SERVICE_ID: SERVICE_ID ? "set" : "missing",
      TEMPLATE_ID: TEMPLATE_ID ? "set" : "missing",
      PUBLIC_KEY: PUBLIC_KEY ? "set" : "missing",
    });
    throw new Error("EmailJS is not configured. Please contact support.");
  }

  try {
    return await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: payload.fullName,
        from_email: payload.email,
        from_phone: payload.phone || "Not provided",
        subject: payload.subject,
        message: payload.message,
      },
      { publicKey: PUBLIC_KEY }
    );
  } catch (err) {
    console.error("[contact] EmailJS send failed:", err);
    // Show actual EmailJS error to user
    const text = err?.text || err?.message || "Unknown error";
    throw new Error(`Email send failed: ${text}`);
  }
}