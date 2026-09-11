"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";

export function AuthProvider({ children }) {
  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return children;
}