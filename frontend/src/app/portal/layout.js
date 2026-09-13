"use client";

import { useState } from "react";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { PortalTopbar } from "@/components/portal/portal-topbar";
import { MaintenanceModal } from "@/components/portal/maintenance-modal";
import { MaintenanceTopBar } from "@/components/portal/maintenance-top-bar";
import { DemoNavigator } from "@/components/portal/demo-navigator";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function PortalLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <PortalSidebar />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <PortalSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <MaintenanceTopBar />
        <PortalTopbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>

      <DemoNavigator />
      <MaintenanceModal />
    </div>
  );
}