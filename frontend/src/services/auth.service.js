const API_BASE_URL = "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
}

// =========================
// LOGIN
// =========================

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
}

// =========================
// REGISTER
// =========================

export async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

// =========================
// CURRENT USER
// =========================

export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  return handleResponse(response);
}

// =========================
// REFRESH TOKEN
// =========================

export async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(response);
}

// =========================
// LOGOUT
// =========================

export async function logout(accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  return handleResponse(response);
}