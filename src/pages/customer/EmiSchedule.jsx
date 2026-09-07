import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  Search,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getMyEmiSchedule } from "../../services/customerService";

const EmiSchedule = () => {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // =========================================================
  // FETCH CUSTOMER EMI SCHEDULE
  // =========================================================

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);

      const response = await getMyEmiSchedule();

      setSchedule(
        Array.isArray(response?.data) ? response.data : []
      );
    } catch (error) {
      console.error("EMI Schedule Error:", error);

      if (error?.response?.status === 401) {
        toast.error("Authentication required. Please login again.");
      } else if (error?.response?.status === 403) {
        toast.error(
          "You don't have permission to view EMI schedule."
        );
      } else {
        toast.error("Failed to load EMI schedule.");
      }

      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toUpperCase()
      .replace(/_/g, " ");
  };

  // =========================================================
  // NORMALIZE EMI DATA + NEXT EMI LOGIC
  // =========================================================

  const normalizedSchedule = useMemo(() => {
    const normalized = schedule.map((emi, index) => ({
      ...emi,

      emiNumber:
        emi?.emiNumber ??
        emi?.emiNo ??
        index + 1,

      dueDate:
        emi?.emiDate ??
        emi?.dueDate ??
        null,

      amount: Number(
        emi?.emiAmount ??
        emi?.amount ??
        0
      ),

      paidAmount: Number(
        emi?.paidAmount ?? 0
      ),

      dueAmount: Number(
        emi?.dueAmount ?? 0
      ),

      loanId:
        emi?.loanId ??
        emi?.loan?.loanId ??
        "-",

      customerName:
        emi?.customerName ??
        emi?.customer?.name ??
        null,

      customerId:
        emi?.customerId ??
        emi?.customer?.customerId ??
        null,

      originalStatus: normalizeStatus(
        emi?.status
      ),
    }));

    // First unpaid EMI becomes NEXT EMI
    const firstUnpaidIndex = normalized.findIndex(
      (emi) =>
        emi.originalStatus !== "PAID" &&
        emi.originalStatus !== "SUCCESS" &&
        Number(emi.paidAmount || 0) <
          Number(emi.amount || 0)
    );

    return normalized.map((emi, index) => {
      const isPaid =
        emi.originalStatus === "PAID" ||
        emi.originalStatus === "SUCCESS" ||
        Number(emi.paidAmount || 0) >=
          Number(emi.amount || 0);

      if (
        !isPaid &&
        index === firstUnpaidIndex
      ) {
        return {
          ...emi,
          status: "NEXT EMI",
        };
      }

      if (isPaid) {
        return {
          ...emi,
          status: "PAID",
        };
      }

      if (emi.originalStatus === "OVERDUE") {
        return {
          ...emi,
          status: "OVERDUE",
        };
      }

      return {
        ...emi,
        status: "UPCOMING",
      };
    });
  }, [schedule]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredSchedule = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return normalizedSchedule;
    }

    return normalizedSchedule.filter((emi) => {
      return (
        String(emi.emiNumber)
          .toLowerCase()
          .includes(value) ||
        String(emi.loanId)
          .toLowerCase()
          .includes(value) ||
        formatDate(emi.dueDate)
          .toLowerCase()
          .includes(value) ||
        String(emi.status)
          .toLowerCase()
          .includes(value)
      );
    });
  }, [normalizedSchedule, search]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalEmiAmount = useMemo(() => {
    return normalizedSchedule.reduce(
      (total, emi) =>
        total + Number(emi.amount || 0),
      0
    );
  }, [normalizedSchedule]);

  const totalPaidAmount = useMemo(() => {
    return normalizedSchedule.reduce(
      (total, emi) =>
        total + Number(emi.paidAmount || 0),
      0
    );
  }, [normalizedSchedule]);

  const totalDueAmount = useMemo(() => {
    return normalizedSchedule.reduce(
      (total, emi) =>
        total + Number(emi.dueAmount || 0),
      0
    );
  }, [normalizedSchedule]);

  const paidCount = useMemo(() => {
    return normalizedSchedule.filter(
      (emi) => emi.status === "PAID"
    ).length;
  }, [normalizedSchedule]);

  // =========================================================
  // NEXT EMI
  // =========================================================

  const nextEmi = useMemo(() => {
    return normalizedSchedule.find(
      (emi) => emi.status === "NEXT EMI"
    );
  }, [normalizedSchedule]);

  const firstEmi = normalizedSchedule[0];

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const StatusBadge = ({ status }) => {
    const normalized = normalizeStatus(status);

    if (normalized === "PAID") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 sm:px-3 sm:text-xs dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          PAID
        </span>
      );
    }

    if (normalized === "NEXT EMI") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 sm:px-3 sm:text-xs dark:bg-amber-950/40 dark:text-amber-300">
          <Clock3 className="h-3.5 w-3.5" />
          NEXT EMI
        </span>
      );
    }

    if (normalized === "OVERDUE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 sm:px-3 sm:text-xs dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5" />
          OVERDUE
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 sm:px-3 sm:text-xs dark:bg-slate-800 dark:text-slate-300">
        <Clock3 className="h-3.5 w-3.5" />
        UPCOMING
      </span>
    );
  };

  // =========================================================
  // PAY NOW
  // =========================================================

  const handlePayNow = (emi) => {
    if (emi?.status !== "NEXT EMI") {
      return;
    }

    navigate("/payments/add");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4 sm:min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading EMI schedule...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY
  // =========================================================

  if (normalizedSchedule.length === 0) {
    return (
      <div className="w-full space-y-5 sm:space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            EMI Schedule
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your loan EMI repayment schedule.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:p-12 dark:border-slate-700 dark:bg-slate-900">
          <XCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />

          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
            No EMI schedule available
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your EMI repayment schedule will appear here once a loan is available.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-11 sm:w-11 dark:bg-blue-950/50">
              <CalendarDays className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                EMI Schedule
              </h1>

              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                Track your paid, upcoming and due EMIs.
              </p>
            </div>
          </div>
        </div>

        {firstEmi?.loanId && (
          <div className="inline-flex w-fit max-w-full items-center gap-2 self-start rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:self-center dark:bg-blue-950/40 dark:text-blue-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

            <span className="truncate">
              Loan {firstEmi.loanId}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          LOAN INFORMATION
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Loan ID */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden shrink-0 rounded-xl bg-blue-50 p-2.5 sm:block dark:bg-blue-950/40">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
                Loan ID
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {firstEmi?.loanId || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            Customer
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {firstEmi?.customerName || "My Loan"}
          </p>

          {firstEmi?.customerId && (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {firstEmi.customerId}
            </p>
          )}
        </div>

        {/* Monthly EMI */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden shrink-0 rounded-xl bg-violet-50 p-2.5 sm:block dark:bg-violet-950/40">
              <IndianRupee className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
                Monthly EMI
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {firstEmi
                  ? formatCurrency(firstEmi.amount)
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Total EMIs */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
            Total EMIs
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900 sm:mt-2 sm:text-2xl dark:text-slate-100">
            {normalizedSchedule.length}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {paidCount} paid
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {/* Total Repayment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Repayment
          </p>

          <p className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
            {formatCurrency(totalEmiAmount)}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Total scheduled EMI amount
          </p>
        </div>

        {/* Paid Amount */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Paid Amount
          </p>

          <p className="mt-2 break-words text-xl font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
            {formatCurrency(totalPaidAmount)}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Amount already paid
          </p>
        </div>

        {/* Due Amount */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Due Amount
          </p>

          <p className="mt-2 break-words text-xl font-bold text-amber-600 sm:text-2xl dark:text-amber-400">
            {formatCurrency(totalDueAmount)}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Remaining EMI amount
          </p>
        </div>
      </div>

      {/* =====================================================
          NEXT EMI HIGHLIGHT
      ===================================================== */}

      {nextEmi && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-xl bg-blue-100 p-2.5 dark:bg-blue-950/70">
                <Clock3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  NEXT PAYMENT
                </p>

                <p className="mt-1 text-base font-bold text-blue-900 dark:text-blue-100">
                  EMI {nextEmi.emiNumber}
                </p>

                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  Due on {formatDate(nextEmi.dueDate)}
                </p>
              </div>
            </div>

            <div className="border-t border-blue-100 pt-3 sm:border-0 sm:pt-0 sm:text-right dark:border-blue-900">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                EMI Amount
              </p>

              <p className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(nextEmi.amount)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search EMI, loan ID, date or status..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-950"
          />
        </div>
      </div>

      {/* =====================================================
          EMI SCHEDULE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Section Header */}
        <div className="border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-700">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                EMI Repayment Schedule
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredSchedule.length} EMI
                {filteredSchedule.length !== 1 ? "s" : ""} displayed
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Paid:{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {paidCount}
              </span>
              {" / "}
              {normalizedSchedule.length}
            </div>
          </div>
        </div>

        {filteredSchedule.length === 0 ? (
          <div className="px-5 py-12 text-center sm:py-14">
            <Search className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              No EMI schedule found
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              No EMI records match your search.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                MOBILE EMI CARDS
            ================================================= */}

            <div className="divide-y divide-slate-100 sm:hidden dark:divide-slate-800">
              {filteredSchedule.map((emi, index) => {
                const isPaid = emi.status === "PAID";
                const isNext = emi.status === "NEXT EMI";
                const isOverdue = emi.status === "OVERDUE";

                return (
                  <div
                    key={
                      emi.id ||
                      emi.emiId ||
                      `${emi.loanId}-${emi.emiNumber}-${index}`
                    }
                    className={`p-4 transition ${
                      isNext
                        ? "bg-amber-50/30 dark:bg-amber-950/10"
                        : isOverdue
                          ? "bg-red-50/30 dark:bg-red-950/10"
                          : ""
                    }`}
                  >
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isNext
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                : isOverdue
                                  ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {emi.emiNumber}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            EMI {emi.emiNumber}
                          </p>

                          {emi.loanId && emi.loanId !== "-" && (
                            <p className="truncate text-xs text-slate-400">
                              {emi.loanId}
                            </p>
                          )}
                        </div>
                      </div>

                      <StatusBadge status={emi.status} />
                    </div>

                    {/* Card Details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Due Date
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                          <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {formatDate(emi.dueDate)}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          EMI Amount
                        </p>

                        <p className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                          {formatCurrency(emi.amount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/20">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/70">
                          Paid Amount
                        </p>

                        <p className="mt-1 truncate text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(emi.paidAmount)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50/70 p-3 dark:bg-amber-950/20">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600/70 dark:text-amber-400/70">
                          Due Amount
                        </p>

                        <p className="mt-1 truncate text-xs font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(emi.dueAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Action */}
                    <button
                      type="button"
                      disabled={!isNext}
                      onClick={() => handlePayNow(emi)}
                      className={`mt-4 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        isNext
                          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] dark:bg-blue-500 dark:hover:bg-blue-600"
                          : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                      }`}
                    >
                      {isNext ? "Pay Now" : isPaid ? "Paid" : "Pay Now"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      EMI No.
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Due Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      EMI Amount
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Paid Amount
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Due Amount
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSchedule.map((emi, index) => {
                    const isPaid = emi.status === "PAID";
                    const isNext = emi.status === "NEXT EMI";
                    const isOverdue = emi.status === "OVERDUE";

                    return (
                      <tr
                        key={
                          emi.id ||
                          emi.emiId ||
                          `${emi.loanId}-${emi.emiNumber}-${index}`
                        }
                        className={`border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                          isNext
                            ? "bg-amber-50/30 dark:bg-amber-950/10"
                            : isOverdue
                              ? "bg-red-50/30 dark:bg-red-950/10"
                              : ""
                        }`}
                      >
                        {/* EMI NUMBER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isPaid
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : isNext
                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                    : isOverdue
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {emi.emiNumber}
                            </div>

                            <div>
                              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                                EMI {emi.emiNumber}
                              </span>

                              {emi.loanId &&
                                emi.loanId !== "-" && (
                                  <span className="text-xs text-slate-400">
                                    {emi.loanId}
                                  </span>
                                )}
                            </div>
                          </div>
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />

                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {formatDate(emi.dueDate)}
                            </span>
                          </div>
                        </td>

                        {/* EMI AMOUNT */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {formatCurrency(emi.amount)}
                          </span>
                        </td>

                        {/* PAID AMOUNT */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(emi.paidAmount)}
                          </span>
                        </td>

                        {/* DUE AMOUNT */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {formatCurrency(emi.dueAmount)}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4 text-center">
                          <StatusBadge status={emi.status} />
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            disabled={!isNext}
                            onClick={() => handlePayNow(emi)}
                            className={`inline-flex min-w-[90px] items-center justify-center rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                              isNext
                                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
                                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                            }`}
                          >
                            Pay Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          IMPORTANT INFO
      ===================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex gap-3">
          <div className="mt-0.5 shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-950/60">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              EMI Schedule
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
              This schedule displays your EMI repayment details,
              including EMI amount, paid amount, due amount,
              payment status and upcoming payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiSchedule;