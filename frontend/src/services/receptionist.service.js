import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1";

function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

function getHeaders() {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

async function handleResponse(response) {
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        "Something went wrong. Please try again."
    );
  }

  return result;
}

export async function createReceptionist(data) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

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

  const response = await fetch(
    `${API_BASE_URL}/receptionists?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function getReceptionistById(receptionistId) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/${receptionistId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function updateReceptionist(
  receptionistId,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/${receptionistId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function deleteReceptionist(receptionistId) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/${receptionistId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function activateReceptionist(receptionistId) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/${receptionistId}/activate`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function deactivateReceptionist(receptionistId) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/${receptionistId}/deactivate`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function getMyReceptionistProfile() {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/me`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function updateMyReceptionistProfile(data) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/me`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function uploadMyReceptionistProfileImage(file) {
  const token = getAccessToken();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/receptionists/me/profile-image`,
    {
      method: "POST",
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: formData,
    }
  );

  return handleResponse(response);
}

export async function getTodayAppointments({
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

  const response = await fetch(
    `${API_BASE_URL}/receptionists/appointments/today?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function searchPatients({
  keyword,
  page = 0,
  size = 10,
}) {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_BASE_URL}/receptionists/patients/search?${params.toString()}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}

export async function registerPatient(data) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/patients`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function checkInPatient(appointmentId) {
  const response = await fetch(
    `${API_BASE_URL}/receptionists/appointments/${appointmentId}/check-in`,
    {
      method: "PATCH",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
}