"use client";

import { AlertTriangle, ServerCrash, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BackendStatusBanner() {
  return (
    <div className="relative z-20 w-full border-b border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Left Side: Icon & Text */}
        <div className="flex items-start gap-3 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
            <ServerCrash className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
              Backend Server Notice
              <span className="hidden sm:inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                Under Maintenance
              </span>
            </h3>
            <p className="mt-1 text-xs text-white/80 sm:text-sm max-w-3xl">
              Our cloud backend is currently undergoing a hosting migration (new
              server setup in progress). Live database features (like search and
              booking) are temporarily paused. However, the **UI, design, and
              application flow are 100% fully explorable**. Thank you for your
              understanding!
            </p>
          </div>
        </div>

        {/* Right Side: Action Button (Optional) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Link
            href="https://github.com/dulal-jgec/medcore-hms"
            target="_blank"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500/20 px-4 py-2 text-xs font-semibold text-yellow-500 transition-colors hover:bg-yellow-500/30 sm:w-auto"
          >
            View Source Code
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
