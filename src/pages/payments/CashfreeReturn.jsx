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

      /**
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

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-6 dark:bg-slate-950 sm:px-4 sm:py-10">

        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

          {/* HEADER */}

          <div className="bg-green-600 px-4 py-5 text-center text-white sm:px-6 sm:py-6">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 sm:h-16 sm:w-16">

              <CheckCircle2
                size={36}
                className="text-white sm:h-10 sm:w-10"
              />

            </div>

            <h1 className="mt-4 text-xl font-bold sm:text-2xl">
              Payment Successful
            </h1>

            <p className="mt-1 text-sm text-green-100 sm:text-base">
              Your payment has been verified
              successfully.
            </p>

          </div>

          {/* BODY */}

          <div className="p-4 sm:p-6">

            {/* AMOUNT */}

            <div className="mb-5 text-center sm:mb-6">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Amount Paid
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">

                ₹{" "}

                {Number(
                  payment?.amount || 0
                ).toLocaleString(
                  "en-IN"
                )}

              </p>

            </div>

            {/* DETAILS */}

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">

              <div className="flex flex-col gap-1 border-b border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Payment ID
                </span>

                <span className="break-all text-left font-medium text-slate-900 dark:text-slate-200 sm:text-right">
                  {payment?.paymentId ||
                    paymentIdFromUrl}
                </span>

              </div>

              <div className="flex flex-col gap-1 border-b border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Order ID
                </span>

                <span className="break-all text-left font-medium text-slate-900 dark:text-slate-200 sm:text-right">
                  {payment?.orderId ||
                    orderIdFromUrl ||
                    "-"}
                </span>

              </div>

              <div className="flex flex-col gap-1 border-b border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Transaction ID
                </span>

                <span className="break-all text-left font-medium text-slate-900 dark:text-slate-200 sm:text-right">
                  {payment?.transactionId ||
                    "-"}
                </span>

              </div>

              <div className="flex flex-col gap-1 border-b border-slate-200 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Payment Method
                </span>

                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {payment?.paymentMethod ||
                    "UPI"}
                </span>

              </div>

              <div className="flex flex-col gap-1 px-3 py-3 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-4">

                <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                  Receipt Number
                </span>

                <span className="break-all text-left font-semibold text-green-600 dark:text-green-400 sm:text-right">
                  {payment?.receiptNumber ||
                    "-"}
                </span>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={
                  handleViewReceipt
                }
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 sm:w-auto"
              >
                <Receipt size={18} />

                View Receipt

              </button>

              <button
                type="button"
                onClick={
                  handleBackToPayments
                }
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
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

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-6 dark:bg-slate-950 sm:px-4 sm:py-10">

        <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-red-200 bg-white shadow-xl dark:border-red-900 dark:bg-slate-900">

          <div className="bg-red-600 px-4 py-5 text-center text-white sm:px-6 sm:py-6">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20 sm:h-16 sm:w-16">

              <XCircle
                size={36}
                className="sm:h-10 sm:w-10"
              />

            </div>

            <h1 className="mt-4 text-xl font-bold sm:text-2xl">
              Payment Failed
            </h1>

            <p className="mt-1 text-sm text-red-100 sm:text-base">
              We could not verify this payment.
            </p>

          </div>

          <div className="p-4 sm:p-6">

            <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30 sm:p-4">

              <p className="text-sm leading-6 text-red-700 dark:text-red-300">
                The payment was not successfully
                completed or verification failed.
              </p>

            </div>

            {paymentIdFromUrl && (

              <div className="mt-4 text-sm">

                <span className="text-slate-500 dark:text-slate-400">
                  Payment ID:
                </span>

                <span className="ml-2 break-all font-medium text-slate-900 dark:text-slate-200">
                  {paymentIdFromUrl}
                </span>

              </div>

            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
              >

                <RefreshCw size={18} />

                Check Again

              </button>

              <button
                type="button"
                onClick={
                  handleBackToPayments
                }
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
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

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 dark:bg-slate-950 sm:px-4">

        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-6">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 sm:h-16 sm:w-16">

            <XCircle
              size={34}
              className="text-red-600 dark:text-red-400 sm:h-[38px] sm:w-[38px]"
            />

          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
            Unable to Verify Payment
          </h1>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
            {errorMessage}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              type="button"
              onClick={
                handleRetry
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 sm:w-auto"
            >

              <RefreshCw size={18} />

              Retry

            </button>

            <button
              type="button"
              onClick={
                handleBackToPayments
              }
              className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
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

    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 dark:bg-slate-950 sm:px-4">

      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40 sm:h-16 sm:w-16">

          {status === "PENDING" ? (

            <Clock3
              size={34}
              className="text-yellow-600 dark:text-yellow-400 sm:h-9 sm:w-9"
            />

          ) : (

            <Loader2
              size={34}
              className="animate-spin text-blue-600 dark:text-blue-400 sm:h-9 sm:w-9"
            />

          )}

        </div>

        <h1 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">

          {status === "PENDING"
            ? "Payment Verification Pending"
            : "Checking Payment..."}

        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">

          {status === "PENDING"
            ? "Your payment was initiated successfully. We are checking Cashfree for the latest payment status."
            : "Please wait while we verify your payment with Cashfree."}

        </p>

        {paymentIdFromUrl && (

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left dark:border-slate-700 dark:bg-slate-800/70 sm:p-4">

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Payment ID
            </p>

            <p className="mt-1 break-all font-medium text-slate-900 dark:text-slate-200">
              {paymentIdFromUrl}
            </p>

          </div>

        )}

        <div className="mt-5">

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Checking automatically...
          </p>

        </div>

      </div>

    </div>

  );

};

export default CashfreeReturn;