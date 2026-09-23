const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export async function getPublicDoctors(
  hospitalId,
  {
    page = 0,
    size = 20,
    sortBy = "id",
    sortDir = "asc",
  } = {}
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${API_BASE_URL}/public/hospitals/${encodeURIComponent(
      hospitalId
    )}/doctors?${params.toString()}`,
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

export async function getPublicDoctor(
  hospitalId,
  doctorId
) {
  const response = await fetch(
    `${API_BASE_URL}/public/hospitals/${encodeURIComponent(
      hospitalId
    )}/doctors/${encodeURIComponent(doctorId)}`,
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