"use client";

import { useState } from "react";
import {
  ChevronDown,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDemoAccounts, isDemoModeEnabled } from "@/lib/demo-accounts";

export function DemoAccountsPanel({ onUseAccount }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState(null);

  if (!isDemoModeEnabled()) return null;

  const accounts = getDemoAccounts();

  function toggleReveal(email) {
    setRevealed((p) => ({ ...p, [email]: !p[email] }));
  }

  async function copy(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-brand/30 bg-brand-soft/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-soft-foreground">
              Demo accounts
            </p>
            <p className="text-[11px] text-muted-foreground">
              Try every role without signing up
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-brand/20 bg-background/60">
          <ul className="divide-y divide-border">
            {accounts.map((a) => {
              const isRevealed = revealed[a.email];
              const isCopied = copied === a.email;

              return (
                <li key={a.email} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                      {a.role}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onUseAccount(a)}
                      className="h-8"
                    >
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                      Use
                    </Button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-muted-foreground">
                        Email
                      </span>
                      <span className="truncate font-mono text-foreground">
                        {a.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => copy(a.email, `${a.email}-email`)}
                        className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Copy email"
                      >
                        {copied === `${a.email}-email` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-muted-foreground">
                        Password
                      </span>
                      <span className="truncate font-mono text-foreground">
                        {isRevealed ? a.password : "••••••••••"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleReveal(a.email)}
                        className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={isRevealed ? "Hide password" : "Show password"}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(a.password, `${a.email}-pw`)}
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Copy password"
                      >
                        {copied === `${a.email}-pw` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {a.note && (
                      <p className="pl-[72px] text-[11px] text-muted-foreground">
                        {a.note}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="border-t border-border bg-muted/30 px-4 py-2.5 text-[11px] text-muted-foreground">
            Demo credentials are public. Do not store real patient data in
            these accounts.
          </p>
        </div>
      )}
    </div>
  );
}