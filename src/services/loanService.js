import api from "../api/axios";

// =========================================================
// GET ALL LOANS
// =========================================================

export const getLoans = () =>
  api.get("/loans");

// =========================================================
// GET LOAN BY DATABASE ID
// =========================================================

export const getLoanById = (id) =>
  api.get(`/loans/${id}`);

// =========================================================
// GET LOAN BY LOAN ID
// Example: LOAN8570
// =========================================================

export const getLoanByLoanId = (loanId) =>
  api.get(
    `/loans/loan-id/${encodeURIComponent(
      loanId.trim().toUpperCase()
    )}`
  );

// =========================================================
// GET CUSTOMER LOAN HISTORY
// Example: LN001
// =========================================================

export const getCustomerLoans = (customerId) =>
  api.get(
    `/loans/customer/${encodeURIComponent(
      customerId.trim().toUpperCase()
    )}`
  );

// =========================================================
// GET LOANS BY STATUS
// Example: PENDING / APPROVED
// =========================================================

export const getLoansByStatus = (status) =>
  api.get(
    `/loans/status/${encodeURIComponent(
      status.trim().toUpperCase()
    )}`
  );

// =========================================================
// CHECK LOAN ID
// =========================================================

export const checkLoanId = (loanId) =>
  api.get(
    `/loans/check-loan-id/${encodeURIComponent(
      loanId.trim().toUpperCase()
    )}`
  );

// =========================================================
// CREATE LOAN
// =========================================================

export const createLoan = (loan) =>
  api.post("/loans", loan);

// =========================================================
// UPDATE LOAN
// =========================================================

export const updateLoan = (id, loan) =>
  api.put(`/loans/${id}`, loan);

// =========================================================
// GENERATE NOC
// COMPLETED + NOC ELIGIBLE
// =========================================================

export const generateNoc = (id) =>
  api.post(`/loans/${id}/generate-noc`);

// =========================================================
// CLOSE LOAN
// NOC GENERATED
// =========================================================

export const closeLoan = (id) =>
  api.put(`/loans/${id}/close`);

// =========================================================
// DELETE LOAN
// =========================================================

export const deleteLoan = (id) =>
  api.delete(`/loans/${id}`);