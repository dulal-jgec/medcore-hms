"use client";

import { useEffect, useState } from "react";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalTopbar } from "@/components/portal/portal-topbar";
import { MaintenanceModal } from "@/components/portal/maintenance-modal";
import { MaintenanceTopBar } from "@/components/portal/maintenance-top-bar";
import { DemoNavigator } from "@/components/portal/demo-navigator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth-store";

export default function PortalLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initializeAuth, initialized]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar — desktop. Fixed height, own scroll. */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="h-full overflow-y-auto">
          <PortalSidebar />
        </div>
      </aside>

      {/* Sidebar — mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <PortalSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main column — only this scrolls */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MaintenanceTopBar />

        <div className="flex-1 overflow-y-auto">
          <PortalTopbar onOpenSidebar={() => setMobileOpen(true)} />
          <main>{children}</main>
        </div>
      </div>

      <DemoNavigator />
      <MaintenanceModal />
    </div>
  );
}