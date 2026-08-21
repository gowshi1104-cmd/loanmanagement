import { getMembers } from "./memberService";
import { getLoans } from "./loanService";
import { getGroups } from "./groupService";
import { getAllPayments } from "./paymentService";

// =========================================================
// HELPER
// =========================================================
// Service response direct array-a irundhaalum
// { data: [] } format-la irundhaalum array return pannum.

const normalizeArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// =========================================================
// GET REPORT DATA
// =========================================================

export const getReportData = async () => {
  try {
    const [
      membersRes,
      loansRes,
      groupsRes,
      paymentsRes,
    ] = await Promise.all([
      getMembers(),
      getLoans(),
      getGroups(),
      getAllPayments(),
    ]);

    // =======================================================
    // NORMALIZE API RESPONSES
    // =======================================================

    const members = normalizeArray(membersRes);
    const loans = normalizeArray(loansRes);
    const groups = normalizeArray(groupsRes);
    const payments = normalizeArray(paymentsRes);

    // =======================================================
    // MEMBERS
    // =======================================================

    const totalMembers = members.length;

    const activeMembers = members.filter(
      (member) =>
        String(member?.status || "").toUpperCase() === "ACTIVE"
    ).length;

    // =======================================================
    // GROUPS
    // =======================================================

    const totalGroups = groups.length;

    // =======================================================
    // LOANS
    // =======================================================

    const totalLoans = loans.length;

    const approvedLoans = loans.filter(
      (loan) =>
        String(loan?.status || "").toUpperCase() === "APPROVED"
    ).length;

    const rejectedLoans = loans.filter(
      (loan) =>
        String(loan?.status || "").toUpperCase() === "REJECTED"
    ).length;

    const totalLoanAmount = loans.reduce(
      (sum, loan) => {
        const amount = Number(loan?.loanAmount);

        return sum + (Number.isFinite(amount) ? amount : 0);
      },
      0
    );

    // =======================================================
    // PAYMENTS
    // =======================================================

    const totalPayments = payments.length;

    const totalPaymentAmount = payments.reduce(
      (sum, payment) => {
        const amount = Number(payment?.amount);

        return sum + (Number.isFinite(amount) ? amount : 0);
      },
      0
    );

    // =======================================================
    // RECENT PAYMENTS
    // =======================================================

    const recentPayments = [...payments]
      .sort((a, b) => {
        const dateA = new Date(
          a?.paymentDate || a?.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b?.paymentDate || b?.createdAt || 0
        ).getTime();

        // If dates are unavailable, fallback to ID
        if (
          Number.isNaN(dateA) ||
          Number.isNaN(dateB)
        ) {
          return (
            Number(a?.id || 0) -
            Number(b?.id || 0)
          );
        }

        return dateB - dateA;
      })
      .slice(0, 5);

    // =======================================================
    // DEBUG
    // =======================================================

    console.log("Report Data:", {
      members,
      loans,
      groups,
      payments,

      totalMembers,
      activeMembers,

      totalGroups,

      totalLoans,
      approvedLoans,
      rejectedLoans,
      totalLoanAmount,

      totalPayments,
      totalPaymentAmount,

      recentPayments,
    });

    // =======================================================
    // RETURN
    // =======================================================

    return {
      members,
      groups,
      loans,
      payments,

      totalMembers,
      activeMembers,

      totalGroups,

      totalLoans,
      approvedLoans,
      rejectedLoans,
      totalLoanAmount,

      totalPayments,
      totalPaymentAmount,

      recentPayments,
    };
  } catch (error) {
    console.error(
      "Failed to load report data:",
      error
    );

    throw error;
  }
};

export default {
  getReportData,
};