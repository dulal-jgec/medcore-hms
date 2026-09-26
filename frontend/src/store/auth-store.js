import { create } from "zustand";

import {
  login as loginApi,
  refreshToken as refreshTokenApi,
  getCurrentUser,
  logout as logoutApi,
} from "@/services/auth.service";

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  user: null,

  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  // Used by apiFetch to silently swap in a new token
  setAccessToken: (accessToken) => set({ accessToken }),

  // Used by apiFetch on 401. Returns the new token or null.
  // Single-flight: if two requests 401 at once, only one refresh fires.
  refreshAccessToken: async () => {
    if (get()._refreshPromise) {
      return get()._refreshPromise;
    }

    const promise = (async () => {
      try {
        const result = await refreshTokenApi();
        const accessToken = result.data.accessToken;

        set({ accessToken });
        return accessToken;
      } catch {
        // Refresh token itself expired → hard logout
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
        return null;
      } finally {
        set({ _refreshPromise: null });
      }
    })();

    set({ _refreshPromise: promise });
    return promise;
  },

  login: async (credentials) => {
    const result = await loginApi(credentials);
    const accessToken = result.data.accessToken;

    set({ accessToken });

    const userResult = await getCurrentUser();

    set({
      user: userResult.data,
      isAuthenticated: true,
      isLoading: false,
      initialized: true,
    });

    return userResult.data;
  },

  initializeAuth: async () => {
    try {
      const result = await refreshTokenApi();
      const accessToken = result.data.accessToken;

      set({ accessToken });

      const userResult = await getCurrentUser();

      set({
        user: userResult.data,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      });
    } catch {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      });
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));