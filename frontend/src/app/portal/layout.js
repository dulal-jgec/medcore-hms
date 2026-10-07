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
                <p className="text-sm text-muted-foreground">
                    Checking access...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (user.role !== "HOSPITAL_ADMIN") {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/20">
            ...
        </div>
    );
}