import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getNurses({
  page = 0,
  size = 50,
  sortBy = "id",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const response = await apiFetch(`/nurses?${params.toString()}`);
  return handleResponse(response);
}

export async function getNurseById(nurseId) {
  const response = await apiFetch(`/nurses/${nurseId}`);
  return handleResponse(response);
}

export async function createNurse(data) {
  const response = await apiFetch("/nurses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateNurse(nurseId, data) {
  const response = await apiFetch(`/nurses/${nurseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteNurse(nurseId) {
  const response = await apiFetch(`/nurses/${nurseId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function activateNurse(nurseId) {
  const response = await apiFetch(`/nurses/${nurseId}/activate`, {
    method: "PATCH",
  });
  return handleResponse(response);
}

export async function deactivateNurse(nurseId) {
  const response = await apiFetch(`/nurses/${nurseId}/deactivate`, {
    method: "PATCH",
  });
  return handleResponse(response);
}

export async function getMyNurseProfile() {
  const response = await apiFetch("/nurses/me");
  return handleResponse(response);
}

export async function updateMyNurseProfile(data) {
  const response = await apiFetch("/nurses/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function uploadNurseProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/nurses/me/profile-image", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}