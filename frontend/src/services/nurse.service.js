const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

// =====================================================
// HOSPITAL ADMIN APIs
// =====================================================

export async function getNurses(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/nurses`,
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

export async function getNurseById(accessToken, nurseId) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/${nurseId}`,
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

export async function createNurse(accessToken, data) {
  const response = await fetch(
    `${API_BASE_URL}/nurses`,
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

export async function updateNurse(
  accessToken,
  nurseId,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/${nurseId}`,
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

export async function deleteNurse(
  accessToken,
  nurseId
) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/${nurseId}`,
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

export async function activateNurse(
  accessToken,
  nurseId
) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/${nurseId}/activate`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function deactivateNurse(
  accessToken,
  nurseId
) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/${nurseId}/deactivate`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  return handleResponse(response);
}

// =====================================================
// NURSE SELF PROFILE APIs
// =====================================================

export async function getMyNurseProfile(accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/me`,
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

export async function updateMyNurseProfile(
  accessToken,
  data
) {
  const response = await fetch(
    `${API_BASE_URL}/nurses/me`,
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

export async function uploadNurseProfileImage(
  accessToken,
  file
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/nurses/me/profile-image`,
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