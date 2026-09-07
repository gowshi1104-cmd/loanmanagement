import { useEffect, useState } from "react";

import {
  CreditCard,
  Search,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getMyPaymentHistory } from "../../services/customerService";

const MyPaymentHistory = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD CUSTOMER PAYMENT HISTORY
  // =========================================================

  const loadPayments = async () => {
    try {
      setLoading(true);

      const response = await getMyPaymentHistory();

      console.log("========== CUSTOMER PAYMENT HISTORY ==========");
      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response?.data);

      // Backend response
      const rawData = response?.data ?? response;

      console.log("RAW DATA:", rawData);

      let loanHistories = [];

      // -----------------------------------------------------
      // CASE 1:
      // Backend returns one loan history object
      // -----------------------------------------------------

      if (
        rawData &&
        !Array.isArray(rawData) &&
        typeof rawData === "object"
      ) {
        loanHistories = [rawData];
      }

      // -----------------------------------------------------
      // CASE 2:
      // Backend returns array of loan histories
      // -----------------------------------------------------

      else if (Array.isArray(rawData)) {
        loanHistories = rawData;
      }

      console.log("LOAN HISTORIES:", loanHistories);

      // =====================================================
      // FLATTEN paidPayments
      // =====================================================

      const flattenedPayments = [];

      loanHistories.forEach((loanHistory) => {
        if (!loanHistory) {
          return;
        }

        const paidPayments = Array.isArray(loanHistory.paidPayments)
          ? loanHistory.paidPayments
          : [];

        console.log("LOAN:", loanHistory.loanId);
        console.log("PAID PAYMENTS:", paidPayments);

        paidPayments.forEach((payment, index) => {
          if (!payment) {
            return;
          }

          flattenedPayments.push({
            // ===============================================
            // PAYMENT DATA FROM BACKEND
            // ===============================================

            id:
              payment.paymentId ??
              payment.id ??
              `${loanHistory.loanId}-${index}`,

            paymentId: payment.paymentId ?? payment.id,

            emiNumber: payment.emiNumber,

            loanId: loanHistory.loanId ?? payment.loanId,

            amount: payment.amount ?? 0,

            paymentMode: payment.paymentMode,

            paymentDate:
              payment.paymentDate ?? payment.createdAt,

            status: payment.status,

            // Backend gives transactionReference
            // NOT transactionId
            transactionReference:
              payment.transactionReference,

            receiptNumber: payment.receiptNumber,

            verificationStatus:
              payment.verificationStatus,

            // ===============================================
            // CUSTOMER / LOAN DATA
            // ===============================================

            customerId: loanHistory.customerId,

            customerName: loanHistory.customerName,

            phone: loanHistory.phone,

            loanAmount: loanHistory.loanAmount,

            emiAmount: loanHistory.emiAmount,

            tenureMonths: loanHistory.tenureMonths,

            loanStatus: loanHistory.loanStatus,
          });
        });
      });

      console.log(
        "========== FLATTENED PAYMENTS =========="
      );
      console.log(flattenedPayments);

      setPayments(flattenedPayments);
      setFilteredPayments(flattenedPayments);
    } catch (error) {
      console.error("Payment History Error:", error);

      console.error(
        "Backend Error Response:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to load payment history"
      );

      setPayments([]);
      setFilteredPayments([]);
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
  // SEARCH
  // =========================================================

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter((payment) => {
      const paymentId = String(
        payment?.paymentId || ""
      ).toLowerCase();

      const loanId = String(
        payment?.loanId || ""
      ).toLowerCase();

      // Backend field = transactionReference
      const transactionReference = String(
        payment?.transactionReference || ""
      ).toLowerCase();

      const receiptNumber = String(
        payment?.receiptNumber || ""
      ).toLowerCase();

      const customerName = String(
        payment?.customerName || ""
      ).toLowerCase();

      const memberId = String(
        payment?.customerId || ""
      ).toLowerCase();

      return (
        paymentId.includes(value) ||
        loanId.includes(value) ||
        transactionReference.includes(value) ||
        receiptNumber.includes(value) ||
        customerName.includes(value) ||
        memberId.includes(value)
      );
    });

    setFilteredPayments(filtered);
  }, [search, payments]);

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";

      case "FAILED":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "SUCCESS":
        return <CheckCircle2 size={14} />;

      case "PENDING":
        return <Clock3 size={14} />;

      case "FAILED":
        return <XCircle size={14} />;

      default:
        return null;
    }
  };

  // =========================================================
  // SUMMARY VALUES
  // =========================================================

  const successfulPayments = payments.filter(
    (payment) =>
      String(payment?.status || "").toUpperCase() ===
      "SUCCESS"
  ).length;

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment?.amount || 0),
    0
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        <Loader2
          size={30}
          className="animate-spin text-blue-600 dark:text-blue-400 mb-3"
        />

        <p className="text-sm sm:text-base">
          Loading payment history...
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full w-full min-w-0 space-y-4 sm:space-y-5 lg:space-y-6 bg-slate-50 dark:bg-slate-950">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 sm:h-11 sm:w-11">
            <CreditCard
              size={24}
              className="text-blue-600 dark:text-blue-400 sm:size-7"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              Payment History
            </h1>

            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              View all your payment transactions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">

        {/* Total Payments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Payments
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
            {payments.length}
          </p>
        </div>

        {/* Successful Payments */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Successful Payments
          </p>

          <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400 sm:text-2xl">
            {successfulPayments}
          </p>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Paid
          </p>

          <p className="mt-1 truncate text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl">
            ₹{formatAmount(totalPaid)}
          </p>
        </div>
      </div>

      {/* =====================================================
          PAYMENT TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

        {/* SEARCH */}
        <div className="border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="text"
              placeholder="Search Payment ID, Loan ID or Transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {filteredPayments.length === 0 ? (
          <div className="px-4 py-14 text-center text-slate-500 dark:text-slate-400 sm:py-16">
            <CreditCard
              size={40}
              className="mx-auto mb-3 text-slate-300 dark:text-slate-600"
            />

            <p className="font-medium">
              No payment records found.
            </p>

            {payments.length === 0 && (
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-500">
                No successful payments are available for your account.
              </p>
            )}
          </div>
        ) : (
          /* =================================================
             RESPONSIVE TABLE
          ================================================== */
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[950px]">

              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Payment ID
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Loan ID
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    EMI
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Amount
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Payment Mode
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Payment Date
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 sm:px-6 sm:py-4 sm:text-sm">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment, index) => {
                  const status = String(
                    payment?.status || ""
                  ).toUpperCase();

                  const paymentId =
                    payment?.paymentId ||
                    payment?.id;

                  return (
                    <tr
                      key={paymentId || index}
                      className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {/* PAYMENT ID */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900 dark:text-slate-100 sm:px-6">
                        {paymentId || "-"}
                      </td>

                      {/* LOAN ID */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm sm:px-6">
                        <span className="font-medium text-blue-700 dark:text-blue-400">
                          {payment?.loanId || "-"}
                        </span>
                      </td>

                      {/* EMI */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-300 sm:px-6">
                        {payment?.emiNumber
                          ? `EMI #${payment.emiNumber}`
                          : "-"}
                      </td>

                      {/* AMOUNT */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 sm:px-6">
                        ₹{formatAmount(payment?.amount)}
                      </td>

                      {/* PAYMENT MODE */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-300 sm:px-6">
                        {payment?.paymentMode || "-"}
                      </td>

                      {/* PAYMENT DATE */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-300 sm:px-6">
                        {formatDate(payment?.paymentDate)}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}

                          {status || "UNKNOWN"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-4 sm:px-6">
                        {paymentId && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/payments/${paymentId}`
                              )
                            }
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile table hint */}
      {filteredPayments.length > 0 && (
        <p className="text-center text-xs text-slate-400 sm:hidden">
          Swipe left or right to view all payment details
        </p>
      )}
    </div>
  );
};

export default MyPaymentHistory;