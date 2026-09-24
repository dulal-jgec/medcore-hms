import { create } from "zustand";

import {
  login as loginApi,
  refreshToken as refreshTokenApi,
  getCurrentUser,
  logout as logoutApi,
} from "@/services/auth.service";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,

  isAuthenticated: false,
  isLoading: true,
  initialized: false,

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