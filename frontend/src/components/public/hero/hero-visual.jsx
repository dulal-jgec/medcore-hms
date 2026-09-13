import Image from "next/image";
import { TrendingUp } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-sm px-4 sm:max-w-md sm:px-0 lg:max-w-lg">
      {/* Soft brand block */}
      <div
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-3xl bg-brand-soft"
      />

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src="/images/hero-doctor.jpg"
          alt="Doctor using MedCore hospital management system"
          fill
          priority
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 40vw"
          className="object-cover"
        />
      </div>

      {/* Floating stat card — smaller on mobile, positioned safely */}
      <div className="absolute -bottom-4 -left-2 w-44 rounded-xl border border-border bg-card p-3 shadow-lg sm:-bottom-5 sm:-left-5 sm:w-52 sm:p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">
            Active Hospitals
          </p>
          <span className="flex items-center gap-1 rounded-full bg-highlight-soft px-1.5 py-0.5 text-[10px] font-semibold text-highlight-soft-foreground sm:px-2">
            <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            +12.5%
          </span>
        </div>
        <p className="mt-1 text-lg font-bold tracking-tight sm:text-2xl">
          500+
        </p>
        <div className="mt-2 flex items-end gap-1 sm:mt-3">
          {[30, 45, 38, 60, 52, 75, 68].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-sm bg-brand/20"
              style={{ height: `${h * 0.25}px` }}
            >
              <div
                className="w-full rounded-sm bg-brand"
                style={{ height: `${h * 0.12}px` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[8px] text-muted-foreground sm:text-[10px]">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
        </div>
      </div>
    </div>
  );
}