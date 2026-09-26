"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export default function AuthProvider({ children }) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  return children;
}
