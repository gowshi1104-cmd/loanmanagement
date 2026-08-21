import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock3,
  Receipt,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { checkCashfreePaymentStatus } from "../../services/paymentService";

const CashfreeReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState("CHECKING");
  const [payment, setPayment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const pollingRef = useRef(null);
  const attemptRef = useRef(0);

  // =========================================================
  // GET PAYMENT / ORDER DETAILS FROM URL
  // =========================================================

  const searchParams = new URLSearchParams(
    location.search
  );

  const paymentIdFromUrl =
    searchParams.get("payment_id");

  const orderIdFromUrl =
    searchParams.get("order_id");

  // =========================================================
  // CHECK PAYMENT STATUS
  // =========================================================

  const checkStatus = async () => {
    if (!paymentIdFromUrl) {
      setStatus("ERROR");
      setErrorMessage(
        "Payment ID was not found."
      );
      return;
    }

    try {
      attemptRef.current += 1;

      console.log(
        "CHECKING CASHFREE PAYMENT STATUS:",
        paymentIdFromUrl
      );

      const response =
        await checkCashfreePaymentStatus(
          paymentIdFromUrl
        );

      const data =
        response?.data || response;

      console.log(
        "CASHFREE STATUS RESPONSE:",
        data
      );

      setPayment(data);

      // =====================================================
      // SUCCESS
      // =====================================================

      if (
        data?.status === "SUCCESS" ||
        data?.verificationStatus ===
          "VERIFIED"
      ) {
        setStatus("SUCCESS");

        toast.success(
          "Payment verified successfully!"
        );

        stopPolling();

        return;
      }

      // =====================================================
      // FAILED
      // =====================================================

      if (
        data?.status === "FAILED" ||
        data?.verificationStatus ===
          "FAILED"
      ) {
        setStatus("FAILED");

        toast.error(
          "Payment verification failed."
        );

        stopPolling();

        return;
      }

      // =====================================================
      // PENDING
      // =====================================================

      setStatus("PENDING");

      /*
       * Continue polling.
       *
       * Cashfree may take a few seconds to
       * update the payment status.
       */

      if (attemptRef.current < 12) {
        startPolling();
      } else {
        stopPolling();
      }

    } catch (error) {
      console.error(
        "Cashfree status error:",
        error
      );

      setStatus("ERROR");

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to verify payment status."
      );

      stopPolling();
    }
  };

  // =========================================================
  // START POLLING
  // =========================================================

  const startPolling = () => {
    stopPolling();

    pollingRef.current =
      setTimeout(() => {
        checkStatus();
      }, 3000);
  };

  // =========================================================
  // STOP POLLING
  // =========================================================

  const stopPolling = () => {
    if (pollingRef.current) {
      clearTimeout(
        pollingRef.current
      );

      pollingRef.current = null;
    }
  };

  // =========================================================
  // INITIAL STATUS CHECK
  // =========================================================

  useEffect(() => {
    checkStatus();

    return () => {
      stopPolling();
    };
  }, [paymentIdFromUrl]);

  // =========================================================
  // MANUAL RETRY
  // =========================================================

  const handleRetry = () => {
    attemptRef.current = 0;

    setStatus("CHECKING");
    setPayment(null);
    setErrorMessage("");

    checkStatus();
  };

  // =========================================================
  // GO PAYMENTS
  // =========================================================

  const handleBackToPayments = () => {
    navigate("/payments");
  };

  // =========================================================
  // VIEW RECEIPT
  // =========================================================

  const handleViewReceipt = () => {
    navigate(
      `/payments/${paymentIdFromUrl}`
    );
  };

  // =========================================================
  // RENDER SUCCESS
  // =========================================================

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* HEADER */}

          <div className="bg-green-600 text-white px-6 py-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center">

              <CheckCircle2
                size={40}
                className="text-white"
              />

            </div>

            <h1 className="text-2xl font-bold mt-4">
              Payment Successful
            </h1>

            <p className="text-green-100 mt-1">
              Your payment has been verified
              successfully.
            </p>

          </div>

          {/* BODY */}

          <div className="p-6">

            {/* AMOUNT */}

            <div className="text-center mb-6">

              <p className="text-sm text-slate-500">
                Amount Paid
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-1">
                ₹{" "}
                {Number(
                  payment?.amount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* DETAILS */}

            <div className="border border-slate-200 rounded-xl overflow-hidden">

              <div className="flex justify-between gap-4 px-4 py-3 border-b">

                <span className="text-sm text-slate-500">
                  Payment ID
                </span>

                <span className="font-medium text-slate-900 text-right break-all">
                  {payment?.paymentId ||
                    paymentIdFromUrl}
                </span>

              </div>

              <div className="flex justify-between gap-4 px-4 py-3 border-b">

                <span className="text-sm text-slate-500">
                  Order ID
                </span>

                <span className="font-medium text-slate-900 text-right break-all">
                  {payment?.orderId ||
                    orderIdFromUrl ||
                    "-"}
                </span>

              </div>

              <div className="flex justify-between gap-4 px-4 py-3 border-b">

                <span className="text-sm text-slate-500">
                  Transaction ID
                </span>

                <span className="font-medium text-slate-900 text-right break-all">
                  {payment?.transactionId ||
                    "-"}
                </span>

              </div>

              <div className="flex justify-between gap-4 px-4 py-3 border-b">

                <span className="text-sm text-slate-500">
                  Payment Method
                </span>

                <span className="font-medium text-slate-900">
                  {payment?.paymentMethod ||
                    "UPI"}
                </span>

              </div>

              <div className="flex justify-between gap-4 px-4 py-3">

                <span className="text-sm text-slate-500">
                  Receipt Number
                </span>

                <span className="font-semibold text-green-600 text-right">
                  {payment?.receiptNumber ||
                    "-"}
                </span>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                type="button"
                onClick={
                  handleViewReceipt
                }
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Receipt size={18} />

                View Receipt
              </button>

              <button
                type="button"
                onClick={
                  handleBackToPayments
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />

                Payments
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // FAILED
  // =========================================================

  if (status === "FAILED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">

          <div className="bg-red-600 text-white px-6 py-6 text-center">

            <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center">

              <XCircle
                size={40}
              />

            </div>

            <h1 className="text-2xl font-bold mt-4">
              Payment Failed
            </h1>

            <p className="text-red-100 mt-1">
              We could not verify this payment.
            </p>

          </div>

          <div className="p-6">

            <div className="rounded-xl bg-red-50 border border-red-200 p-4">

              <p className="text-sm text-red-700">
                The payment was not successfully
                completed or verification failed.
              </p>

            </div>

            {paymentIdFromUrl && (
              <div className="mt-4 text-sm">

                <span className="text-slate-500">
                  Payment ID:
                </span>

                <span className="font-medium ml-2 break-all">
                  {paymentIdFromUrl}
                </span>

              </div>
            )}

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />

                Check Again
              </button>

              <button
                type="button"
                onClick={
                  handleBackToPayments
                }
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                Payments
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (status === "ERROR") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">

            <XCircle
              size={38}
              className="text-red-600"
            />

          </div>

          <h1 className="text-xl font-bold text-slate-900 mt-4">
            Unable to Verify Payment
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {errorMessage}
          </p>

          <div className="flex gap-3 justify-center mt-6">

            <button
              type="button"
              onClick={
                handleRetry
              }
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw size={18} />

              Retry
            </button>

            <button
              type="button"
              onClick={
                handleBackToPayments
              }
              className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
            >
              Payments
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // CHECKING / PENDING
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">

        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">

          {status === "PENDING" ? (
            <Clock3
              size={36}
              className="text-yellow-600"
            />
          ) : (
            <Loader2
              size={36}
              className="text-blue-600 animate-spin"
            />
          )}

        </div>

        <h1 className="text-xl font-bold text-slate-900 mt-5">

          {status === "PENDING"
            ? "Payment Verification Pending"
            : "Checking Payment..."}

        </h1>

        <p className="text-sm text-slate-500 mt-2 leading-6">

          {status === "PENDING"
            ? "Your payment was initiated successfully. We are checking Cashfree for the latest payment status."
            : "Please wait while we verify your payment with Cashfree."}

        </p>

        {paymentIdFromUrl && (
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left">

            <p className="text-xs text-slate-500">
              Payment ID
            </p>

            <p className="font-medium text-slate-900 mt-1 break-all">
              {paymentIdFromUrl}
            </p>

          </div>
        )}

        <div className="mt-5">

          <p className="text-xs text-slate-400">
            Checking automatically...
          </p>

        </div>

      </div>

    </div>
  );
};

export default CashfreeReturn;