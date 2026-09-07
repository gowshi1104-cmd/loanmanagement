import { useEffect, useRef, useState } from "react";

import {
  Save,
  X,
  Smartphone,
  Loader2,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Receipt,
  Printer,
  RefreshCw,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getMemberPaymentDetails,
  createPayment,
  createCashfreeOrder,
  checkCashfreePaymentStatus,
} from "../../services/paymentService";

const emptyPayment = {
  loanId: "",
  customerName: "",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMode: "",
  receivedBy: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  transactionReference: "",
};

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

const PaymentForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  // =========================================================
  // PAYMENT STATE
  // =========================================================
  const [payment, setPayment] = useState({
    ...emptyPayment,
    ...(initialData || {}),
  });
  const [dueAmount, setDueAmount] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);
  const [emiAmount, setEmiAmount] = useState(0);
  const [fetchingMember, setFetchingMember] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // =========================================================
  // CASHFREE PAYMENT STATE
  // =========================================================
  const [createdPaymentId, setCreatedPaymentId] = useState(null);
  const [cashfreeOrderId, setCashfreeOrderId] = useState("");
  const [cashfreePaymentSessionId, setCashfreePaymentSessionId] =
    useState("");
  const [cashfreePaymentId, setCashfreePaymentId] = useState("");
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState("");

  // =========================================================
  // RECEIPT
  // =========================================================
  const [receiptNumber, setReceiptNumber] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  // =========================================================
  // DIRTY STATE
  // =========================================================
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);

  // =========================================================
  // LEAVE MODAL
  // =========================================================
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const allowLeaveRef = useRef(false);

  // =========================================================
  // CASHFREE SDK
  // =========================================================
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  // =========================================================
  // RESET PAYMENT STATE
  // =========================================================
  const resetPaymentState = () => {
    setPaymentSuccess(false);
    setPaymentFailed(false);
    setPaymentPending(false);
    setPaymentCreated(false);
    setCreatedPaymentId(null);
    setCashfreeOrderId("");
    setCashfreePaymentSessionId("");
    setCashfreePaymentId("");
    setPaymentFailureMessage("");
    setReceiptNumber("");
    setShowReceipt(false);
  };

  // =========================================================
  // LOAD CASHFREE SDK
  // =========================================================
  useEffect(() => {
    const existingScript = document.querySelector(
      `script[src="${CASHFREE_SDK_URL}"]`,
    );

    if (existingScript) {
      if (window.Cashfree) {
        setCashfreeLoaded(true);
      }

      const handleLoad = () => {
        setCashfreeLoaded(true);
      };

      existingScript.addEventListener("load", handleLoad);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.src = CASHFREE_SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("Cashfree Checkout SDK loaded");
      setCashfreeLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Cashfree Checkout SDK");
      setCashfreeLoaded(false);
      toast.error("Unable to load Cashfree Checkout");
    };

    document.body.appendChild(script);

    return () => {
      // Do not remove Cashfree SDK.
    };
  }, []);

  // =========================================================
  // INITIAL DATA
  // =========================================================
  useEffect(() => {
    if (!initialData) {
      return;
    }

    setPayment({
      ...emptyPayment,
      ...initialData,
    });

    setIsDirty(false);
    isDirtyRef.current = false;

    resetPaymentState();

    setDueAmount(Number(initialData?.dueAmount || 0));

    setOverdueAmount(
      Number(
        initialData?.overdueAmount ||
          initialData?.overDueAmount ||
          initialData?.overdue ||
          0,
      ),
    );

    setEmiAmount(
      Number(
        initialData?.emiAmount ||
          initialData?.emi ||
          initialData?.installmentAmount ||
          initialData?.amount ||
          0,
      ),
    );
  }, [initialData]);

  // =========================================================
  // BROWSER BACK PROTECTION
  //
  // IMPORTANT:
  // Cancel button DOES NOT use history.back().
  // Cancel is handled directly by parent navigation.
  // =========================================================
  useEffect(() => {
    window.history.pushState(
      { paymentForm: true },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      if (allowLeaveRef.current) {
        return;
      }

      window.history.pushState(
        { paymentForm: true },
        "",
        window.location.href,
      );

      if (!isDirtyRef.current) {
        allowLeaveRef.current = true;
        window.history.back();
        return;
      }

      setShowLeaveModal(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // =========================================================
  // BROWSER REFRESH / TAB CLOSE
  // =========================================================
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirtyRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // =========================================================
  // CANCEL
  //
  // IMPORTANT:
  // No history.back().
  // Parent AddPayment handles navigate("/payments").
  // =========================================================
  const handleCancelClick = () => {
    console.log("Cancel clicked - navigating to payment page");

    setShowLeaveModal(false);
    allowLeaveRef.current = true;
    setIsDirty(false);
    isDirtyRef.current = false;

    onCancel?.();
  };

  // =========================================================
  // STAY
  // =========================================================
  const handleStay = () => {
    setShowLeaveModal(false);
  };

  // =========================================================
  // LEAVE WITHOUT SAVE
  // Browser BACK modal only
  // =========================================================
  const handleLeaveWithoutSave = () => {
    setShowLeaveModal(false);
    allowLeaveRef.current = true;
    setIsDirty(false);
    isDirtyRef.current = false;
    window.history.back();
  };

  // =========================================================
  // LOAD MEMBER DETAILS
  // =========================================================
  useEffect(() => {
    if (paymentSuccess) {
      return;
    }

    const loanId = payment?.loanId?.trim() || "";

    if (!loanId) {
      setDueAmount(0);
      setOverdueAmount(0);
      setEmiAmount(0);

      setPayment((prev) => ({
        ...prev,
        customerName: "",
        amount: "",
      }));

      return;
    }

    const timer = setTimeout(() => {
      loadMemberDetails(loanId);
    }, 500);

    return () => clearTimeout(timer);
  }, [payment.loanId, paymentSuccess]);

  const loadMemberDetails = async (loanId) => {
    try {
      setFetchingMember(true);

      const response = await getMemberPaymentDetails(loanId);
      const data = response?.data || response;

      console.log("MEMBER PAYMENT DETAILS:", data);

      // =====================================================
      // CUSTOMER NAME
      // =====================================================
      const customerName = data?.customerName || "";

      // =====================================================
      // DUE AMOUNT
      // =====================================================
      const fetchedDueAmount = Number(
        data?.dueAmount ?? data?.due ?? 0,
      );

      // =====================================================
      // OVERDUE AMOUNT
      // =====================================================
      const fetchedOverdueAmount = Number(
        data?.overdueAmount ??
          data?.overDueAmount ??
          data?.overdue ??
          0,
      );

      // =====================================================
      // EMI AMOUNT
      // =====================================================
      const fetchedEmiAmount = Number(
        data?.emiAmount ??
          data?.emi ??
          data?.installmentAmount ??
          0,
      );

      setOverdueAmount(fetchedOverdueAmount);
      setEmiAmount(fetchedEmiAmount);

      console.log("EMI AMOUNT:", fetchedEmiAmount);
      console.log("DUE AMOUNT:", fetchedDueAmount);
      console.log("OVERDUE AMOUNT:", fetchedOverdueAmount);

      // =====================================================
      // UPDATE AMOUNTS
      // =====================================================
      setDueAmount(fetchedDueAmount);
      setOverdueAmount(fetchedOverdueAmount);
      setEmiAmount(fetchedEmiAmount);

      // =====================================================
      // PAYMENT AMOUNT
      //
      // Amount is NOT manually editable.
      // It is always EMI amount.
      // =====================================================
      setPayment((prev) => ({
        ...prev,
        customerName,
        amount: fetchedEmiAmount > 0 ? fetchedEmiAmount : "",
      }));

      setErrors((prev) => ({
        ...prev,
        memberId: "",
        customerName: "",
        amount: "",
      }));
    } catch (error) {
      console.error("Member details error:", error);

      setPayment((prev) => ({
        ...prev,
        customerName: "",
        amount: "",
      }));

      setDueAmount(0);
      setOverdueAmount(0);
      setEmiAmount(0);

      if (loanId.length >= 1) {
        setErrors((prev) => ({
          ...prev,
          loanId: "Loan ID not found",
        }));
      }
    } finally {
      setFetchingMember(false);
    }
  };

  // =========================================================
  // INPUT CHANGE
  //
  // Amount cannot be manually changed.
  // =========================================================
  const handleChange = (e) => {
    if (paymentSuccess) {
      return;
    }

    const { name, value } = e.target;

    // =======================================================
    // DO NOT ALLOW MANUAL AMOUNT CHANGE
    // =======================================================
    if (name === "amount") {
      return;
    }

    setPayment((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsDirty(true);
    isDirtyRef.current = true;

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // PAYMENT MODE
  // =========================================================
  const handlePaymentModeChange = (e) => {
    if (paymentSuccess) {
      return;
    }

    const value = e.target.value;

    setPayment((prev) => ({
      ...prev,
      paymentMode: value,
      receivedBy: value === "CASH" ? prev.receivedBy : "",
      accountNumber:
        value === "BANK_TRANSFER" ? prev.accountNumber : "",
      ifscCode: value === "BANK_TRANSFER" ? prev.ifscCode : "",
      bankName: value === "BANK_TRANSFER" ? prev.bankName : "",
      transactionReference:
        value === "CASH" || value === "BANK_TRANSFER"
          ? prev.transactionReference
          : "",
    }));

    setIsDirty(true);
    isDirtyRef.current = true;

    setErrors((prev) => ({
      ...prev,
      paymentMode: "",
    }));

    resetPaymentState();
  };

  // =========================================================
  // VALIDATION
  // =========================================================
  const validate = () => {
    const newErrors = {};

    if (!payment.loanId?.trim()) {
      newErrors.loanId = "Loan ID is required";
    }

    if (!payment.customerName?.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (payment.amount === "" || Number(payment.amount) <= 0) {
      newErrors.amount = "EMI amount is not available";
    }

    if (!payment.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    if (!payment.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
    }

    // =======================================================
    // CASH
    // =======================================================
    if (payment.paymentMode === "CASH") {
      if (!payment.receivedBy?.trim()) {
        newErrors.receivedBy = "Received by is required";
      }
    }

    // =======================================================
    // BANK TRANSFER
    // =======================================================
    if (payment.paymentMode === "BANK_TRANSFER") {
      if (!payment.accountNumber?.trim()) {
        newErrors.accountNumber = "Account number is required";
      }

      if (!payment.ifscCode?.trim()) {
        newErrors.ifscCode = "IFSC code is required";
      }

      if (!payment.bankName?.trim()) {
        newErrors.bankName = "Bank name is required";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // NORMAL PAYMENT
  // CASH / BANK TRANSFER
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentSuccess) {
      return;
    }

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (payment.paymentMode === "UPI") {
      toast.error("For UPI, click Generate Payment QR");
      return;
    }

    try {
      setPaymentProcessing(true);

      const payload = {
        loanId: payment.loanId.trim(),
        customerName: payment.customerName.trim(),

        // ===================================================
        // IMPORTANT:
        // Payment amount = EMI amount
        // ===================================================
        amount: Number(emiAmount),
        paymentDate: payment.paymentDate,
        paymentMode: payment.paymentMode,
        status: "SUCCESS",
        verificationStatus: "VERIFIED",

        receivedBy:
          payment.paymentMode === "CASH"
            ? payment.receivedBy.trim()
            : null,

        accountNumber:
          payment.paymentMode === "BANK_TRANSFER"
            ? payment.accountNumber.trim()
            : null,

        ifscCode:
          payment.paymentMode === "BANK_TRANSFER"
            ? payment.ifscCode.trim().toUpperCase()
            : null,

        bankName:
          payment.paymentMode === "BANK_TRANSFER"
            ? payment.bankName.trim()
            : null,

        transactionReference:
          payment.transactionReference?.trim() || null,
      };

      console.log("CREATING NORMAL PAYMENT:", payload);

      const response = await onSubmit?.(payload);
      const createdPayment = response?.data || response;

      const paymentId =
        createdPayment?.paymentId || createdPayment?.id;

      if (paymentId) {
        setCreatedPaymentId(paymentId);
      }

      // =====================================================
      // SUCCESS
      // =====================================================
      setPaymentSuccess(true);
      setPaymentFailed(false);
      setPaymentPending(false);
      setPaymentCreated(false);
      setIsDirty(false);
      isDirtyRef.current = false;

      setReceiptNumber(createdPayment?.receiptNumber || "");

      toast.success("Payment created successfully.");

      setTimeout(() => {
        setShowReceipt(true);
      }, 400);
    } catch (error) {
      console.error("Payment creation error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Failed to create payment",
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  // =========================================================
  // CHECK CASHFREE STATUS
  // =========================================================
  const checkPaymentStatus = async (
    paymentId,
    showToast = true,
  ) => {
    try {
      if (showToast) {
        toast.loading("Checking payment status...", {
          id: "cashfree-status",
        });
      }

      console.log("CHECKING CASHFREE PAYMENT STATUS:", paymentId);

      const response = await checkCashfreePaymentStatus(paymentId);
      const result = response?.data || response;

      console.log("CASHFREE STATUS RESPONSE:", result);

      if (showToast) {
        toast.dismiss("cashfree-status");
      }

      // =====================================================
      // SUCCESS
      // =====================================================
      if (result?.status === "SUCCESS") {
        setPaymentSuccess(true);
        setPaymentFailed(false);
        setPaymentPending(false);
        setPaymentCreated(false);
        setCashfreePaymentId(result?.transactionId || "");
        setReceiptNumber(result?.receiptNumber || "");
        setIsDirty(false);
        isDirtyRef.current = false;

        toast.success("Payment successful and verified!");

        setTimeout(() => {
          setShowReceipt(true);
        }, 500);

        return result;
      }

      // =====================================================
      // FAILED
      // =====================================================
      if (result?.status === "FAILED") {
        setPaymentFailed(true);
        setPaymentSuccess(false);
        setPaymentPending(false);
        setPaymentCreated(false);
        setPaymentFailureMessage("Cashfree payment failed");

        toast.error("Cashfree payment failed");

        return result;
      }

      // =====================================================
      // PENDING
      // =====================================================
      setPaymentPending(true);
      setPaymentSuccess(false);
      setPaymentFailed(false);

      if (showToast) {
        toast("Payment verification is still pending.", {
          icon: "⏳",
        });
      }

      return result;
    } catch (error) {
      console.error("Cashfree status check error:", error);

      if (showToast) {
        toast.dismiss("cashfree-status");
      }

      setPaymentPending(true);
      setPaymentSuccess(false);
      setPaymentFailed(false);

      setPaymentFailureMessage(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to verify Cashfree payment",
      );

      if (showToast) {
        toast.error(
          error?.response?.data?.message ||
            error?.response?.data ||
            error?.message ||
            "Unable to verify payment",
        );
      }

      return null;
    }
  };

  // =========================================================
  // CASHFREE UPI PAYMENT
  // =========================================================
  const handleTriggerUpiPayment = async () => {
    if (paymentSuccess) {
      return;
    }

    // =====================================================
    // VALIDATION
    // =====================================================
    if (!payment.loanId?.trim()) {
      toast.error("Enter Loan ID");
      return;
    }

    if (!payment.customerName?.trim()) {
      toast.error("Customer details are not loaded");
      return;
    }

    if (!emiAmount || Number(emiAmount) <= 0) {
      toast.error("EMI amount is not available");
      return;
    }

    if (!payment.paymentDate) {
      toast.error("Payment date is required");
      return;
    }

    // =====================================================
    // CASHFREE SDK
    // =====================================================
    if (!window.Cashfree) {
      toast.error(
        "Cashfree Checkout is still loading. Please try again.",
      );
      return;
    }

    try {
      setPaymentProcessing(true);
      setPaymentSuccess(false);
      setPaymentFailed(false);
      setPaymentPending(false);
      setPaymentFailureMessage("");

      // ===================================================
      // LOCAL PAYMENT
      // ===================================================
      const payload = {
        loanId: payment.loanId.trim(),
        customerName: payment.customerName.trim(),

        // =================================================
        // IMPORTANT:
        // EMI AMOUNT ONLY
        // =================================================
        amount: Number(emiAmount),
        paymentDate: payment.paymentDate,
        paymentMode: "UPI",
        status: "PENDING",
        verificationStatus: "PENDING",
        upiOption: null,
        upiId: null,
        receivedBy: null,
        accountNumber: null,
        ifscCode: null,
        bankName: null,
        transactionReference: null,
      };

      console.log(
        "CREATING CASHFREE LOCAL PAYMENT:",
        payload,
      );

      const createResponse = await createPayment(payload);
      const createdPayment = createResponse?.data || createResponse;

      console.log(
        "LOCAL PAYMENT RESPONSE:",
        createdPayment,
      );

      const paymentId =
        createdPayment?.paymentId || createdPayment?.id;

      if (!paymentId) {
        throw new Error(
          "Payment ID was not returned by backend",
        );
      }

      setCreatedPaymentId(paymentId);
      setPaymentCreated(true);

      // ===================================================
      // CREATE CASHFREE ORDER
      // ===================================================
      console.log(
        "CREATING CASHFREE ORDER FOR PAYMENT:",
        paymentId,
      );

      const orderResponse = await createCashfreeOrder(paymentId);
      const order = orderResponse?.data || orderResponse;

      console.log("CASHFREE ORDER RESPONSE:", order);

      if (!order?.paymentSessionId) {
        throw new Error(
          "Cashfree payment session ID was not returned",
        );
      }

      setCashfreeOrderId(order?.orderId || "");
      setCashfreePaymentSessionId(order.paymentSessionId);

      // ===================================================
      // CASHFREE INSTANCE
      // ===================================================
      if (!window.Cashfree) {
        throw new Error(
          "Cashfree Checkout SDK is not loaded",
        );
      }

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      // ===================================================
      // OPEN CASHFREE CHECKOUT
      // ===================================================
      console.log("OPENING CASHFREE CHECKOUT...");

      const checkoutResult = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_modal",
      });

      console.log(
        "CASHFREE CHECKOUT RESULT:",
        checkoutResult,
      );

      if (checkoutResult?.error) {
        console.error(
          "CASHFREE CHECKOUT ERROR:",
          checkoutResult.error,
        );

        throw new Error(
          checkoutResult.error?.message ||
            "Cashfree checkout failed",
        );
      }

      // ===================================================
      // CHECK BACKEND STATUS
      // ===================================================
      toast("Checking Cashfree payment status...", {
        icon: "🔄",
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 1500),
      );

      await checkPaymentStatus(paymentId);
    } catch (error) {
      console.error("Cashfree payment error:", error);

      setPaymentCreated(false);
      setPaymentFailed(true);
      setPaymentSuccess(false);
      setPaymentPending(false);

      setPaymentFailureMessage(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to initiate Cashfree payment",
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          "Unable to initiate Cashfree payment",
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  // =========================================================
  // RETRY UPI
  // =========================================================
  const handleRetryPayment = () => {
    if (paymentSuccess) {
      return;
    }

    setPaymentFailed(false);
    setPaymentPending(false);
    setPaymentSuccess(false);
    setPaymentFailureMessage("");
    setCashfreePaymentId("");

    handleTriggerUpiPayment();
  };

  // =========================================================
  // MANUAL STATUS
  // =========================================================
  const handleCheckStatus = async () => {
    if (!createdPaymentId) {
      toast.error("Payment ID is not available");
      return;
    }

    await checkPaymentStatus(createdPaymentId);
  };

  // =========================================================
  // PRINT RECEIPT
  // =========================================================
  const handlePrintReceipt = () => {
    window.print();
  };

  // =========================================================
  // DISABLED STATE
  // =========================================================
  const fieldsDisabled =
    paymentSuccess || paymentProcessing;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <>
      {/* =====================================================
          MAIN FORM
      ====================================================== */}
      <form
        onSubmit={handleSubmit}
        className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow p-4 sm:p-6"
      >
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
            Payment Information
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter the member and payment details below.
          </p>
        </div>

        {/* ===================================================
            SUCCESS
        ==================================================== */}
        {paymentSuccess && (
          <div className="mb-5 sm:mb-6 rounded-2xl border border-green-200 dark:border-emerald-900 bg-green-50 dark:bg-emerald-950/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                <CheckCircle2
                  size={26}
                  className="text-green-600 dark:text-emerald-400 sm:w-7 sm:h-7"
                />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-emerald-300">
                  Payment Successful
                </h3>

                <p className="text-xs sm:text-sm text-green-700 dark:text-emerald-300 mt-1">
                  Payment has been successfully verified by
                  Cashfree.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-emerald-900 p-3 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      EMI Amount
                    </p>

                    <p className="font-semibold text-slate-900 dark:text-slate-200 mt-1 break-words">
                      ₹{" "}
                      {Number(emiAmount).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-emerald-900 p-3 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Payment ID
                    </p>

                    <p className="font-semibold text-slate-900 dark:text-slate-200 mt-1 break-all">
                      {cashfreePaymentId ||
                        createdPaymentId ||
                        "-"}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-green-200 dark:border-emerald-900 p-3 min-w-0 sm:col-span-2 md:col-span-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Receipt
                    </p>

                    <p className="font-semibold text-slate-900 dark:text-slate-200 mt-1 break-all">
                      {receiptNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowReceipt(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Receipt size={18} />
                    View Receipt
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-green-300 dark:border-emerald-800 text-green-700 dark:text-emerald-300 font-medium hover:bg-green-100 dark:hover:bg-emerald-950/60 flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            PENDING
        ==================================================== */}
        {paymentPending && (
          <div className="mb-5 sm:mb-6 rounded-2xl border border-yellow-200 dark:border-amber-900 bg-yellow-50 dark:bg-amber-950/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-yellow-100 dark:bg-amber-950 flex items-center justify-center shrink-0">
                <Loader2
                  size={24}
                  className="text-yellow-600 dark:text-amber-400 animate-spin sm:w-[26px] sm:h-[26px]"
                />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800 dark:text-amber-300">
                  Payment Verification Pending
                </h3>

                <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-1">
                  Payment was initiated, but Cashfree has not
                  confirmed the final status yet.
                </p>

                <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-2 break-all">
                  Payment ID:{" "}
                  <strong>
                    {createdPaymentId || "-"}
                  </strong>
                </p>

                {cashfreeOrderId && (
                  <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-1 break-all">
                    Order ID:{" "}
                    <strong>{cashfreeOrderId}</strong>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={paymentProcessing}
                  className="w-full sm:w-auto mt-4 px-4 py-2.5 rounded-xl bg-yellow-600 text-white font-medium hover:bg-yellow-700 dark:hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Check Payment Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            FAILED
        ==================================================== */}
        {paymentFailed && (
          <div className="mb-5 sm:mb-6 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
                <AlertTriangle
                  size={24}
                  className="text-red-600 dark:text-red-400 sm:w-[26px] sm:h-[26px]"
                />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-300">
                  Payment Failed
                </h3>

                <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1 break-words">
                  {paymentFailureMessage ||
                    "Payment could not be completed."}
                </p>

                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={paymentProcessing}
                  className="w-full sm:w-auto mt-4 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 dark:hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Retry Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            MEMBER / PAYMENT DETAILS
        ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* MEMBER ID */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Loan ID{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="loanId"
              value={payment.loanId}
              onChange={handleChange}
              disabled={fieldsDisabled}
              placeholder="Enter loan ID"
              className={`w-full min-w-0 border rounded-xl px-3 sm:px-4 py-3 outline-none ${
                errors.loanId
                  ? "border-red-500"
                  : "border-slate-300 dark:border-slate-700"
              } ${
                fieldsDisabled
                  ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : "dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
              }`}
            />

            {fetchingMember && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Loading member details...
              </p>
            )}

            {errors.loanId && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.loanId}
              </p>
            )}
          </div>

          {/* CUSTOMER NAME */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Customer Name
            </label>

            <input
              type="text"
              value={payment.customerName}
              disabled
              placeholder="Auto populated"
              className="w-full min-w-0 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-500 rounded-xl px-3 sm:px-4 py-3 cursor-not-allowed"
            />

            {errors.customerName && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.customerName}
              </p>
            )}
          </div>

          {/* DUE AMOUNT */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Due Amount
            </label>

            <input
              type="text"
              value={`₹ ${Number(
                dueAmount || 0,
              ).toLocaleString("en-IN")}`}
              disabled
              className="w-full min-w-0 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-500 rounded-xl px-3 sm:px-4 py-3 cursor-not-allowed"
            />
          </div>

          {/* OVERDUE AMOUNT */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Overdue Amount
            </label>

            <input
              type="text"
              value={`₹ ${Number(
                overdueAmount || 0,
              ).toLocaleString("en-IN")}`}
              disabled
              className="w-full min-w-0 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl px-3 sm:px-4 py-3 cursor-not-allowed"
            />
          </div>

          {/* EMI AMOUNT */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              EMI Amount{" "}
              <span className="text-blue-500 dark:text-blue-400 text-xs">
                (Auto)
              </span>
            </label>

            <input
              type="text"
              value={`₹ ${Number(
                emiAmount || 0,
              ).toLocaleString("en-IN")}`}
              disabled
              className="w-full min-w-0 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl px-3 sm:px-4 py-3 cursor-not-allowed"
            />

            {errors.amount && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          {/* PAYMENT DATE */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Date{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="paymentDate"
              value={payment.paymentDate}
              onChange={handleChange}
              disabled={fieldsDisabled}
              className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-xl px-3 sm:px-4 py-3 ${
                fieldsDisabled
                  ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : ""
              }`}
            />

            {errors.paymentDate && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.paymentDate}
              </p>
            )}
          </div>

          {/* PAYMENT MODE */}
          <div className="min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Mode{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="paymentMode"
              value={payment.paymentMode}
              onChange={handlePaymentModeChange}
              disabled={fieldsDisabled}
              className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 dark:bg-slate-900 dark:text-slate-200 ${
                fieldsDisabled
                  ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">Select Payment Mode</option>
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>
            </select>

            {errors.paymentMode && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.paymentMode}
              </p>
            )}
          </div>
        </div>

        {/* ===================================================
            UPI SECTION
        ==================================================== */}
        {payment.paymentMode === "UPI" && (
          <div className="mt-5 sm:mt-6 border border-blue-200 dark:border-blue-900 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <QrCode
                  size={21}
                  className="text-blue-600 dark:text-blue-400 sm:w-[23px] sm:h-[23px]"
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  UPI Payment
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Pay securely using Cashfree.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                  <Smartphone
                    size={21}
                    className="text-blue-600 dark:text-blue-400 sm:w-[23px] sm:h-[23px]"
                  />
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    Pay using UPI
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-6">
                    Click the button below to open Cashfree
                    Checkout.
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
                    Cashfree will provide the available UPI
                    payment options for the customer.
                  </p>
                </div>
              </div>

              {/* CUSTOMER / EMI */}
              <div className="mt-4 sm:mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customer
                  </p>

                  <p className="font-semibold text-slate-900 dark:text-slate-200 mt-1 break-words">
                    {payment.customerName || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-3 sm:p-4 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    EMI Amount
                  </p>

                  <p className="font-semibold text-blue-700 dark:text-blue-300 mt-1 break-words">
                    ₹{" "}
                    {Number(emiAmount || 0).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
              </div>

              {/* SDK STATUS */}
              <div className="mt-4">
                {!cashfreeLoaded ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Loading Cashfree Checkout...
                  </p>
                ) : (
                  <p className="text-xs text-green-600 dark:text-emerald-400">
                    Cashfree Checkout ready
                  </p>
                )}
              </div>

              {/* TRIGGER */}
              <div className="flex justify-stretch sm:justify-end mt-5">
                <button
                  type="button"
                  onClick={handleTriggerUpiPayment}
                  disabled={
                    paymentProcessing ||
                    paymentSuccess ||
                    !cashfreeLoaded ||
                    !emiAmount
                  }
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Opening Cashfree...
                    </>
                  ) : (
                    <>
                      <QrCode size={18} />
                      Generate Payment QR
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CREATED PAYMENT */}
            {paymentCreated && createdPaymentId && (
              <div className="mt-4 sm:mt-5 rounded-xl border border-yellow-200 dark:border-amber-900 bg-yellow-50 dark:bg-amber-950/40 p-4">
                <div className="flex items-start gap-3">
                  <Loader2
                    size={20}
                    className="text-yellow-600 dark:text-amber-400 animate-spin mt-0.5 shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="font-medium text-yellow-800 dark:text-amber-300">
                      Payment is processing
                    </p>

                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-1 break-all">
                      Payment ID: {createdPaymentId}
                    </p>

                    {cashfreeOrderId && (
                      <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-1 break-all">
                        Cashfree Order ID:{" "}
                        {cashfreeOrderId}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-yellow-700 dark:text-amber-300 mt-1 leading-5">
                      Complete the payment in Cashfree
                      Checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            CASH
        ==================================================== */}
        {payment.paymentMode === "CASH" && (
          <div className="mt-5 sm:mt-6 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Cash Payment
            </h3>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Received By{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="receivedBy"
              value={payment.receivedBy}
              onChange={handleChange}
              disabled={fieldsDisabled}
              placeholder="Enter staff name"
              className={`w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 ${
                fieldsDisabled
                  ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : ""
              }`}
            />

            {errors.receivedBy && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errors.receivedBy}
              </p>
            )}
          </div>
        )}

        {/* ===================================================
            BANK TRANSFER
        ==================================================== */}
        {payment.paymentMode === "BANK_TRANSFER" && (
          <div className="mt-5 sm:mt-6 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 bg-slate-50 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-5">
              Bank Transfer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account Number{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="accountNumber"
                  value={payment.accountNumber}
                  onChange={handleChange}
                  disabled={fieldsDisabled}
                  className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 dark:bg-slate-900 dark:text-slate-200 ${
                    fieldsDisabled
                      ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : ""
                  }`}
                />

                {errors.accountNumber && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  IFSC Code{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="ifscCode"
                  value={payment.ifscCode}
                  onChange={handleChange}
                  disabled={fieldsDisabled}
                  className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 uppercase dark:bg-slate-900 dark:text-slate-200 ${
                    fieldsDisabled
                      ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : ""
                  }`}
                />

                {errors.ifscCode && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.ifscCode}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bank Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="bankName"
                  value={payment.bankName}
                  onChange={handleChange}
                  disabled={fieldsDisabled}
                  className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 dark:bg-slate-900 dark:text-slate-200 ${
                    fieldsDisabled
                      ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : ""
                  }`}
                />

                {errors.bankName && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.bankName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            TRANSACTION REFERENCE
        ==================================================== */}
        {(payment.paymentMode === "CASH" ||
          payment.paymentMode === "BANK_TRANSFER") && (
          <div className="mt-5 sm:mt-6 min-w-0">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transaction Reference
            </label>

            <input
              type="text"
              name="transactionReference"
              value={payment.transactionReference}
              onChange={handleChange}
              disabled={fieldsDisabled}
              placeholder="Enter transaction reference"
              className={`w-full min-w-0 border border-slate-300 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-3 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 ${
                fieldsDisabled
                  ? "bg-slate-100 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        )}

        {/* ===================================================
            SUCCESS LOCK
        ==================================================== */}
        {paymentSuccess && (
          <div className="mt-5 sm:mt-6 rounded-xl border border-green-200 dark:border-emerald-900 bg-green-50 dark:bg-emerald-950/40 px-4 py-3">
            <p className="text-xs sm:text-sm text-green-700 dark:text-emerald-300 font-medium leading-5">
              🔒 Payment completed successfully. Payment
              details are locked and cannot be edited.
            </p>
          </div>
        )}

        {/* ===================================================
            FOOTER
        ==================================================== */}
        <div className="border-t border-slate-200 dark:border-slate-700 mt-6 sm:mt-8 pt-5 sm:pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {/* CANCEL */}
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={loading || paymentProcessing}
            className="w-full sm:w-auto px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>

          {/* SAVE */}
          {payment.paymentMode !== "UPI" && (
            <button
              type="submit"
              disabled={
                loading ||
                paymentProcessing ||
                !isDirty ||
                paymentSuccess ||
                !emiAmount
              }
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || paymentProcessing ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Payment
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* =====================================================
          RECEIPT MODAL
      ====================================================== */}
      {showReceipt && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-3 sm:px-4 py-4">
          <div
            id="payment-receipt"
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"
          >
            <div className="bg-blue-600 text-white px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Loan Management System
                  </h2>

                  <p className="text-xs sm:text-sm text-blue-100 mt-1">
                    Payment Receipt
                  </p>
                </div>

                <CheckCircle2
                  size={32}
                  className="shrink-0 sm:w-[38px] sm:h-[38px]"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-green-100 dark:bg-emerald-950 flex items-center justify-center">
                  <CheckCircle2
                    size={30}
                    className="text-green-600 dark:text-emerald-400 sm:w-[34px] sm:h-[34px]"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-emerald-300 mt-3">
                  Payment Successful
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Payment verified successfully
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Loan ID
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 break-all sm:text-right">
                    {payment.loanId}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Customer
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 break-words sm:text-right">
                    {payment.customerName}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    EMI Amount
                  </span>

                  <span className="font-bold text-slate-900 dark:text-slate-200 sm:text-right">
                    ₹{" "}
                    {Number(emiAmount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Due Amount
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 sm:text-right">
                    ₹{" "}
                    {Number(dueAmount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Overdue Amount
                  </span>

                  <span className="font-medium text-red-600 dark:text-red-300 sm:text-right">
                    ₹{" "}
                    {Number(overdueAmount).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Payment Mode
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 break-words sm:text-right">
                    {payment.paymentMode}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Payment Date
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 sm:text-right">
                    {payment.paymentDate}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Payment ID
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 sm:text-right break-all">
                    {cashfreePaymentId ||
                      createdPaymentId ||
                      "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Receipt Number
                  </span>

                  <span className="font-medium text-slate-900 dark:text-slate-200 break-all sm:text-right">
                    {receiptNumber || "-"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 px-4 py-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </span>

                  <span className="font-semibold text-green-600 dark:text-emerald-400">
                    SUCCESS
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-5">
                Thank you for your payment.
              </p>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowReceipt(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BROWSER BACK LEAVE MODAL
      ====================================================== */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 px-3 sm:px-4 py-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 mb-4">
              <AlertTriangle
                size={24}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              Leave without saving?
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-6">
              You have unsaved changes in this payment form.
              If you leave this page, all the changes you made
              will be lost.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleStay}
                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={handleLeaveWithoutSave}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Leave without Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRINT CSS
      ====================================================== */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }

            #payment-receipt,
            #payment-receipt * {
              visibility: visible !important;
            }

            #payment-receipt {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            #payment-receipt button {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default PaymentForm;