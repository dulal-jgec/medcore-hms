import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export async function sendContactEmail(payload) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error("[contact] EmailJS env vars missing");
    throw new Error("CONTACT_SEND_FAILED");
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
    throw new Error("CONTACT_SEND_FAILED");
  }
}