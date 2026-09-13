// ─────────────────────────────────────────────────
// Auth service
// Currently MOCK — swap function bodies for real
// API calls when the backend is ready.
// ─────────────────────────────────────────────────

const MOCK_DELAY = 900;

// MOCK: POST /api/auth/login → { email, password }
export async function login({ email, password }) {
  await new Promise((r) => setTimeout(r, MOCK_DELAY));

  // Demo credentials — any password works for now
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Fake role based on email prefix — for demo purposes
  let role = "PATIENT";
  if (email.startsWith("doctor")) role = "DOCTOR";
  else if (email.startsWith("nurse")) role = "NURSE";
  else if (email.startsWith("admin")) role = "HOSPITAL_ADMIN";
  else if (email.startsWith("reception")) role = "RECEPTIONIST";
  else if (email.startsWith("lab")) role = "LAB_TECHNICIAN";
  else if (email.startsWith("pharma")) role = "PHARMACIST";
  else if (email.startsWith("account")) role = "ACCOUNTANT";

  return {
    user: {
      id: 1,
      fullName: "Demo User",
      email,
      phone: "+91 90000 00000",
      role,
      hospitalName: "North Bengal Medical Centre",
    },
    accessToken: "mock-access-token",
  };
}

// MOCK: POST /api/auth/register
export async function register({ fullName, email, phone, password, confirmPassword, hospitalId }) {
  await new Promise((r) => setTimeout(r, MOCK_DELAY));

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  return {
    message: "Registration successful. Please sign in.",
  };
}

// MOCK: POST /api/auth/logout
export async function logout() {
  await new Promise((r) => setTimeout(r, 200));
}