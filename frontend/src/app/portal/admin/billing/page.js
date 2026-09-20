"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Wallet,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import { getHospitalBills } from "@/services/billing.service";


const STATUS_TABS = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "PENDING",
    label: "Pending",
  },
  {
    id: "PARTIALLY_PAID",
    label: "Partially Paid",
  },
  {
    id: "PAID",
    label: "Paid",
  },
  {
    id: "CANCELLED",
    label: "Cancelled",
  },
];


export default function AdminBillingPage() {

  const { accessToken } = useAuthStore();

  const [bills, setBills] = useState([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    if (!accessToken) {
      return;
    }

    loadBilling();

  }, [accessToken]);


  async function loadBilling() {

    try {

      setLoading(true);
      setError("");

      const result = await getHospitalBills(
        accessToken,
        0,
        50,
        "billDate",
        "desc"
      );

      setBills(
        result.data?.items || []
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to load billing data."
      );

    } finally {

      setLoading(false);

    }
  }


  const filteredBills = useMemo(() => {

    const q = query
      .toLowerCase()
      .trim();

    return bills.filter((bill) => {

      const patientId =
        String(bill.patientId || "")
          .toLowerCase();

      const billId =
        String(bill.id || "")
          .toLowerCase();

      const billType =
        String(bill.billType || "")
          .toLowerCase();

      const matchesQuery =
        !q ||
        patientId.includes(q) ||
        billId.includes(q) ||
        billType.includes(q);

      const matchesStatus =
        status === "all" ||
        bill.status === status;

      return (
        matchesQuery &&
        matchesStatus
      );
    });

  }, [bills, query, status]);


  const counts = useMemo(() => {

    return {

      all: bills.length,

      PENDING: bills.filter(
        (bill) =>
          bill.status === "PENDING"
      ).length,

      PARTIALLY_PAID: bills.filter(
        (bill) =>
          bill.status === "PARTIALLY_PAID"
      ).length,

      PAID: bills.filter(
        (bill) =>
          bill.status === "PAID"
      ).length,

      CANCELLED: bills.filter(
        (bill) =>
          bill.status === "CANCELLED"
      ).length,

    };

  }, [bills]);


  const statistics = useMemo(() => {

    const activeBills =
      bills.filter(
        (bill) =>
          bill.status !== "CANCELLED"
      );

    const totalBilled =
      activeBills.reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.totalAmount || 0
          ),
        0
      );

    const totalPaid =
      activeBills.reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.paidAmount || 0
          ),
        0
      );

    const totalOutstanding =
      Math.max(
        totalBilled - totalPaid,
        0
      );

    const outstandingBills =
      activeBills.filter(
        (bill) =>
          bill.status === "PENDING" ||
          bill.status === "PARTIALLY_PAID"
      ).length;

    return {
      totalBilled,
      totalPaid,
      totalOutstanding,
      outstandingBills,
      totalBills: activeBills.length,
    };

  }, [bills]);


  const hasFilters =
    query.trim() !== "" ||
    status !== "all";


  function clearFilters() {

    setQuery("");
    setStatus("all");

  }


  if (loading) {

    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">

        <Loader2
          className="h-6 w-6 animate-spin text-brand"
        />

      </div>
    );
  }


  if (error) {

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5">

          <p className="text-sm font-medium text-destructive">
            {error}
          </p>

          <Button
            className="mt-4"
            variant="outline"
            onClick={loadBilling}
          >
            Try again
          </Button>

        </div>

      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Revenue
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Billing & Invoices
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View and manage hospital billing records.
        </p>
      </div>


      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <BillStat
          icon={Wallet}
          label="Total billed"
          value={formatCurrency(
            statistics.totalBilled
          )}
          sub={`${statistics.totalBills} active bills`}
          accent
        />

        <BillStat
          icon={CheckCircle2}
          label="Collected"
          value={formatCurrency(
            statistics.totalPaid
          )}
          sub="Total paid amount"
        />

        <BillStat
          icon={Clock}
          label="Outstanding"
          value={formatCurrency(
            statistics.totalOutstanding
          )}
          sub="Amount remaining"
        />

        <BillStat
          icon={AlertCircle}
          label="Outstanding bills"
          value={statistics.outstandingBills}
          sub="Pending collection"
          alert
        />

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">

        <div className="relative flex-1">

          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search by patient ID, bill ID or bill type..."
            className="h-11 pl-10"
          />

        </div>


        {hasFilters && (

          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-11"
          >
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>

        )}

      </div>


      {/* =====================================================
          STATUS TABS
      ====================================================== */}

      <div className="mt-6 border-b border-border">

        <nav
          className="flex gap-6 overflow-x-auto"
          aria-label="Billing filters"
        >

          {STATUS_TABS.map(
            ({ id, label }) => {

              const isActive =
                status === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setStatus(id)
                  }
                  className={cn(
                    "relative flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors",

                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full",

                    isActive
                      ? "text-foreground after:bg-brand"
                      : "text-muted-foreground after:bg-transparent hover:text-foreground"
                  )}
                >

                  {label}

                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold",

                      isActive
                        ? "bg-brand-soft text-brand-soft-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {counts[id]}
                  </span>

                </button>
              );
            }
          )}

        </nav>

      </div>


      {/* =====================================================
          RESULT COUNT
      ====================================================== */}

      <p className="mt-4 text-xs text-muted-foreground">

        {filteredBills.length} bill
        {filteredBills.length !== 1
          ? "s"
          : ""}{" "}
        found

      </p>


      {/* =====================================================
          BILL LIST
      ====================================================== */}

      <div className="mt-6 space-y-3">

        {filteredBills.length > 0 ? (

          filteredBills.map(
            (bill) => (
              <BillRow
                key={bill.id}
                bill={bill}
              />
            )
          )

        ) : (

          <div className="rounded-2xl border border-dashed border-border py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">

              <Receipt
                className="
                  h-6
                  w-6
                  text-muted-foreground
                "
              />

            </div>

            <p className="mt-5 text-base font-semibold">
              No bills found
            </p>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}


/* ============================================================
   BILL ROW
============================================================ */

function BillRow({ bill }) {

  const isPaid =
    bill.status === "PAID";

  const isPartial =
    bill.status === "PARTIALLY_PAID";

  const isCancelled =
    bill.status === "CANCELLED";


  const totalAmount =
    Number(
      bill.totalAmount || 0
    );

  const paidAmount =
    Number(
      bill.paidAmount || 0
    );

  const dueAmount =
    Math.max(
      totalAmount - paidAmount,
      0
    );


  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm",

        isCancelled
          ? "border-border opacity-70"
          : "border-border hover:border-brand/40"
      )}
    >

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">


        {/* ICON */}

        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",

            isPaid
              ? "bg-brand-soft text-brand-soft-foreground"

              : isPartial
              ? "bg-highlight-soft text-highlight-soft-foreground"

              : isCancelled
              ? "bg-muted text-muted-foreground"

              : "bg-destructive/10 text-destructive"
          )}
        >

          <Receipt className="h-5 w-5" />

        </span>


        {/* INFORMATION */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-base font-semibold tracking-tight">

              Bill #{bill.id}

            </h3>

            <StatusPill
              status={bill.status}
            />

          </div>


          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">

            <span>
              Patient ID:{" "}
              <span className="font-medium text-foreground">
                {bill.patientId}
              </span>
            </span>


            <span className="flex items-center gap-1">

              <Receipt className="h-3 w-3" />

              {formatBillType(
                bill.billType
              )}

            </span>


            {bill.appointmentId && (

              <span>
                Appointment #{bill.appointmentId}
              </span>

            )}

          </div>


          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">

            {bill.billDate && (

              <span className="flex items-center gap-1">

                <CalendarDays className="h-3 w-3" />

                {formatDate(
                  bill.billDate
                )}

              </span>

            )}


            {bill.paymentMethod && (

              <span>

                Payment:{" "}
                {formatPaymentMethod(
                  bill.paymentMethod
                )}

              </span>

            )}


            {bill.paidAt && (

              <span className="text-brand">

                Paid{" "}
                {formatDate(
                  bill.paidAt
                )}

              </span>

            )}

          </div>


          {/* ITEMS */}

          {bill.items?.length > 0 && (

            <div className="mt-3 text-xs text-muted-foreground">

              {bill.items.length} item
              {bill.items.length !== 1
                ? "s"
                : ""}

            </div>

          )}

        </div>


        {/* AMOUNT */}

        <div className="shrink-0 text-right">

          <p className="text-xl font-bold tracking-tight">

            {formatCurrency(
              totalAmount
            )}

          </p>


          <p className="mt-1 text-xs text-muted-foreground">

            Paid{" "}
            {formatCurrency(
              paidAmount
            )}

          </p>


          {!isPaid &&
            !isCancelled && (
              <p className="mt-0.5 text-xs font-medium text-destructive">

                Due{" "}
                {formatCurrency(
                  dueAmount
                )}

              </p>
            )}

        </div>


        {/* ADMIN ACTION */}

        <div className="flex shrink-0 items-center">

          <span className="text-xs text-muted-foreground">
            Billing record
          </span>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   STATUS
============================================================ */

function StatusPill({ status }) {

  const map = {

    PAID: {
      label: "Paid",
      class:
        "bg-brand-soft text-brand-soft-foreground",
    },

    PENDING: {
      label: "Pending",
      class:
        "bg-highlight-soft text-highlight-soft-foreground",
    },

    PARTIALLY_PAID: {
      label: "Partially Paid",
      class:
        "bg-highlight-soft text-highlight-soft-foreground",
    },

    CANCELLED: {
      label: "Cancelled",
      class:
        "bg-muted text-muted-foreground",
    },

  };


  const config =
    map[status] || {
      label: status || "Unknown",
      class:
        "bg-muted text-muted-foreground",
    };


  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.class
      )}
    >
      {config.label}
    </span>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function BillStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  alert,
}) {

  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/30 hover:shadow-sm">

      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",

          alert
            ? "bg-destructive/10 text-destructive"

            : accent
            ? "bg-brand text-brand-foreground"

            : "bg-brand-soft text-brand-soft-foreground"
        )}
      >

        <Icon className="h-5 w-5" />

      </span>


      <p className="mt-4 text-2xl font-bold tracking-tight">

        {value}

      </p>


      <p className="mt-1 text-xs font-medium text-foreground">

        {label}

      </p>


      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">

        {sub}

      </p>

    </div>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(amount) {

  return `₹${Number(
    amount || 0
  ).toLocaleString("en-IN")}`;
}


function formatDate(value) {

  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatBillType(type) {

  if (!type) {
    return "Other";
  }

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}


function formatPaymentMethod(
  method
) {

  if (!method) {
    return "—";
  }

  return method
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}