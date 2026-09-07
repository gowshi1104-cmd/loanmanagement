import { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock3,
  CreditCard,
  Banknote,
  Smartphone,
  CalendarDays,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

import { getPaymentHistory } from "../../services/paymentService";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loanId, setLoanId] = useState("");

  // =========================================================
  // FIND CUSTOMER LOAN ID
  // =========================================================
  const findLoanId = () => {
    const possibleKeys = [
      "loanId",
      "currentLoanId",
      "customerLoanId",
      "selectedLoanId",
      "activeLoanId",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (value && String(value).trim()) {
        return String(value).trim().toUpperCase();
      }
    }

    // ---------------------------------------------------------
    // CHECK COMMON USER OBJECTS
    // ---------------------------------------------------------
    const possibleUserKeys = [
      "user",
      "currentUser",
      "authUser",
      "loggedInUser",
      "userData",
      "customer",
      "profile",
    ];

    for (const key of possibleUserKeys) {
      const storedValue = localStorage.getItem(key);

      if (!storedValue) {
        continue;
      }

      try {
        const parsed = JSON.parse(storedValue);

        const possibleLoanId =
          parsed?.loanId ||
          parsed?.loan?.loanId ||
          parsed?.activeLoanId ||
          parsed?.currentLoanId;

        if (
          possibleLoanId &&
          String(possibleLoanId).trim()
        ) {
          return String(possibleLoanId)
            .trim()
            .toUpperCase();
        }

        // -----------------------------------------------------
        // USER MAY HAVE MULTIPLE LOANS
        // -----------------------------------------------------
        if (
          Array.isArray(parsed?.loans) &&
          parsed.loans.length > 0
        ) {
          const firstLoan =
            parsed.loans.find(
              (loan) =>
                loan?.loanId ||
                loan?.id
            );

          if (firstLoan) {
            const id =
              firstLoan.loanId ||
              firstLoan.id;

            if (id) {
              return String(id)
                .trim()
                .toUpperCase();
            }
          }
        }
      } catch (error) {
        console.warn(
          `Unable to parse localStorage key: ${key}`
        );
      }
    }

    return "";
  };

  // =========================================================
  // LOAD CUSTOMER PAYMENT HISTORY
  // =========================================================
  const loadPayments = async () => {
    try {
      setLoading(true);

      const currentLoanId =
        findLoanId();

      console.log(
        "CUSTOMER PAYMENT HISTORY - LOAN ID:",
        currentLoanId
      );

      if (!currentLoanId) {
        console.error(
          "Customer loan ID not found in localStorage"
        );

        setPayments([]);

        toast.error(
          "Customer loan ID not found"
        );

        return;
      }

      setLoanId(currentLoanId);

      // =====================================================
      // IMPORTANT
      //
      // Backend:
      // GET /api/payment-history/{loanId}
      //
      // Example:
      // GET /api/payment-history/LOAN7264
      //
      // Response is ONE OBJECT
      // NOT ARRAY
      // =====================================================

      const response =
        await getPaymentHistory(
          currentLoanId
        );

      console.log(
        "CUSTOMER PAYMENT HISTORY RESPONSE:",
        response
      );

      // =====================================================
      // RESPONSE OBJECT
      // =====================================================

      const history =
        response?.data &&
        !Array.isArray(response.data)
          ? response.data
          : response;

      console.log(
        "CUSTOMER PAYMENT HISTORY OBJECT:",
        history
      );

      if (
        !history ||
        typeof history !== "object"
      ) {
        setPayments([]);
        return;
      }

      // =====================================================
      // paidPayments[]
      // =====================================================

      const paidPayments =
        Array.isArray(
          history.paidPayments
        )
          ? history.paidPayments
          : [];

      console.log(
        "PAID PAYMENTS:",
        paidPayments
      );

      // =====================================================
      // FLATTEN BACKEND RESPONSE
      // =====================================================

      const flattenedPayments =
        paidPayments.map(
          (payment, index) => ({
            id:
              payment?.paymentId ??
              `${history.loanId}-${index}`,

            paymentId:
              payment?.paymentId ?? null,

            emiNumber:
              payment?.emiNumber ?? null,

            loanId:
              history?.loanId ?? currentLoanId,

            memberId:
              history?.customerId ?? null,

            customerName:
              history?.customerName ?? null,

            phone:
              history?.phone ?? null,

            amount:
              payment?.amount ?? 0,

            paymentMode:
              payment?.paymentMode ?? null,

            paymentDate:
              payment?.paymentDate ?? null,

            status:
              payment?.status ?? null,

            transactionReference:
              payment?.transactionReference ?? null,

            receiptNumber:
              payment?.receiptNumber ?? null,

            verificationStatus:
              payment?.verificationStatus ?? null,

            receivedBy:
              payment?.receivedBy ?? null,

            bankName:
              payment?.bankName ?? null,

            loanAmount:
              history?.loanAmount ?? 0,

            emiAmount:
              history?.emiAmount ?? 0,

            interestRate:
              history?.interestRate ?? 0,

            tenureMonths:
              history?.tenureMonths ?? 0,

            loanDate:
              history?.loanDate ?? null,

            loanStatus:
              history?.loanStatus ?? null,
          })
        );

      console.log(
        "FINAL FRONTEND PAYMENT ROWS:",
        flattenedPayments
      );

      setPayments(
        flattenedPayments
      );
    } catch (error) {
      console.error(
        "Customer payment history error:",
        error
      );

      console.error(
        "Response:",
        error?.response
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to load payment history"
      );

      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    loadPayments();
  }, []);

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================
  const formatAmount = (amount) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount || 0)
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const value =
      String(date).substring(0, 10);

    const parsedDate =
      new Date(`${value}T00:00:00`);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // NORMALIZE PAYMENT MODE
  // =========================================================
  const normalizeMode = (mode) => {
    if (!mode) {
      return "-";
    }

    const normalized =
      String(mode).toUpperCase();

    if (
      normalized ===
        "BANK_TRANSFER" ||
      normalized ===
        "BANK TRANSFER"
    ) {
      return "BANK TRANSFER";
    }

    return normalized;
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================
  const getStatusClass = (status) => {
    switch (
      String(status || "")
        .toUpperCase()
    ) {
      case "SUCCESS":
        return "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300";

      case "FAILED":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-300";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =========================================================
  // MODE ICON
  // =========================================================
  const getModeIcon = (mode) => {
    const normalized =
      String(mode || "")
        .toUpperCase();

    if (
      normalized === "CASH"
    ) {
      return (
        <Banknote size={16} />
      );
    }

    if (
      normalized === "UPI"
    ) {
      return (
        <Smartphone size={16} />
      );
    }

    if (
      normalized ===
        "BANK_TRANSFER" ||
      normalized ===
        "BANK TRANSFER"
    ) {
      return (
        <CreditCard size={16} />
      );
    }

    return (
      <CreditCard size={16} />
    );
  };

  // =========================================================
  // STATUS ICON
  // =========================================================
  const getStatusIcon = (status) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    if (
      normalized === "SUCCESS"
    ) {
      return (
        <CheckCircle2 size={15} />
      );
    }

    if (
      normalized === "FAILED"
    ) {
      return (
        <XCircle size={15} />
      );
    }

    if (
      normalized === "PENDING"
    ) {
      return (
        <Clock3 size={15} />
      );
    }

    return null;
  };

  // =========================================================
  // FILTER
  // =========================================================
  const filteredPayments =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const paymentId =
            String(
              payment?.paymentId ||
                payment?.id ||
                ""
            ).toLowerCase();

          const loanId =
            String(
              payment?.loanId || ""
            ).toLowerCase();

          const memberId =
            String(
              payment?.memberId || ""
            ).toLowerCase();

          const customerName =
            String(
              payment?.customerName ||
                ""
            ).toLowerCase();

          const transactionReference =
            String(
              payment?.transactionReference ||
                ""
            ).toLowerCase();

          const receiptNumber =
            String(
              payment?.receiptNumber ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !searchValue ||
            paymentId.includes(
              searchValue
            ) ||
            loanId.includes(
              searchValue
            ) ||
            memberId.includes(
              searchValue
            ) ||
            customerName.includes(
              searchValue
            ) ||
            transactionReference.includes(
              searchValue
            ) ||
            receiptNumber.includes(
              searchValue
            );

          const paymentStatus =
            String(
              payment?.status || ""
            ).toUpperCase();

          const matchesStatus =
            statusFilter === "ALL" ||
            paymentStatus ===
              statusFilter;

          const paymentMode =
            String(
              payment?.paymentMode ||
                ""
            ).toUpperCase();

          const matchesMode =
            modeFilter === "ALL" ||
            paymentMode ===
              modeFilter;

          const paymentDate =
            payment?.paymentDate
              ? String(
                  payment.paymentDate
                ).substring(0, 10)
              : "";

          const matchesDate =
            !dateFilter ||
            paymentDate ===
              dateFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMode &&
            matchesDate
          );
        }
      );
    }, [
      payments,
      search,
      statusFilter,
      modeFilter,
      dateFilter,
    ]);

  // =========================================================
  // SUMMARY
  // =========================================================
  const summary =
    useMemo(() => {
      const successful =
        payments.filter(
          (payment) =>
            String(
              payment?.status || ""
            ).toUpperCase() ===
            "SUCCESS"
        );

      const pending =
        payments.filter(
          (payment) =>
            String(
              payment?.status || ""
            ).toUpperCase() ===
            "PENDING"
        );

      const failed =
        payments.filter(
          (payment) =>
            String(
              payment?.status || ""
            ).toUpperCase() ===
            "FAILED"
        );

      const successfulAmount =
        successful.reduce(
          (total, payment) =>
            total +
            Number(
              payment?.amount || 0
            ),
          0
        );

      return {
        total:
          payments.length,
        successful:
          successful.length,
        pending:
          pending.length,
        failed:
          failed.length,
        successfulAmount,
      };
    }, [payments]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setModeFilter("ALL");
    setDateFilter("");
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Payment History
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View all your payment transactions
          </p>

          {loanId && (
            <p className="mt-1 break-all text-xs text-slate-400 dark:text-slate-500">
              Loan: {loanId}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          Refresh
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Payments"
          value={summary.total}
          icon={
            <Receipt size={21} />
          }
          iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />

        <SummaryCard
          label="Successful"
          value={summary.successful}
          icon={
            <CheckCircle2 size={21} />
          }
          iconClass="bg-green-100 text-green-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          valueClass="text-green-600 dark:text-emerald-400"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          icon={
            <Clock3 size={21} />
          }
          iconClass="bg-yellow-100 text-yellow-600 dark:bg-amber-950/40 dark:text-amber-400"
          valueClass="text-yellow-600 dark:text-amber-400"
        />

        <SummaryCard
          label="Collected Amount"
          value={formatAmount(
            summary.successfulAmount
          )}
          icon={
            <Banknote size={21} />
          }
          iconClass="bg-purple-100 text-purple-600 dark:bg-violet-950/40 dark:text-violet-400"
          valueClass="text-xl"
        />
      </div>

      {/* FILTERS */}
      <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* SEARCH */}
          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Search
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search payment ID, loan ID, transaction..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 outline-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="SUCCESS">
                Success
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="FAILED">
                Failed
              </option>
            </select>
          </div>

          {/* MODE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Payment Mode
            </label>

            <select
              value={modeFilter}
              onChange={(e) =>
                setModeFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">
                All Modes
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="CASH">
                Cash
              </option>

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Payment Date
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          </div>

          {/* CLEAR */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            My Payments
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredPayments.length} of{" "}
            {payments.length} payments
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={28}
              className="animate-spin text-blue-600 dark:text-blue-400"
            />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Receipt
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your successful payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    #
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Payment ID
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Loan ID
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    EMI
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Amount
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Payment Mode
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Payment Date
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map(
                  (payment, index) => {
                    const status =
                      String(
                        payment?.status || ""
                      ).toUpperCase();

                    return (
                      <tr
                        key={
                          payment?.paymentId ||
                          payment?.id ||
                          `${payment?.loanId}-${index}`
                        }
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {payment?.paymentId ||
                            "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-blue-700 dark:text-blue-400">
                          {payment?.loanId ||
                            "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-700 dark:text-slate-300">
                          {payment?.emiNumber
                            ? `EMI #${payment.emiNumber}`
                            : "-"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 dark:text-slate-100">
                          {formatAmount(
                            payment?.amount
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            {getModeIcon(
                              payment?.paymentMode
                            )}

                            <span>
                              {normalizeMode(
                                payment?.paymentMode
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-400">
                          {formatDate(
                            payment?.paymentDate
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              status
                            )}`}
                          >
                            {getStatusIcon(
                              status
                            )}

                            {status ||
                              "UNKNOWN"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayment(
                                payment
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Eye size={16} />
                            View
                          </button>
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

      {/* PAYMENT DETAILS MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-3 py-4 sm:px-4">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                  Payment Details
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                  Payment #
                  {selectedPayment.paymentId ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="shrink-0 text-2xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              >
                ×
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Detail
                  label="Payment ID"
                  value={
                    selectedPayment.paymentId
                  }
                />

                <Detail
                  label="Loan ID"
                  value={
                    selectedPayment.loanId
                  }
                />

                <Detail
                  label="EMI Number"
                  value={
                    selectedPayment.emiNumber
                      ? `EMI #${selectedPayment.emiNumber}`
                      : null
                  }
                />

                <Detail
                  label="Customer Name"
                  value={
                    selectedPayment.customerName
                  }
                />

                <Detail
                  label="Member ID"
                  value={
                    selectedPayment.memberId
                  }
                />

                <Detail
                  label="Phone"
                  value={
                    selectedPayment.phone
                  }
                />

                <Detail
                  label="Amount"
                  value={formatAmount(
                    selectedPayment.amount
                  )}
                />

                <Detail
                  label="Payment Mode"
                  value={normalizeMode(
                    selectedPayment.paymentMode
                  )}
                />

                <Detail
                  label="Payment Date"
                  value={formatDate(
                    selectedPayment.paymentDate
                  )}
                />

                <Detail
                  label="Transaction Reference"
                  value={
                    selectedPayment.transactionReference
                  }
                />

                <Detail
                  label="Receipt Number"
                  value={
                    selectedPayment.receiptNumber
                  }
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      selectedPayment.status
                    )}`}
                  >
                    {getStatusIcon(
                      selectedPayment.status
                    )}

                    {selectedPayment.status ||
                      "UNKNOWN"}
                  </span>
                </div>

                {selectedPayment.verificationStatus && (
                  <Detail
                    label="Verification"
                    value={
                      selectedPayment.verificationStatus
                    }
                  />
                )}

                {selectedPayment.receivedBy && (
                  <Detail
                    label="Received By"
                    value={
                      selectedPayment.receivedBy
                    }
                  />
                )}

                {selectedPayment.bankName && (
                  <Detail
                    label="Bank Name"
                    value={
                      selectedPayment.bankName
                    }
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================
// SUMMARY CARD
// =========================================================

const SummaryCard = ({
  label,
  value,
  icon,
  iconClass,
  valueClass = "",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-2xl font-bold text-slate-900 dark:text-slate-100 ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// DETAIL
// =========================================================

const Detail = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-slate-900 dark:text-slate-100">
        {value || "-"}
      </p>
    </div>
  );
};

export default PaymentHistory;