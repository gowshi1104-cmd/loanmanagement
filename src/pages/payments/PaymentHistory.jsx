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
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
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
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment History
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View all your payment transactions
          </p>

          {loanId && (
            <p className="text-xs text-slate-400 mt-1">
              Loan: {loanId}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <SummaryCard
          label="Total Payments"
          value={summary.total}
          icon={
            <Receipt size={21} />
          }
          iconClass="bg-blue-100 text-blue-600"
        />

        <SummaryCard
          label="Successful"
          value={summary.successful}
          icon={
            <CheckCircle2 size={21} />
          }
          iconClass="bg-green-100 text-green-600"
          valueClass="text-green-600"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          icon={
            <Clock3 size={21} />
          }
          iconClass="bg-yellow-100 text-yellow-600"
          valueClass="text-yellow-600"
        />

        <SummaryCard
          label="Collected Amount"
          value={formatAmount(
            summary.successfulAmount
          )}
          icon={
            <Banknote size={21} />
          }
          iconClass="bg-purple-100 text-purple-600"
          valueClass="text-xl"
        />

      </div>

      {/* FILTERS */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* SEARCH */}

          <div className="xl:col-span-2">

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* STATUS */}

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
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

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Mode
            </label>

            <select
              value={modeFilter}
              onChange={(e) =>
                setModeFilter(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
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

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Date
            </label>

            <div className="relative">

              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* CLEAR */}

          <div className="flex items-end">

            <button
              type="button"
              onClick={clearFilters}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50"
            >
              Clear Filters
            </button>

          </div>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200">

          <h2 className="font-semibold text-slate-900">
            My Payments
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredPayments.length} of{" "}
            {payments.length} payments
          </p>

        </div>

        {loading ? (

          <div className="flex items-center justify-center py-16">

            <Loader2
              size={28}
              className="animate-spin text-blue-600"
            />

          </div>

        ) : filteredPayments.length === 0 ? (

          <div className="py-16 text-center">

            <Receipt
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-700">
              No payments found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Your successful payments will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    #
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Payment ID
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Loan ID
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    EMI
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Amount
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Payment Mode
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Payment Date
                  </th>

                  <th className="text-left px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-right px-5 py-3 font-semibold text-slate-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

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
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-900">
                          {payment?.paymentId ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 font-medium text-blue-700">
                          {payment?.loanId ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {payment?.emiNumber
                            ? `EMI #${payment.emiNumber}`
                            : "-"}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatAmount(
                            payment?.amount
                          )}
                        </td>

                        <td className="px-5 py-4">

                          <div className="inline-flex items-center gap-2 text-slate-700">

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

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(
                            payment?.paymentDate
                          )}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
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

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayment(
                                payment
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
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

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Payment Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
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
                className="text-slate-400 hover:text-slate-700 text-2xl"
              >
                ×
              </button>

            </div>

            <div className="p-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

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

                <div>

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
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

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(
                    null
                  )
                }
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`text-2xl font-bold text-slate-900 mt-1 ${valueClass}`}
          >
            {value}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
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
    <div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="font-medium text-slate-900 mt-1 break-words">
        {value || "-"}
      </p>

    </div>
  );
};

export default PaymentHistory;