import api from "./api";

// =========================================================
// GET ALL PAYMENTS
// ADMIN PORTAL
// =========================================================

export const getAllPayments = async () => {
  const response = await api.get("/payments");

  return Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];
};

// =========================================================
// COMPATIBILITY
// =========================================================

export const getPayments = async () => {
  return getAllPayments();
};

// =========================================================
// GET PAYMENT BY ID
// =========================================================

export const getPaymentById = async (id) => {
  if (!id) {
    throw new Error("Payment ID is required");
  }

  const response = await api.get(`/payments/${id}`);

  return response.data;
};

// =========================================================
// GET PAYMENTS BY LOAN ID
// =========================================================

export const getPaymentsByLoanId = async (loanId) => {
  if (!loanId || !String(loanId).trim()) {
    throw new Error("Loan ID is required");
  }

  const normalizedLoanId = String(loanId)
    .trim()
    .toUpperCase();

  const response = await api.get(
    `/payments/loan/${encodeURIComponent(normalizedLoanId)}`
  );

  return Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];
};

// =========================================================
// GET MEMBER PAYMENT DETAILS
// =========================================================

export const getMemberPaymentDetails = async (loanId) => {
  if (!loanId || !String(loanId).trim()) {
    throw new Error("Loan ID is required");
  }

  const normalizedLoanId = String(loanId)
    .trim()
    .toUpperCase();

  const response = await api.get(
    `/payments/member/${encodeURIComponent(normalizedLoanId)}`
  );

  return response.data;
};

// =========================================================
// GET CUSTOMER PAYMENT HISTORY
// =========================================================
// BACKEND:
// GET /api/payment-history/{loanId}
//
// IMPORTANT:
// Backend returns ONE PaymentHistoryResponse object.
// =========================================================

export const getPaymentHistory = async (loanId) => {
  if (!loanId || !String(loanId).trim()) {
    throw new Error("Loan ID is required");
  }

  const normalizedLoanId = String(loanId)
    .trim()
    .toUpperCase();

  const response = await api.get(
    `/payment-history/${encodeURIComponent(normalizedLoanId)}`
  );

  return response.data;
};

// =========================================================
// CUSTOMER COMPATIBILITY ALIAS
// =========================================================

export const getMyPaymentHistory = async (loanId) => {
  return getPaymentHistory(loanId);
};

// =========================================================
// CREATE PAYMENT
// =========================================================

export const createPayment = async (paymentData) => {
  if (!paymentData) {
    throw new Error("Payment data is required");
  }

  if (
    !paymentData.loanId ||
    !String(paymentData.loanId).trim()
  ) {
    throw new Error("Loan ID is required");
  }

  const payload = {
    ...paymentData,
    loanId: String(paymentData.loanId)
      .trim()
      .toUpperCase(),
  };

  const response = await api.post(
    "/payments",
    payload
  );

  return response.data;
};

// =========================================================
// UPDATE PAYMENT
// =========================================================

export const updatePayment = async (
  id,
  paymentData
) => {
  if (!id) {
    throw new Error("Payment ID is required");
  }

  if (!paymentData) {
    throw new Error("Payment data is required");
  }

  const payload = {
    ...paymentData,
  };

  if (payload.loanId) {
    payload.loanId = String(payload.loanId)
      .trim()
      .toUpperCase();
  }

  if (payload.memberId) {
    payload.memberId = String(payload.memberId)
      .trim()
      .toUpperCase();
  }

  const response = await api.put(
    `/payments/${id}`,
    payload
  );

  return response.data;
};

// =========================================================
// DELETE PAYMENT
// =========================================================

export const deletePayment = async (id) => {
  if (!id) {
    throw new Error("Payment ID is required");
  }

  const response = await api.delete(
    `/payments/${id}`
  );

  return response.data;
};

// =========================================================
// CREATE CASHFREE ORDER
// =========================================================

export const createCashfreeOrder = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  const response = await api.post(
    `/payments/${paymentId}/cashfree/order`
  );

  return response.data;
};

// =========================================================
// CHECK CASHFREE PAYMENT STATUS
// =========================================================

export const checkCashfreePaymentStatus = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  const response = await api.get(
    `/payments/${paymentId}/cashfree/status`
  );

  return response.data;
};

// =========================================================
// DEFAULT EXPORT
// =========================================================

const paymentService = {
  getPayments,
  getAllPayments,
  getPaymentById,
  getPaymentsByLoanId,
  getMemberPaymentDetails,
  getPaymentHistory,
  getMyPaymentHistory,
  createPayment,
  updatePayment,
  deletePayment,
  createCashfreeOrder,
  checkCashfreePaymentStatus,
};

export default paymentService;