import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.success === false) {
    const message =
      result.message ||
      (response.status === 403
        ? "You don't have permission to perform this action."
        : response.status === 401
        ? "Please sign in again."
        : `Request failed (${response.status})`);

    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return result;
}

function generateIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function getHospitalProfile() {
  const response = await apiFetch("/hospital/profile");
  return handleResponse(response);
}

export async function updateHospitalProfile(data) {
  const response = await apiFetch("/hospital/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function uploadHospitalLogo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/hospital/profile/logo", {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function uploadHospitalBanner(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/hospital/profile/banner", {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function resendStaffInvitation(userId) {
  const response = await apiFetch(
    `/hospital/staff/${userId}/resend-invitation`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": generateIdempotencyKey(),
      },
    }
  );

  return handleResponse(response);
}