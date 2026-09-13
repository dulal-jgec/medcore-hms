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

  // Skip auth flows
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
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
          className="absolute right-4 top-6 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-8 pt-10 text-center sm:px-10">
          {/* Animated icon */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-highlight/20" />
            <span
              className="absolute inset-2 animate-pulse rounded-full bg-highlight/10"
              style={{ animationDuration: "2s" }}
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-highlight text-highlight-foreground shadow-lg">
              <AlertTriangle className="h-10 w-10" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Demo Mode — Final Integration in Progress
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
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

          {/* Status cards — 4 tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/40 p-4 text-left">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-highlight-soft-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              No real patient data is stored. Every action you take here is
              local to your browser session and resets when you close the tab.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={dismiss} size="lg" className="w-full sm:w-auto">
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

          <p className="mt-5 text-[11px] text-muted-foreground">
            You can continue exploring the demos after this.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════ Sub-component ══════════ */

function StatusCard({ icon: Icon, label, value, status }) {
  const isDone = status === "done";

  return (
    <div
      className={
        isDone
          ? "rounded-xl border border-brand/30 bg-brand-soft/40 p-3 text-center"
          : "rounded-xl border border-highlight-soft-foreground/20 bg-highlight-soft/30 p-3 text-center"
      }
    >
      <Icon
        className={
          isDone
            ? "mx-auto h-4 w-4 text-brand"
            : "mx-auto h-4 w-4 text-highlight-soft-foreground"
        }
      />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          isDone
            ? "mt-0.5 text-xs font-semibold text-brand"
            : "mt-0.5 text-xs font-semibold text-highlight-soft-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}