const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

// ======================================================
// ADMIN APIs
// ======================================================

export async function getDoctors(
  accessToken,
  { page = 0, size = 100, sortBy = "id", sortDir = "asc" } = {}
) {
  const params = new URLSearchParams({
    page,
    size,
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${API_BASE_URL}/doctors?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function searchDoctors(
  accessToken,
  keyword,
  { page = 0, size = 100 } = {}
) {
  const params = new URLSearchParams({
    keyword,
    page,
    size,
  });

  const response = await fetch(
    `${API_BASE_URL}/doctors/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getDoctorById(accessToken, doctorId) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/${doctorId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createDoctor(accessToken, data) {
  const response = await fetch(`${API_BASE_URL}/doctors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updateDoctor(accessToken, doctorId, data) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/${doctorId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function updateDoctorStatus(
  accessToken,
  doctorId,
  status
) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/${doctorId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    }
  );

  return handleResponse(response);
}

export async function deleteDoctor(accessToken, doctorId) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/${doctorId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// ======================================================
// DOCTOR SCHEDULE APIs - HOSPITAL ADMIN
// ======================================================

export async function getDoctorSchedules(
  accessToken,
  doctorId
) {
  const response = await fetch(
    `${API_BASE_URL}/doctor-schedules/doctor/${doctorId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createDoctorSchedule(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/doctor-schedules`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function updateDoctorSchedule(
  accessToken,
  scheduleId,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/doctor-schedules/${scheduleId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function deleteDoctorSchedule(
  accessToken,
  scheduleId
) {
  const response = await fetch(
    `${API_BASE_URL}/doctor-schedules/${scheduleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// ======================================================
// DOCTOR SELF PROFILE APIs
// ======================================================

export async function getMyDoctorProfile(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function updateMyDoctorProfile(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/doctors/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function uploadDoctorProfileImage(
  accessToken,
  file
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/doctors/me/profile-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: formData,
    }
  );

  return handleResponse(response);
}