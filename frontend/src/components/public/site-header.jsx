"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/for-hospitals", label: "For Hospitals" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-lg">
            M
          </div>
          <span className="text-xl font-bold tracking-tight">
            Med<span className="text-brand">Core</span>
          </span>
        </Link>

        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-brand"
                    : "text-muted-foreground hover:bg-hover hover:text-hover-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop: plain Links styled as buttons */}
          <Link
            href="/contact"
            className={cn(
              buttonVariants(),
              "hidden sm:inline-flex bg-brand text-brand-foreground hover:bg-brand/90",
            )}
          >
            Contact Us
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden sm:inline-flex hover:bg-hover hover:text-hover-foreground",
            )}
          >
            Sign In
          </Link>

          {/* Mobile menu — SheetTrigger styled directly */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-hover-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-md px-3 py-2 text-sm font-medium hover:bg-hover hover:text-hover-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                <div className="mt-4 flex flex-col gap-2">
                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full hover:bg-hover hover:text-hover-foreground",
                      )}
                    >
                      Sign In
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href="/contact"
                      className={cn(
                        buttonVariants(),
                        "w-full bg-brand text-brand-foreground hover:bg-brand/90",
                      )}
                    >
                      Contact Us
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
