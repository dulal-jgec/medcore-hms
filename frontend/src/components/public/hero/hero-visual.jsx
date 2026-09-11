import Image from "next/image";
import { TrendingUp } from "lucide-react";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
      {/* Soft brand-colored block behind the image */}
      <div
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-3xl bg-brand-soft"
      />

      {/* Real image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image
          src="/images/hero-doctor.jpg"
          alt="Doctor using MedCore hospital management system"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="object-cover"
        />
      </div>

      {/* Floating stat card */}
      <div className="absolute -bottom-5 -left-5 w-52 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Active Hospitals
          </p>
          <span className="flex items-center gap-1 rounded-full bg-highlight-soft px-2 py-0.5 text-xs font-semibold text-highlight-soft-foreground">
            <TrendingUp className="h-3 w-3" />
            +12.5%
          </span>
        </div>
        <p className="mt-1 text-2xl font-bold tracking-tight">500+</p>
        <div className="mt-3 flex items-end gap-1">
          {[30, 45, 38, 60, 52, 75, 68].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-sm bg-brand/20"
              style={{ height: `${h * 0.35}px` }}
            >
              <div
                className="w-full rounded-sm bg-brand"
                style={{ height: `${h * 0.15}px` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
          <span>May</span><span>Jun</span><span>Jul</span>
        </div>
      </div>
    </div>
  );
}