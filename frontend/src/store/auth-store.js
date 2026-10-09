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

  // Internal flags
  _initializing: false,
  _refreshPromise: null,

  setAccessToken: (accessToken) => set({ accessToken }),

  refreshAccessToken: async () => {
    if (get()._refreshPromise) return get()._refreshPromise;

    const promise = (async () => {
      try {
        const result = await refreshTokenApi();
        const accessToken = result.data.accessToken;
        set({ accessToken });
        return accessToken;
      } catch {
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
      _initializing: false,
    });

    return userResult.data;
  },

  initializeAuth: async () => {
    // ── Block duplicate / racing init calls ──
    if (get()._initializing || get().initialized) return;
    set({ _initializing: true });

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
        _initializing: false,
      });
    } catch {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
        _initializing: false,
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