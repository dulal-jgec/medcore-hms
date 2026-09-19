const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

export async function getDepartments(
  accessToken,
  { page = 0, size = 10, sortBy = "id", sortDir = "asc" } = {}
) {
  const params = new URLSearchParams({
    page,
    size,
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${API_BASE_URL}/departments?${params.toString()}`,
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

export async function createDepartment(accessToken, data) {
  const response = await fetch(
    `${API_BASE_URL}/departments`,
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

export async function searchDepartments(
  accessToken,
  keyword,
  { page = 0, size = 10 } = {}
) {
  const params = new URLSearchParams({
    keyword,
    page,
    size,
  });

  const response = await fetch(
    `${API_BASE_URL}/departments/search?${params.toString()}`,
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