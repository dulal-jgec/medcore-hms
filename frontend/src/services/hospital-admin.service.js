const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getHospitalProfile(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/profile`,
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

export async function updateHospitalProfile(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/profile`,
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

export async function uploadHospitalLogo(
  accessToken,
  file
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/hospital/profile/logo`,
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

export async function uploadHospitalBanner(
  accessToken,
  file
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/hospital/profile/banner`,
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