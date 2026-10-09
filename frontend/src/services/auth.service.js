import { apiFetch } from "@/lib/api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

async function handleResponse(response) {
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.success === false) {
    const err = new Error(
      result.message || `Request failed (${response.status})`
    );
    err.status = response.status;
    throw err;
  }

  return result;
}

export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function register(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function getCurrentUser() {
  const response = await apiFetch("/auth/me");
  return handleResponse(response);
}

/* ─────────────────────────────────────────────────────────────
   SINGLE-FLIGHT REFRESH
   Both `initializeAuth()` (store) and `performRefresh()`
   (api-client) now funnel through this one promise, so the
   backend only ever sees ONE /auth/refresh call at a time.
   ───────────────────────────────────────────────────────────── */
let _refreshSingleFlight = null;

export async function refreshToken() {
  if (_refreshSingleFlight) return _refreshSingleFlight;

  _refreshSingleFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return await handleResponse(response);
    } finally {
      _refreshSingleFlight = null;
    }
  })();

  return _refreshSingleFlight;
}

export async function logout() {
  const response = await apiFetch("/auth/logout", { method: "POST" });
  return handleResponse(response);
}