import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function createReceptionist(data) {
  const response = await apiFetch("/receptionists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getReceptionists({
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(`/receptionists?${params.toString()}`);

  return handleResponse(response);
}

export async function getReceptionistById(receptionistId) {
  const response = await apiFetch(`/receptionists/${receptionistId}`);

  return handleResponse(response);
}

export async function updateReceptionist(receptionistId, data) {
  const response = await apiFetch(`/receptionists/${receptionistId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function deleteReceptionist(receptionistId) {
  const response = await apiFetch(`/receptionists/${receptionistId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function activateReceptionist(receptionistId) {
  const response = await apiFetch(`/receptionists/${receptionistId}/activate`, {
    method: "PATCH",
  });

  return handleResponse(response);
}

export async function deactivateReceptionist(receptionistId) {
  const response = await apiFetch(
    `/receptionists/${receptionistId}/deactivate`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}

export async function getMyReceptionistProfile() {
  const response = await apiFetch("/receptionists/me");

  return handleResponse(response);
}

export async function updateMyReceptionistProfile(data) {
  const response = await apiFetch("/receptionists/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function uploadReceptionistProfileImage(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiFetch("/receptionists/me/profile-image", {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}

export async function registerPatientByReceptionist(data) {
  const response = await apiFetch("/receptionists/patients/walk-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function checkInPatient(appointmentId) {
  const response = await apiFetch(
    `/receptionists/appointments/${appointmentId}/check-in`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
}

export async function getReceptionistTodayAppointments({
  page = 0,
  size = 10,
  sortBy = "startTime",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(
    `/receptionists/appointments/today?${params.toString()}`
  );

  return handleResponse(response);
}

export async function searchPatients(keyword, { page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });

  const response = await apiFetch(
    `/receptionists/patients/search?${params.toString()}`
  );

  return handleResponse(response);
}