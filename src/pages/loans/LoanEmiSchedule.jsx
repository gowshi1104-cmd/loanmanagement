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
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../../services/api";

const EMISchedule = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState([]);

  // =========================================================
  // FETCH LOAN
  // Backend:
  // GET /api/loans/{id}
  // =========================================================

  useEffect(() => {
    const fetchLoan = async () => {
      if (!id) {
        toast.error("Loan ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await api.get(`/loans/${id}`);

        setLoan(response.data);

        try {
          const paymentResponse = await api.get(
            `/payments/loan/${response.data.loanId}`
          );

          setPayments(
            Array.isArray(paymentResponse.data)
              ? paymentResponse.data
              : []
          );
        } catch (paymentError) {
          console.error(
            "Failed to fetch loan payments:",
            paymentError
          );

          setPayments([]);
        }
      } catch (error) {
        console.error("Failed to fetch loan:", error);

        if (error?.response?.status === 401) {
          toast.error(
            "Authentication required. Please login again."
          );
        } else if (error?.response?.status === 403) {
          const message =
            error?.response?.data ||
            "You don't have permission to view this loan";

          toast.error(
            typeof message === "string"
              ? message
              : "You don't have permission to view this loan"
          );
        } else if (error?.response?.status === 404) {
          toast.error("Loan not found");
        } else {
          toast.error("Failed to load loan details");
        }

        setLoan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // NORMALIZE STATUS
  // =========================================================

  const normalizeStatus = (status) => {
    if (!status) return "";

    return String(status)
      .trim()
      .toUpperCase();
  };

  // =========================================================
  // SAFE MONTH DATE
  //
  // Matches Java LocalDate.plusMonths() behaviour.
  //
  // Example:
  // 31 Aug 2026 + 2 months = 30 Nov 2026
  //
  // JavaScript Date normally overflows 31 Nov into December,
  // so we calculate the last valid day of the target month.
  // =========================================================

  const getSafeMonthDate = (
    dateValue,
    monthsToAdd
  ) => {
    if (!dateValue) {
      return null;
    }

    const dateString = String(dateValue)
      .trim()
      .substring(0, 10);

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const targetMonthIndex =
      month - 1 + monthsToAdd;

    const targetYear =
      year +
      Math.floor(
        targetMonthIndex / 12
      );

    const targetMonth =
      ((targetMonthIndex % 12) + 12) % 12;

    // Last valid day of target month

    const lastDayOfTargetMonth =
      new Date(
        targetYear,
        targetMonth + 1,
        0
      ).getDate();

    const safeDay = Math.min(
      day,
      lastDayOfTargetMonth
    );

    return new Date(
      targetYear,
      targetMonth,
      safeDay
    );
  };

  // =========================================================
  // EMI CALCULATION
  //
  // First EMI:
  // loanDate + 2 months
  //
  // This matches backend LoanService logic.
  // =========================================================

  const emiSchedule = useMemo(() => {
    if (!loan) {
      return [];
    }

    const tenure = Number(
      loan.tenureMonths || 0
    );

    if (tenure <= 0) {
      return [];
    }

    const emiAmount = Number(
      loan.emiAmount || 0
    );

    // ---------------------------------------------------------
    // FIRST EMI DATE
    //
    // Backend:
    // loanDate.plusMonths(2)
    // ---------------------------------------------------------

    const startDate = getSafeMonthDate(
      loan.loanDate,
      2
    );

    if (!startDate) {
      return [];
    }

    // ---------------------------------------------------------
    // SUCCESSFUL PAYMENT DATES
    // ---------------------------------------------------------

    const successfulPaymentDates =
      new Set(
        payments
          .filter(
            (payment) =>
              payment &&
              String(
                payment.status || ""
              )
                .trim()
                .toUpperCase() ===
                "SUCCESS" &&
              payment.paymentDate
          )
          .map((payment) =>
            String(payment.paymentDate)
              .trim()
              .substring(0, 10)
          )
      );

    const schedule = [];

    for (let i = 0; i < tenure; i++) {
      // -------------------------------------------------------
      // IMPORTANT:
      // Use safe month calculation instead of JS Date.setMonth()
      //
      // Example:
      // 31 Aug + 2 months = 30 Nov
      // 30 Nov + 1 month = 30 Dec
      // 31 Jan + 1 month = 28 Feb
      // -------------------------------------------------------

      const emiDate =
        getSafeMonthDate(
          loan.loanDate,
          2 + i
        );

      if (!emiDate) {
        continue;
      }

      const year =
        emiDate.getFullYear();

      const month = String(
        emiDate.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        emiDate.getDate()
      ).padStart(2, "0");

      const emiDateString =
        `${year}-${month}-${day}`;

      const isPaid =
        successfulPaymentDates.has(
          emiDateString
        );

      schedule.push({
        emiNumber: i + 1,
        dueDate: emiDate,
        dueDateString:
          emiDateString,
        amount: emiAmount,
        status: isPaid
          ? "PAID"
          : "UPCOMING",
      });
    }

    // ---------------------------------------------------------
    // NEXT UNPAID EMI
    // ---------------------------------------------------------

    const firstUnpaidIndex =
      schedule.findIndex(
        (emi) =>
          emi.status !== "PAID"
      );

    // ---------------------------------------------------------
    // MARK FIRST UNPAID EMI AS NEXT EMI
    // ---------------------------------------------------------

    if (firstUnpaidIndex !== -1) {
      schedule[firstUnpaidIndex] = {
        ...schedule[firstUnpaidIndex],
        status: "NEXT EMI",
      };
    }

    return schedule;
  }, [loan, payments]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredSchedule = useMemo(() => {
    if (!search.trim()) {
      return emiSchedule;
    }

    const value = search
      .trim()
      .toLowerCase();

    return emiSchedule.filter(
      (emi) => {
        return (
          String(emi.emiNumber)
            .toLowerCase()
            .includes(value) ||
          formatDate(emi.dueDate)
            .toLowerCase()
            .includes(value) ||
          String(emi.status)
            .toLowerCase()
            .includes(value)
        );
      }
    );
  }, [emiSchedule, search]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalEmiAmount = useMemo(() => {
    return emiSchedule.reduce(
      (total, emi) =>
        total + Number(emi.amount || 0),
      0
    );
  }, [emiSchedule]);

  const nextEmi =
    emiSchedule.length
      ? emiSchedule[0]
      : null;

  const loanStatus =
    normalizeStatus(loan?.status);

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

  if (!loan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-10">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />

        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Loan not found
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Unable to load the requested loan details.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

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

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Loan EMI Schedule
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            EMI repayment schedule for loan{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {loan.loanId || "-"}
            </span>
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            loanStatus === "APPROVED"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : loanStatus === "ACTIVE"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : loanStatus === "OVERDUE"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : loanStatus === "CLOSED" ||
                      loanStatus === "COMPLETED"
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    : loanStatus === "REJECTED"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {loanStatus || "UNKNOWN"}
        </div>

      </div>

      {/* =====================================================
          LOAN INFORMATION
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Loan ID */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/40">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Loan ID
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {loan.loanId || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Customer
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {loan.customerName || "-"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
              {loan.customerId || "-"}
            </p>
          </div>
        </div>

        {/* Loan Amount */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40">
              <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Loan Amount
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {formatCurrency(
                  loan.loanAmount
                )}
              </p>
            </div>
          </div>
        </div>

        {/* EMI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-2.5 dark:bg-violet-950/40">
              <IndianRupee className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                Monthly EMI
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                {formatCurrency(
                  loan.emiAmount
                )}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">

        {/* Total Tenure */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-xs font-medium text-slate-400">
            Total Tenure
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {loan.tenureMonths || 0}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Months
          </p>
        </div>

        {/* Total Repayment */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-xs font-medium text-slate-400">
            Total Repayment
          </p>

          <p className="mt-2 break-words text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            {formatCurrency(
              totalEmiAmount
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Based on current EMI
          </p>
        </div>

        {/* Next EMI */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-xs font-medium text-slate-400">
            Next EMI Date
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            {loan.nextEmiDate
              ? formatDate(
                  loan.nextEmiDate
                )
              : nextEmi
                ? formatDate(
                    nextEmi.dueDate
                  )
                : "-"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Next scheduled payment
          </p>
        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search EMI number, date or status..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:ring-blue-950"
          />
        </div>

      </div>

      {/* =====================================================
          EMI TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-5">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                EMI Repayment Schedule
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {filteredSchedule.length} EMI
                {filteredSchedule.length !== 1
                  ? "s"
                  : ""}{" "}
                displayed
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Interest Rate:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {loan.interestRate ?? 2.0}%
              </span>{" "}
              / month
            </div>

          </div>

        </div>

        {filteredSchedule.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-6 sm:py-14">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              No EMI schedule found
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              No EMI records match your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-5">
                    EMI No.
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-5">
                    Due Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-5">
                    EMI Amount
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-5">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>
                {filteredSchedule.map(
                  (emi, index) => {
                    const isPaid =
                      emi.status === "PAID";

                    const isNext =
                      emi.status === "NEXT EMI";

                    const isFirst =
                      index === 0;

                    return (
                      <tr
                        key={emi.emiNumber}
                        className={`border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${
                          isFirst
                            ? "bg-blue-50/30 dark:bg-blue-950/20"
                            : ""
                        }`}
                      >

                        {/* EMI NUMBER */}

                        <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {emi.emiNumber}
                            </div>

                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              EMI {emi.emiNumber}
                            </span>

                          </div>
                        </td>

                        {/* DUE DATE */}

                        <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                          <div className="flex items-center gap-2">

                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {formatDate(
                                emi.dueDate
                              )}
                            </span>

                          </div>
                        </td>

                        {/* EMI AMOUNT */}

                        <td className="whitespace-nowrap px-4 py-4 text-right sm:px-5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {formatCurrency(
                              emi.amount
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">

                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              PAID
                            </span>
                          ) : isNext ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                              <Clock3 className="h-3.5 w-3.5" />
                              NEXT EMI
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <Clock3 className="h-3.5 w-3.5" />
                              UPCOMING
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* =====================================================
          IMPORTANT INFO
      ===================================================== */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:p-5">

        <div className="flex items-start gap-3">

          <div className="mt-0.5 shrink-0 rounded-lg bg-blue-100 p-2 dark:bg-blue-950/60">
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              EMI Schedule
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
              This schedule is generated from the loan
              details received from the backend, including
              loan amount, tenure, interest rate, EMI amount
              and next EMI date.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default EMISchedule;