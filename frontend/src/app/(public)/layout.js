import { TopBar } from "@/components/public/top-bar";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { MaintenanceModal } from "@/components/portal/maintenance-modal";
import { DemoNavigator } from "@/components/portal/demo-navigator";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <DemoNavigator />
      <MaintenanceModal />
    </div>
  );
}