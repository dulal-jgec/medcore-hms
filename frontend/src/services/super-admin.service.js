import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch (error) {
    // Jodi backend 500 error dey ar HTML page pathay, tokhon crash na kore error throw korbe
    throw new Error(`Server error (${response.status}). Please try again later.`);
  }

  if (!response.ok || result.success === false) {
    const message = 
      result.message || 
      result.error || 
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return result;
}

export async function getDashboard() {
  const response = await apiFetch("/super-admin/dashboard");
  return handleResponse(response);
}

export async function getAllHospitals(
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc"
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(
    `/super-admin/hospitals?${params.toString()}`
  );

  return handleResponse(response);
}

export async function getHospitalById(hospitalId) {
  const response = await apiFetch(
    `/super-admin/hospitals/${hospitalId}`
  );
  return handleResponse(response);
}

export async function createHospital(data) {
  const response = await apiFetch("/super-admin/hospitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getAllHospitalAdmins(page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await apiFetch(
    `/super-admin/admins?${params.toString()}`
  );

  return handleResponse(response);
}

export async function createHospitalAdmin(data) {
  const response = await apiFetch("/super-admin/admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function resendHospitalAdminInvitation(
  userId,
  idempotencyKey
) {
  const response = await apiFetch(
    `/super-admin/admins/${userId}/resend-invitation`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  return handleResponse(response);
}