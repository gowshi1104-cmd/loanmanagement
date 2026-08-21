package com.loan.dto;

public class CustomerDashboardResponse {

    private long totalLoans;
    private long activeLoans;

    private Double upcomingEmiAmount;
    private String upcomingEmiDate;

    private Double outstandingAmount;
    private Double totalPaidAmount;

    private NextEmi nextEmi;

    public CustomerDashboardResponse() {
    }

    // =========================================================
    // TOTAL LOANS
    // =========================================================

    public long getTotalLoans() {
        return totalLoans;
    }

    public void setTotalLoans(long totalLoans) {
        this.totalLoans = totalLoans;
    }

    // =========================================================
    // ACTIVE LOANS
    // =========================================================

    public long getActiveLoans() {
        return activeLoans;
    }

    public void setActiveLoans(long activeLoans) {
        this.activeLoans = activeLoans;
    }

    // =========================================================
    // UPCOMING EMI AMOUNT
    // =========================================================

    public Double getUpcomingEmiAmount() {
        return upcomingEmiAmount;
    }

    public void setUpcomingEmiAmount(Double upcomingEmiAmount) {
        this.upcomingEmiAmount = upcomingEmiAmount;
    }

    // =========================================================
    // UPCOMING EMI DATE
    // =========================================================

    public String getUpcomingEmiDate() {
        return upcomingEmiDate;
    }

    public void setUpcomingEmiDate(String upcomingEmiDate) {
        this.upcomingEmiDate = upcomingEmiDate;
    }

    // =========================================================
    // OUTSTANDING AMOUNT
    // =========================================================

    public Double getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(Double outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    // =========================================================
    // TOTAL PAID
    // =========================================================

    public Double getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(Double totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    // =========================================================
    // NEXT EMI
    // =========================================================

    public NextEmi getNextEmi() {
        return nextEmi;
    }

    public void setNextEmi(NextEmi nextEmi) {
        this.nextEmi = nextEmi;
    }

    // =========================================================
    // NEXT EMI CLASS
    // =========================================================

    public static class NextEmi {

        private String loanId;
        private Double amount;
        private String date;

        public NextEmi() {
        }

        public NextEmi(
                String loanId,
                Double amount,
                String date) {

            this.loanId = loanId;
            this.amount = amount;
            this.date = date;
        }

        // =====================================================
        // LOAN ID
        // =====================================================

        public String getLoanId() {
            return loanId;
        }

        public void setLoanId(String loanId) {
            this.loanId = loanId;
        }

        // =====================================================
        // AMOUNT
        // =====================================================

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        // =====================================================
        // DATE
        // =====================================================

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }
    }
}