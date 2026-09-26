import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

let refreshPromise = null;

function buildHeaders(extra) {
  const headers = { ...(extra || {}) };
  const token = useAuthStore.getState().accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function performRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      console.log("[auth] refreshing token...");

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      console.log("[auth] refresh status:", response.status);

      if (!response.ok) {
        console.warn("[auth] refresh failed");
        return null;
      }

      const data = await response.json();
      const newToken = data?.data?.accessToken;

      if (!newToken) {
        console.warn("[auth] refresh 200 but no accessToken:", data);
        return null;
      }

      console.log("[auth] refresh OK, new token set");

      useAuthStore.setState({
        accessToken: newToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return newToken;
    } catch (err) {
      console.error("[auth] refresh threw:", err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function forceLogout() {
  useAuthStore.setState({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (!path.startsWith("/login") && !path.startsWith("/register")) {
      window.location.href = "/login";
    }
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const isAuthEndpoint = /\/auth\/(refresh|login|register)/.test(path);

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers),
    credentials: "include",
  });

  if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
    const newToken = await performRefresh();

    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: buildHeaders(options.headers),
        credentials: "include",
      });
    } else {
      forceLogout();
    }
  }

  return response;
}