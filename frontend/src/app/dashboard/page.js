"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";

export default function DashboardPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          MedCore Dashboard
        </h1>

        {user && (
          <p className="mt-2 text-muted-foreground">
            Welcome, {user.fullName}
          </p>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Logout
        </button>
      </div>
    </main>
  );
}