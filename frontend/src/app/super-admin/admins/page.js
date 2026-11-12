"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  X,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Building2,
  ShieldCheck,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { getAllHospitalAdmins } from "@/services/super-admin.service";

const PAGE_SIZE = 12;

export default function SuperAdminAdminsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // State for the popup/modal
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getAllHospitalAdmins(page, PAGE_SIZE);

        if (cancelled) return;

        const allAdmins = result.data?.items || result.data?.content || [];
        
        // Filter to only show ACTIVE admins
        const activeAdmins = allAdmins.filter(admin => admin.status === "ACTIVE");

        setAdmins(activeAdmins);
        setTotalPages(result.data?.totalPages || 0);
        setTotalElements(result.data?.totalElements || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load admins.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [accessToken, page]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return admins;
    }

    return admins.filter(
      (admin) =>
        admin.fullName?.toLowerCase().includes(q) ||
        admin.email?.toLowerCase().includes(q) ||
        admin.hospitalName?.toLowerCase().includes(q)
    );
  }, [admins, query]);

  const hasFilters = query.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Platform
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Active Hospital admins
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {totalElements} administrators assigned across hospitals
          </p>
        </div>

        <Button asChild>
          <Link href="/super-admin/admins/create">
            <Plus className="mr-1.5 h-4 w-4" />
            Create admin
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or hospital..."
            className="h-11 pl-10"
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => setQuery("")}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <GridSkeleton />
        ) : filtered.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((admin) => (
                <AdminCard
                  key={admin.userId}
                  admin={admin}
                  onClick={() => setSelectedAdmin(admin)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrevious={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              />
            )}
          </>
        ) : (
          <EmptyState
            hasFilters={hasFilters}
            onClear={() => setQuery("")}
          />
        )}
      </div>

      {/* Admin Details Modal Popup */}
      {selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
              <h2 className="text-lg font-semibold tracking-tight">Admin Details</h2>
              <button
                onClick={() => setSelectedAdmin(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-2xl font-bold text-brand-soft-foreground">
                  {selectedAdmin.fullName?.charAt(0) || "A"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedAdmin.fullName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    {selectedAdmin.status}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-muted/10 p-4 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Hash className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">User ID:</span>
                  <span className="font-medium text-foreground">{selectedAdmin.userId}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">Email:</span>
                  <span className="font-medium text-foreground truncate">{selectedAdmin.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">Phone:</span>
                  <span className="font-medium text-foreground">{selectedAdmin.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="w-20 shrink-0">Hospital:</span>
                  <span className="font-medium text-foreground">{selectedAdmin.hospitalName || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/30 px-5 py-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedAdmin(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminCard({ admin, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md hover:bg-muted/10"
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-bold text-brand-soft-foreground">
          {admin.fullName?.charAt(0) || "A"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight">
              {admin.fullName}
            </h3>

            <StatusPill status={admin.status} />
          </div>

          <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {admin.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{admin.email}</span>
              </div>
            )}

            {admin.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="truncate">{admin.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {admin.hospitalName && (
        <div className="mx-5 mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand-soft-foreground">
            {admin.hospitalName.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hospital
            </p>
            <p className="truncate text-xs font-medium">
              {admin.hospitalName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    ACTIVE: "bg-green-500/10 text-green-600 dark:text-green-400",
    INACTIVE: "bg-muted text-muted-foreground",
    DELETED: "bg-destructive/10 text-destructive",
    PENDING_VERIFICATION: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    INVITATION_EXPIRED: "bg-destructive/10 text-destructive",
    BLOCKED: "bg-destructive/10 text-destructive",
  };
  const labelMap = { PENDING_VERIFICATION: "PENDING", INVITATION_EXPIRED: "EXPIRED" };
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", map[status] || map.INACTIVE)}>
      {labelMap[status] || status || "UNKNOWN"}
    </span>
  );
}

function Pagination({ page, totalPages, onPrevious, onNext }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page === 0}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>

      <p className="mt-5 text-base font-semibold">
        {hasFilters ? "No admins found" : "No active admins yet"}
      </p>

      <p className="mt-1.5 text-sm text-muted-foreground">
        {hasFilters
          ? "Try adjusting your search."
          : "There are currently no active hospital administrators."}
      </p>

      {hasFilters && (
        <Button variant="outline" onClick={onClear} className="mt-5">
          Clear search
        </Button>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}