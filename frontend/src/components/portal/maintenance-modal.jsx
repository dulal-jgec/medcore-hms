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
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl sm:max-h-none sm:rounded-3xl">
        {/* Top warning strip */}
        <div
          className="h-1.5 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #F59E0B 0, #F59E0B 12px, #18181B 12px, #18181B 24px)",
          }}
        />

        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-5 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-4 sm:top-6"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 pb-6 pt-8 text-center sm:px-10 sm:pb-8 sm:pt-10">
          {/* Animated icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <span className="absolute inset-0 animate-ping rounded-full bg-highlight/20" />
            <span
              className="absolute inset-2 animate-pulse rounded-full bg-highlight/10"
              style={{ animationDuration: "2s" }}
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-lg sm:h-20 sm:w-20">
              <AlertTriangle
                className="h-8 w-8 sm:h-10 sm:w-10"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-5 text-xl font-bold tracking-tight sm:mt-6 sm:text-2xl">
            Demo Mode — Final Integration in Progress
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-5 text-muted-foreground sm:text-sm sm:leading-6">
            MedCore HMS is{" "}
            <span className="font-medium text-foreground">
              fully built on both frontend and backend
            </span>
            . We are currently completing the{" "}
            <span className="font-medium text-foreground">
              integration between frontend, backend, and database
            </span>{" "}
            — after which everything goes live.
          </p>

          {/* Status cards */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3">
            <StatusCard
              icon={Code2}
              label="Frontend"
              value="Complete"
              status="done"
            />
            <StatusCard
              icon={Server}
              label="Backend"
              value="Complete"
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
              label="Integration"
              value="In progress"
              status="progress"
            />
          </div>

          {/* Info note */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/40 p-3.5 text-left sm:mt-6 sm:p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-highlight-soft-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              No real patient data is stored. Every action you take here is
              local to your browser session and resets when you close the tab.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-2 sm:mt-7 sm:flex-row sm:justify-center">
            <Button
              onClick={dismiss}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Continue to Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground sm:mt-5">
            You can continue exploring the demos after this.
          </p>
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
          ? "rounded-xl border border-brand/30 bg-brand-soft/40 p-2.5 text-center sm:p-3"
          : "rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/30 p-2.5 text-center sm:p-3"
      }
    >
      <Icon
        className={
          isDone
            ? "mx-auto h-4 w-4 text-brand"
            : "mx-auto h-4 w-4 text-highlight-soft-foreground"
        }
      />
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:mt-2">
        {label}
      </p>
      <p
        className={
          isDone
            ? "mt-0.5 text-[11px] font-semibold text-brand sm:text-xs"
            : "mt-0.5 text-[11px] font-semibold text-highlight-soft-foreground sm:text-xs"
        }
      >
        {value}
      </p>
    </div>
  );
}