"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Plug } from "lucide-react";

const STORAGE_KEY = "medcore-topbar-dismissed";

export function MaintenanceTopBar() {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const val = sessionStorage.getItem(STORAGE_KEY);
    setDismissed(val === "true");
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  if (!mounted || dismissed) return null;

  return (
    <div className="relative overflow-hidden border-b border-destructive/40 bg-destructive text-destructive-foreground">
      {/* Animated stripe pattern */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0, rgba(255,255,255,0.35) 8px, transparent 8px, transparent 16px)",
        }}
      />

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Pulsing alert icon */}
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive-foreground/30" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-destructive-foreground/15">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider">
            Demo Mode — Backend Integration in Progress
          </p>
          <p className="mt-0.5 hidden text-[11px] text-destructive-foreground/85 sm:block">
            Frontend & backend are fully built. Database integration is being
            completed. All data shown is sample data.
          </p>
          <p className="mt-0.5 text-[11px] text-destructive-foreground/85 sm:hidden">
            Integration in progress · Sample data only
          </p>
        </div>

        {/* Status pill */}
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-destructive-foreground/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline-flex">
          <Plug className="h-3 w-3" />
          Integration
        </span>

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-destructive-foreground/20"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}