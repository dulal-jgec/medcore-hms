import { apiFetch } from "@/lib/api-client";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

 

export async function createPatient(data) {
  const response = await apiFetch("/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getPatients({
  page = 0,
  size = 10,
  sortBy = "id",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await apiFetch(
    `/patients?${params.toString()}`
  );

  return handleResponse(response);
}

export async function getPatientById(patientId) {
  const response = await apiFetch(
    `/patients/${patientId}`
  );

  return handleResponse(response);
}

export async function updatePatient(patientId, data) {
  const response = await apiFetch(
    `/patients/${patientId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function updatePatientStatus(
  patientId,
  status
) {
  const response = await apiFetch(
    `/patients/${patientId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  return handleResponse(response);
}

 

export async function createMyPatientProfile(data) {
  const response = await apiFetch("/patients/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getMyPatientProfile() {
  const response = await apiFetch("/patients/me");

  return handleResponse(response);
}

export async function updateMyPatientProfile(data) {
  const response = await apiFetch("/patients/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}