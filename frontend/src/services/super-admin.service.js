const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Something went wrong"
    );
  }

  return result;
}

export async function getDashboard(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/super-admin/dashboard`,
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

export async function getAllHospitals(
  accessToken,
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc"
) {
  const response = await fetch(
    `${API_BASE_URL}/super-admin/hospitals?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
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

export async function createHospital(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/super-admin/hospitals`,
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

export async function getAllHospitalAdmins(
  accessToken,
  page = 0,
  size = 10
) {
  const response = await fetch(
    `${API_BASE_URL}/super-admin/admins?page=${page}&size=${size}`,
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

export async function createHospitalAdmin(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/super-admin/admins`,
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