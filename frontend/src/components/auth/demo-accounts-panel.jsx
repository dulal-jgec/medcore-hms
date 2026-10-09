"use client";

import { useState } from "react";
import {
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  HeartPulse,
  Info,
  LogIn,
  Shield,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDemoAccounts, isDemoModeEnabled } from "@/lib/demo-accounts";

const ROLE_ICONS = {
  "Super Admin": Shield,
  "Hospital Admin": Building2,
  Doctor: Stethoscope,
  Nurse: HeartPulse,
  Accountant: Calculator,
  Receptionist: ClipboardList,
};

export function DemoAccountsPanel({ onUseAccount }) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Hide panel entirely if demo mode off
  if (!isDemoModeEnabled()) return null;

  const accounts = getDemoAccounts();

  // Group by `note` (hospital name). Empty note → "Platform"
  const groups = accounts.reduce((acc, item) => {
    const key = item.note || "Platform";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  async function copyToClipboard(text, key) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/30">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
            <Info className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold">Try with demo accounts</p>
            <p className="text-[11px] text-muted-foreground">
              Click any account to auto-fill the form
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="max-h-[420px] space-y-4 overflow-y-auto border-t border-border p-4">
          {Object.entries(groups).map(([groupName, list]) => (
            <AccountGroup
              key={groupName}
              label={groupName}
              accounts={list}
              copiedKey={copiedKey}
              onCopy={copyToClipboard}
              onUse={onUseAccount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AccountGroup({ label, accounts, copiedKey, onCopy, onUse }) {
  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="space-y-1.5">
        {accounts.map((acc, idx) => {
          const Icon = ROLE_ICONS[acc.role] || Shield;
          const key = `${label}-${idx}`;

          return (
            <div
              key={key}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:border-brand/30"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-soft-foreground">
                <Icon className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight">
                  {acc.role}
                </p>
                <p className="truncate text-[11px] leading-tight text-muted-foreground">
                  {acc.email}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onCopy(acc.email, `${key}-email`)}
                  title="Copy email"
                >
                  {copiedKey === `${key}-email` ? (
                    <Check className="h-3.5 w-3.5 text-brand" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-brand hover:bg-brand-soft hover:text-brand-soft-foreground"
                  onClick={() => onUse?.(acc)}
                  title="Fill into form"
                >
                  <LogIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
