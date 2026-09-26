import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.success === false) {
    const message =
      result.message ||
      (response.status === 403
        ? "You don't have permission to view this."
        : response.status === 401
        ? "Please sign in again."
        : `Request failed (${response.status})`);

    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  return result;
}

export async function getDoctors({
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
  const response = await apiFetch(`/doctors?${params.toString()}`);
  return handleResponse(response);
}

export async function searchDoctors(keyword, { page = 0, size = 50 } = {}) {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  const response = await apiFetch(`/doctors/search?${params.toString()}`);
  return handleResponse(response);
}

export async function getDoctorById(doctorId) {
  const response = await apiFetch(`/doctors/${doctorId}`);
  return handleResponse(response);
}

export async function createDoctor(data) {
  const response = await apiFetch("/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateDoctor(doctorId, data) {
  const response = await apiFetch(`/doctors/${doctorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateDoctorStatus(doctorId, status) {
  const response = await apiFetch(`/doctors/${doctorId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

export async function deleteDoctor(doctorId) {
  const response = await apiFetch(`/doctors/${doctorId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function getDoctorSchedules(doctorId) {
  const response = await apiFetch(`/doctor-schedules/doctor/${doctorId}`);
  return handleResponse(response);
}

export async function createDoctorSchedule(data) {
  const response = await apiFetch("/doctor-schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateDoctorSchedule(scheduleId, data) {
  const response = await apiFetch(`/doctor-schedules/${scheduleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteDoctorSchedule(scheduleId) {
  const response = await apiFetch(`/doctor-schedules/${scheduleId}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function getMyDoctorProfile() {
  const response = await apiFetch("/doctors/me");
  return handleResponse(response);
}

export async function updateMyDoctorProfile(data) {
  const response = await apiFetch("/doctors/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function uploadDoctorProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch("/doctors/me/profile-image", {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}