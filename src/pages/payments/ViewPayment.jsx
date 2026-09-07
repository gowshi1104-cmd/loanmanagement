import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  IndianRupee,
  WalletCards,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Building2,
  Smartphone,
  Banknote,
  Hash,
  UserCheck,
} from "lucide-react";

import { getPaymentById } from "../../services/paymentService";

const ViewPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    try {
      setLoading(true);

      const response = await getPaymentById(id);

      setPayment(response.data);
    } catch (error) {
      console.error("Failed to load payment:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center px-4 py-12 sm:py-20">
        <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Loading payment details...
        </p>
      </div>
    );
  }

  // =========================================================
  // PAYMENT NOT FOUND
  // =========================================================

  if (!payment) {
    return (
      <div className="w-full px-4 py-12 text-center sm:py-20">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Payment not found.
        </p>

        <button
          onClick={() => navigate("/payments")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
        >
          <ArrowLeft size={18} />
          Back to Payments
        </button>
      </div>
    );
  }

  // =========================================================
  // HELPERS
  // =========================================================

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "-";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount;
    }

    return `₹ ${numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return date;
      }

      return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return value;
  };

  const paymentMode =
    payment.paymentMode?.toUpperCase() || "";

  const paymentStatus =
    payment.status?.toUpperCase() || "";

  const verificationStatus =
    payment.verificationStatus?.toUpperCase() || "";

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "SUCCESS":
      case "VERIFIED":
        return "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300";

      case "FAILED":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-300";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =========================================================
  // DETAIL ITEM
  // =========================================================

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }) => {
    return (
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-1 shrink-0 text-slate-400 dark:text-slate-500">
            <Icon size={18} />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-200">
            {displayValue(value)}
          </p>
        </div>
      </div>
    );
  };

  // =========================================================
  // HEADER
  // =========================================================

  return (
    <div className="w-full min-w-0">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:items-center">
        <CreditCard
          className="mt-1 shrink-0 text-blue-600 dark:text-blue-400 sm:mt-0"
          size={28}
        />

        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
            Payment Details
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            View complete payment information.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
          ===================================================== */}

      <div className="w-full min-w-0 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900 sm:p-6 lg:p-8">
        {/* ===================================================
            BASIC PAYMENT INFORMATION
            =================================================== */}

        <div>
          <h2 className="mb-5 text-lg font-semibold text-slate-800 dark:text-slate-200">
            Payment Information
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            <DetailItem
              icon={Hash}
              label="Payment ID"
              value={payment.id}
            />

            <DetailItem
              icon={User}
              label="Customer ID"
              value={payment.memberId}
            />

            <DetailItem
              icon={User}
              label="Customer Name"
              value={payment.customerName}
            />

            <DetailItem
              icon={IndianRupee}
              label="Amount"
              value={formatAmount(payment.amount)}
            />

            <DetailItem
              icon={Calendar}
              label="Payment Date"
              value={formatDate(payment.paymentDate)}
            />

            <DetailItem
              icon={WalletCards}
              label="Payment Mode"
              value={payment.paymentMode}
            />

            {/* STATUS */}

            <div className="flex min-w-0 items-start gap-3">
              <CheckCircle2
                className="mt-1 shrink-0 text-slate-400 dark:text-slate-500"
                size={18}
              />

              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Payment Status
                </p>

                <span
                  className={`mt-2 inline-flex max-w-full rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    paymentStatus
                  )}`}
                >
                  {displayValue(payment.status)}
                </span>
              </div>
            </div>

            {/* VERIFICATION STATUS */}

            <div className="flex min-w-0 items-start gap-3">
              <ShieldCheck
                className="mt-1 shrink-0 text-slate-400 dark:text-slate-500"
                size={18}
              />

              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Verification Status
                </p>

                <span
                  className={`mt-2 inline-flex max-w-full rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(
                    verificationStatus
                  )}`}
                >
                  {displayValue(
                    payment.verificationStatus
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            TRANSACTION INFORMATION
            =================================================== */}

        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
          <h2 className="mb-5 text-lg font-semibold text-slate-800 dark:text-slate-200">
            Transaction Information
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
            <DetailItem
              icon={Hash}
              label="Transaction Reference"
              value={payment.transactionReference}
            />

            <DetailItem
              icon={Receipt}
              label="Receipt Number"
              value={payment.receiptNumber}
            />
          </div>
        </div>

        {/* ===================================================
            UPI INFORMATION
            =================================================== */}

        {paymentMode === "UPI" && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
            <div className="mb-5 flex items-center gap-2">
              <Smartphone
                className="shrink-0 text-blue-600 dark:text-blue-400"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                UPI Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <DetailItem
                icon={Smartphone}
                label="UPI Option"
                value={payment.upiOption}
              />

              <DetailItem
                icon={Hash}
                label="UPI ID"
                value={payment.upiId}
              />
            </div>
          </div>
        )}

        {/* ===================================================
            CASH INFORMATION
            =================================================== */}

        {paymentMode === "CASH" && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
            <div className="mb-5 flex items-center gap-2">
              <Banknote
                className="shrink-0 text-green-600 dark:text-emerald-400"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Cash Payment Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <DetailItem
                icon={UserCheck}
                label="Received By"
                value={payment.receivedBy}
              />
            </div>
          </div>
        )}

        {/* ===================================================
            BANK TRANSFER INFORMATION
            =================================================== */}

        {paymentMode === "BANK TRANSFER" && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
            <div className="mb-5 flex items-center gap-2">
              <Building2
                className="shrink-0 text-blue-600 dark:text-blue-400"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Bank Transfer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <DetailItem
                icon={Building2}
                label="Bank Name"
                value={payment.bankName}
              />

              <DetailItem
                icon={Hash}
                label="Account Number"
                value={payment.accountNumber}
              />

              <DetailItem
                icon={Hash}
                label="IFSC Code"
                value={payment.ifscCode}
              />

              <DetailItem
                icon={Hash}
                label="Transaction Reference"
                value={payment.transactionReference}
              />
            </div>
          </div>
        )}

        {/* ===================================================
            CASHFREE INFORMATION
            =================================================== */}

        {(payment.cashfreeOrderId ||
          payment.cashfreePaymentSessionId ||
          payment.cashfreePaymentId) && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
            <div className="mb-5 flex items-center gap-2">
              <CreditCard
                className="shrink-0 text-purple-600 dark:text-violet-400"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Cashfree Payment Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              <DetailItem
                icon={Hash}
                label="Cashfree Order ID"
                value={payment.cashfreeOrderId}
              />

              <DetailItem
                icon={Hash}
                label="Cashfree Payment ID"
                value={payment.cashfreePaymentId}
              />

              <DetailItem
                icon={Hash}
                label="Payment Session ID"
                value={
                  payment.cashfreePaymentSessionId
                }
              />
            </div>
          </div>
        )}

        {/* ===================================================
            RECEIPT / FINAL STATUS
            =================================================== */}

        {paymentStatus === "SUCCESS" && (
          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-700 sm:mt-8 sm:pt-8">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40 sm:p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-green-600 dark:text-emerald-400"
                  size={22}
                />

                <div className="min-w-0">
                  <p className="font-semibold text-green-800 dark:text-emerald-300">
                    Payment Successful
                  </p>

                  <p className="mt-1 text-sm text-green-700 dark:text-emerald-400">
                    This payment has been successfully
                    verified and recorded.
                  </p>

                  {payment.receiptNumber && (
                    <p className="mt-2 break-words text-sm text-green-700 dark:text-emerald-400">
                      Receipt Number:{" "}
                      <span className="font-semibold">
                        {payment.receiptNumber}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            BACK BUTTON
            =================================================== */}

        <div className="mt-6 flex justify-stretch sm:mt-8 sm:justify-end">
          <button
            onClick={() => navigate("/payments")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPayment;