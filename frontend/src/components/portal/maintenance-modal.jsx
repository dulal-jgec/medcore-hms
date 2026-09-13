"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Server,
  Database,
  X,
  Code2,
  Plug,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "medcore-modal-dismissed";

export function MaintenanceModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const val = sessionStorage.getItem(STORAGE_KEY);
    if (val !== "true") {
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  }

  if (!mounted || !open) return null;

  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal — compact on mobile */}
      <div className="relative max-h-[88vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {/* Warning strip */}
        <div
          className="h-1 w-full sm:h-1.5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F59E0B 0, #F59E0B 12px, #18181B 12px, #18181B 24px)",
          }}
        />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2.5 top-3 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-4 sm:top-5 sm:p-1.5"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>

        <div className="px-4 pb-4 pt-6 text-center sm:px-10 sm:pb-8 sm:pt-10">
          {/* Animated icon — smaller on mobile */}
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center sm:h-24 sm:w-24">
            <span className="absolute inset-0 animate-ping rounded-full bg-highlight/20" />
            <span
              className="absolute inset-1 animate-pulse rounded-full bg-highlight/10 sm:inset-2"
              style={{ animationDuration: "2s" }}
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-lg sm:h-20 sm:w-20">
              <AlertTriangle
                className="h-6 w-6 sm:h-10 sm:w-10"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-3 text-base font-bold leading-tight tracking-tight sm:mt-6 sm:text-2xl">
            Demo Mode — Integration in Progress
          </h2>

          {/* Description — shorter on mobile */}
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-6">
            MedCore is{" "}
            <span className="font-medium text-foreground">
              fully built on frontend &amp; backend
            </span>
            . Integration with the database is in progress.
          </p>

          {/* Status cards — 4 columns always on mobile, tighter */}
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-6 sm:gap-3">
            <StatusCard
              icon={Code2}
              label="Frontend"
              value="Done"
              status="done"
            />
            <StatusCard
              icon={Server}
              label="Backend"
              value="Done"
              status="done"
            />
            <StatusCard
              icon={Database}
              label="Database"
              value="Ready"
              status="done"
            />
            <StatusCard
              icon={Plug}
              label="Integrate"
              value="WIP"
              status="progress"
            />
          </div>

          {/* Info note — compact */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-highlight-soft-foreground/20 bg-highlight-soft/40 p-2.5 text-left sm:mt-6 sm:gap-3 sm:rounded-xl sm:p-4">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-highlight-soft-foreground sm:h-4 sm:w-4" />
            <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
              No real patient data. Sample data only for demonstration.
            </p>
          </div>

          {/* CTAs — stack on mobile */}
          <div className="mt-4 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:justify-center">
            <Button
              onClick={dismiss}
              size="sm"
              className="w-full sm:h-11 sm:w-auto sm:px-6"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
              Continue to Demo
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:ml-2 sm:h-4 sm:w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full sm:h-11 sm:w-auto sm:px-6"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, status }) {
  const isDone = status === "done";

  return (
    <div
      className={
        isDone
          ? "rounded-lg border border-brand/30 bg-brand-soft/40 p-1.5 text-center sm:rounded-xl sm:p-3"
          : "rounded-lg border border-highlight-soft-foreground/20 bg-highlight-soft/30 p-1.5 text-center sm:rounded-xl sm:p-3"
      }
    >
      <Icon
        className={
          isDone
            ? "mx-auto h-3 w-3 text-brand sm:h-4 sm:w-4"
            : "mx-auto h-3 w-3 text-highlight-soft-foreground sm:h-4 sm:w-4"
        }
      />
      <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground sm:mt-2 sm:text-[10px]">
        {label}
      </p>
      <p
        className={
          isDone
            ? "text-[9px] font-semibold text-brand sm:text-xs"
            : "text-[9px] font-semibold text-highlight-soft-foreground sm:text-xs"
        }
      >
        {value}
      </p>
    </div>
  );
}