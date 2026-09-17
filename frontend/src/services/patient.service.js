const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getMyProfile(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/patients/me`,
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

export async function createMyProfile(accessToken, data) {
  const response = await fetch(
    `${API_BASE_URL}/patients/me`,
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

export async function updateMyProfile(accessToken, data) {
  const response = await fetch(
    `${API_BASE_URL}/patients/me`,
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