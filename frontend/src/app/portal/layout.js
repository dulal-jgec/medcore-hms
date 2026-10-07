"use client";

import { useEffect, useState } from "react";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalTopbar } from "@/components/portal/portal-topbar";
import { DemoNavigator } from "@/components/portal/demo-navigator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth-store";

export default function PortalLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initializeAuth, initialized]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:shrink-0">
        <PortalSidebar />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <PortalSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <DemoNavigator />
    </div>
  );
}