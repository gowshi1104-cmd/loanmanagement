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

import {
  getMyPaymentHistory,
} from "../../services/customerService";

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

      console.log(
        "========== CUSTOMER PAYMENT HISTORY =========="
      );

      console.log("FULL RESPONSE:", response);
      console.log("RESPONSE DATA:", response?.data);

      // =====================================================
      // BACKEND RESPONSE
      //
      // {
      //   customerId,
      //   customerName,
      //   phone,
      //   loanId,
      //   loanAmount,
      //   emiAmount,
      //   tenureMonths,
      //   paidEmis,
      //   remainingEmis,
      //   paidPayments: [],
      //   upcomingPayments: []
      // }
      // =====================================================

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

      console.log(
        "LOAN HISTORIES:",
        loanHistories
      );

      // =====================================================
      // FLATTEN paidPayments
      // =====================================================

      const flattenedPayments = [];

      loanHistories.forEach((loanHistory) => {
        if (!loanHistory) {
          return;
        }

        const paidPayments =
          Array.isArray(
            loanHistory.paidPayments
          )
            ? loanHistory.paidPayments
            : [];

        console.log(
          "LOAN:",
          loanHistory.loanId
        );

        console.log(
          "PAID PAYMENTS:",
          paidPayments
        );

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

            paymentId:
              payment.paymentId ??
              payment.id,

            emiNumber:
              payment.emiNumber,

            loanId:
              loanHistory.loanId ??
              payment.loanId,

            amount:
              payment.amount ?? 0,

            paymentMode:
              payment.paymentMode,

            paymentDate:
              payment.paymentDate ??
              payment.createdAt,

            status:
              payment.status,

            // IMPORTANT:
            // Backend gives transactionReference
            // NOT transactionId
            transactionReference:
              payment.transactionReference,

            receiptNumber:
              payment.receiptNumber,

            verificationStatus:
              payment.verificationStatus,

            // ===============================================
            // CUSTOMER / LOAN DATA
            // ===============================================

            customerId:
              loanHistory.customerId,

            customerName:
              loanHistory.customerName,

            phone:
              loanHistory.phone,

            loanAmount:
              loanHistory.loanAmount,

            emiAmount:
              loanHistory.emiAmount,

            tenureMonths:
              loanHistory.tenureMonths,

            loanStatus:
              loanHistory.loanStatus,
          });
        });
      });

      console.log(
        "========== FLATTENED PAYMENTS =========="
      );

      console.log(
        flattenedPayments
      );

      setPayments(flattenedPayments);
      setFilteredPayments(flattenedPayments);

    } catch (error) {
      console.error(
        "Payment History Error:",
        error
      );

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
    const value =
      search.trim().toLowerCase();

    if (!value) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter(
      (payment) => {
        const paymentId =
          String(
            payment?.paymentId || ""
          ).toLowerCase();

        const loanId =
          String(
            payment?.loanId || ""
          ).toLowerCase();

        // IMPORTANT:
        // Backend field = transactionReference
        const transactionReference =
          String(
            payment?.transactionReference || ""
          ).toLowerCase();

        const receiptNumber =
          String(
            payment?.receiptNumber || ""
          ).toLowerCase();

        const customerName =
          String(
            payment?.customerName || ""
          ).toLowerCase();

        const memberId =
          String(
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
      }
    );

    setFilteredPayments(filtered);

  }, [search, payments]);

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
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
  // STATUS
  // =========================================================

  const getStatusClass = (status) => {
    switch (
      String(status || "")
        .toUpperCase()
    ) {
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (
      String(status || "")
        .toUpperCase()
    ) {
      case "SUCCESS":
        return (
          <CheckCircle2 size={14} />
        );

      case "PENDING":
        return (
          <Clock3 size={14} />
        );

      case "FAILED":
        return (
          <XCircle size={14} />
        );

      default:
        return null;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2
          size={30}
          className="animate-spin text-blue-600 mb-3"
        />

        <p>
          Loading payment history...
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <CreditCard
            size={30}
            className="text-blue-600"
          />

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Payment History
            </h1>

            <p className="text-slate-500">
              View all your payment transactions.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={17} />

          Refresh
        </button>

      </div>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-slate-200 p-5">

          <p className="text-sm text-slate-500">
            Total Payments
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {payments.length}
          </p>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">

          <p className="text-sm text-slate-500">
            Successful Payments
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {
              payments.filter(
                (payment) =>
                  String(
                    payment?.status || ""
                  ).toUpperCase() ===
                  "SUCCESS"
              ).length
            }
          </p>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">

          <p className="text-sm text-slate-500">
            Total Paid
          </p>

          <p className="text-2xl font-bold text-blue-600 mt-1">
            ₹
            {formatAmount(
              payments.reduce(
                (total, payment) =>
                  total +
                  Number(
                    payment?.amount || 0
                  ),
                0
              )
            )}
          </p>

        </div>

      </div>

      {/* =====================================================
          PAYMENT TABLE
      ====================================================== */}

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">

        {/* SEARCH */}

        <div className="p-5 border-b border-slate-200">

          <div className="relative max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search Payment ID, Loan ID or Transaction ID..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* TABLE */}

        {filteredPayments.length === 0 ? (

          <div className="py-16 text-center text-slate-500">

            <CreditCard
              size={40}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="font-medium">
              No payment records found.
            </p>

            {payments.length === 0 && (
              <p className="text-sm mt-1">
                No successful payments are available for your account.
              </p>
            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b">

                <tr>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Payment ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Loan ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    EMI
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Payment Mode
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Payment Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

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
                          index
                        }
                        className="border-b hover:bg-slate-50"
                      >

                        {/* PAYMENT ID */}

                        <td className="px-6 py-4 font-medium text-slate-900">
                          {payment?.paymentId ||
                            payment?.id ||
                            "-"}
                        </td>

                        {/* LOAN ID */}

                        <td className="px-6 py-4">

                          <span className="font-medium text-blue-700">
                            {payment?.loanId ||
                              "-"}
                          </span>

                        </td>

                        {/* EMI */}

                        <td className="px-6 py-4">

                          {payment?.emiNumber
                            ? `EMI #${payment.emiNumber}`
                            : "-"}

                        </td>

                        {/* AMOUNT */}

                        <td className="px-6 py-4 font-semibold text-slate-900">

                          ₹
                          {formatAmount(
                            payment?.amount
                          )}

                        </td>

                        {/* PAYMENT MODE */}

                        <td className="px-6 py-4">

                          {payment?.paymentMode ||
                            "-"}

                        </td>

                        {/* PAYMENT DATE */}

                        <td className="px-6 py-4">

                          {formatDate(
                            payment?.paymentDate
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
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

                        {/* ACTION */}

                        <td className="px-6 py-4">

                          {(payment?.paymentId ||
                            payment?.id) && (

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/payments/${
                                    payment.paymentId ||
                                    payment.id
                                  }`
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >

                              <Eye size={16} />

                              View

                            </button>

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

    </div>
  );
};

export default MyPaymentHistory;