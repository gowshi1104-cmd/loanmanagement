import api from "../api/axios";

// =========================================================
// CUSTOMER DASHBOARD
// =========================================================

export const getCustomerDashboard = async () => {
  const response = await api.get("/customer/dashboard");

  return response.data;
};

// =========================================================
// MY LOANS
// =========================================================

export const getMyLoans = () => {
  return api.get("/customer/loans");
};

// =========================================================
// MY EMI SCHEDULE
// =========================================================

export const getMyEmiSchedule = () => {
  return api.get("/customer/emi-schedule");
};

// =========================================================
// MY PAYMENT HISTORY
// =========================================================

export const getMyPaymentHistory = () => {
  return api.get("/customer/payment-history");
};