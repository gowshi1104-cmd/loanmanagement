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
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
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
      <div className="py-20 text-center">
        <p className="text-slate-500 mb-4">
          Payment not found.
        </p>

        <button
          onClick={() => navigate("/payments")}
          className="inline-flex items-center gap-2 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-100 transition"
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
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";
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
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="font-semibold text-slate-800 mt-1 break-words">
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
    <div>
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="flex items-center gap-3 mb-6">
        <CreditCard
          className="text-blue-600"
          size={30}
        />

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Payment Details
          </h1>

          <p className="text-slate-500 mt-1">
            View complete payment information.
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
          ===================================================== */}

      <div className="max-w-6xl bg-white rounded-2xl shadow border p-8">

        {/* ===================================================
            BASIC PAYMENT INFORMATION
            =================================================== */}

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            Payment Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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

            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-1 text-slate-400"
                size={18}
              />

              <div>
                <p className="text-sm text-slate-500">
                  Payment Status
                </p>

                <span
                  className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                    paymentStatus
                  )}`}
                >
                  {displayValue(payment.status)}
                </span>
              </div>
            </div>

            {/* VERIFICATION STATUS */}

            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 text-slate-400"
                size={18}
              />

              <div>
                <p className="text-sm text-slate-500">
                  Verification Status
                </p>

                <span
                  className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
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

        <div className="border-t mt-8 pt-8">

          <h2 className="text-lg font-semibold text-slate-800 mb-5">
            Transaction Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
          <div className="border-t mt-8 pt-8">

            <div className="flex items-center gap-2 mb-5">
              <Smartphone
                className="text-blue-600"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800">
                UPI Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
          <div className="border-t mt-8 pt-8">

            <div className="flex items-center gap-2 mb-5">
              <Banknote
                className="text-green-600"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800">
                Cash Payment Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
          <div className="border-t mt-8 pt-8">

            <div className="flex items-center gap-2 mb-5">
              <Building2
                className="text-blue-600"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800">
                Bank Transfer Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
          <div className="border-t mt-8 pt-8">

            <div className="flex items-center gap-2 mb-5">
              <CreditCard
                className="text-purple-600"
                size={20}
              />

              <h2 className="text-lg font-semibold text-slate-800">
                Cashfree Payment Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

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
          <div className="border-t mt-8 pt-8">

            <div className="rounded-xl bg-green-50 border border-green-200 p-5">

              <div className="flex items-start gap-3">

                <CheckCircle2
                  className="text-green-600 mt-0.5"
                  size={22}
                />

                <div>
                  <p className="font-semibold text-green-800">
                    Payment Successful
                  </p>

                  <p className="text-sm text-green-700 mt-1">
                    This payment has been successfully
                    verified and recorded.
                  </p>

                  {payment.receiptNumber && (
                    <p className="text-sm text-green-700 mt-2">
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

        <div className="mt-8 flex justify-end">

          <button
            onClick={() => navigate("/payments")}
            className="flex items-center gap-2 border border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-100 transition"
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