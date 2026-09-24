import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
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
  const response = await apiFetch(`/super-admin/admins?${params.toString()}`);
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