import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getAccountants() {
  const response = await apiFetch("/accountants");
  return handleResponse(response);
}

export async function getAccountantById(accountantId) {
  const response = await apiFetch(`/accountants/${accountantId}`);
  return handleResponse(response);
}

export async function createAccountant(data) {
  const response = await apiFetch("/accountants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateAccountant(accountantId, data) {
  const response = await apiFetch(`/accountants/${accountantId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteAccountant(accountantId) {
  const response = await apiFetch(`/accountants/${accountantId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function activateAccountant(accountantId) {
  const response = await apiFetch(`/accountants/${accountantId}/activate`, {
    method: "PATCH",
  });
  return handleResponse(response);
}

export async function deactivateAccountant(accountantId) {
  const response = await apiFetch(`/accountants/${accountantId}/deactivate`, {
    method: "PATCH",
  });
  return handleResponse(response);
}

export async function getAccountantDashboard() {
  const response = await apiFetch("/accountants/dashboard");
  return handleResponse(response);
}

export async function getHospitalBills({
  page = 0,
  size = 10,
  sortBy = "billDate",
  sortDir = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const response = await apiFetch(`/accountants/bills?${params.toString()}`);
  return handleResponse(response);
}

export async function getMyAccountantProfile() {
  const response = await apiFetch("/accountants/me");
  return handleResponse(response);
}

export async function updateMyAccountantProfile(data) {
  const response = await apiFetch("/accountants/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function uploadAccountantProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/accountants/me/profile-image", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}