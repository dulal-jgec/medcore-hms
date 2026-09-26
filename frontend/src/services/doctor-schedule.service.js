// services/doctor-schedule.service.js

import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getDoctorSchedules(doctorId) {
  const response = await apiFetch(
    `/doctor-schedules/doctor/${doctorId}`
  );
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