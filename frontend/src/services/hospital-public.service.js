const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/**
 * Get all public hospitals.
 */
export async function getPublicHospitals({
  page = 0,
  size = 20,
  sortBy = "name",
  sortDir = "asc",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${API_BASE_URL}/public/hospitals?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  return handleResponse(response);
}

/**
 * Get one public hospital by id.
 */
export async function getPublicHospital(id) {
  const response = await fetch(
    `${API_BASE_URL}/public/hospitals/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  return handleResponse(response);
}