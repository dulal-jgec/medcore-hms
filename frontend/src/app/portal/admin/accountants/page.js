"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Briefcase,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import {
  getAccountants,
  activateAccountant,
  deactivateAccountant,
} from "@/services/accountant.service";

export default function AccountantsPage() {
  const { accessToken } = useAuthStore();

  const [accountants, setAccountants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  async function loadAccountants() {
    try {
      setLoading(true);
      setError("");

      const result = await getAccountants(accessToken);

      setAccountants(result.data || []);
    } catch (error) {
      setError(
        error.message || "Failed to load accountants."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadAccountants();
    }
  }, [accessToken]);

  async function handleStatusChange(accountant) {
    try {
      setActionId(accountant.id);
      setError("");

      if (accountant.status === "ACTIVE") {
        await deactivateAccountant(
          accessToken,
          accountant.id
        );
      } else {
        await activateAccountant(
          accessToken,
          accountant.id
        );
      }

      await loadAccountants();
    } catch (error) {
      setError(
        error.message ||
          "Failed to update accountant status."
      );
    } finally {
      setActionId(null);
    }
  }

  const filteredAccountants = accountants.filter((accountant) => {
    const value = search.toLowerCase();

    return (
      accountant.name?.toLowerCase().includes(value) ||
      accountant.email?.toLowerCase().includes(value) ||
      accountant.designation?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand" />

            <h1 className="text-2xl font-bold tracking-tight">
              Accountants
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage accountants for your hospital.
          </p>
        </div>

        <Button asChild>
          <Link href="/portal/admin/accountants/new">
            <Plus className="mr-2 h-4 w-4" />
            Add accountant
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search accountants..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : filteredAccountants.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />

          <h2 className="mt-3 text-base font-semibold">
            No accountants found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Add an accountant to start managing hospital billing.
          </p>

          <Button asChild className="mt-5">
            <Link href="/portal/admin/accountants/new">
              <Plus className="mr-2 h-4 w-4" />
              Add accountant
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Accountant
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Contact
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Designation
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredAccountants.map((accountant) => (
                  <tr
                    key={accountant.id}
                    className="transition-colors hover:bg-hover/40"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-sm font-semibold text-brand-soft-foreground">
                          {accountant.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {accountant.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            ID #{accountant.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-xs">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {accountant.email}
                        </p>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        {accountant.designation || "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          accountant.status === "ACTIVE"
                            ? "inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-soft-foreground"
                            : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        }
                      >
                        <span
                          className={
                            accountant.status === "ACTIVE"
                              ? "h-1.5 w-1.5 rounded-full bg-brand"
                              : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          }
                        />

                        {accountant.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionId === accountant.id}
                        onClick={() =>
                          handleStatusChange(accountant)
                        }
                      >
                        {actionId === accountant.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : accountant.status === "ACTIVE" ? (
                          <>
                            <UserX className="mr-1.5 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-1.5 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-border md:hidden">
            {filteredAccountants.map((accountant) => (
              <div
                key={accountant.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft font-semibold text-brand-soft-foreground">
                      {accountant.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {accountant.name}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {accountant.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={
                      accountant.status === "ACTIVE"
                        ? "shrink-0 rounded-full bg-brand-soft px-2 py-1 text-[10px] font-medium text-brand-soft-foreground"
                        : "shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
                    }
                  >
                    {accountant.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {accountant.designation || "Accountant"}
                  </p>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionId === accountant.id}
                    onClick={() =>
                      handleStatusChange(accountant)
                    }
                  >
                    {accountant.status === "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}