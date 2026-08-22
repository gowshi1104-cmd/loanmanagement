package com.loan.dto;

import java.time.LocalDate;
import java.util.List;

public class ManagerDashboardResponse {

    // =========================================================
    // ORGANIZATION OVERVIEW
    // =========================================================

    private long totalCustomers;

    private long totalStaff;

    private long totalLoans;

    private long totalGroups;


    // =========================================================
    // MY TEAM
    // =========================================================

    private long activeStaff;

    private long inactiveStaff;


    // =========================================================
    // LOAN OVERVIEW
    // =========================================================

    private long pendingLoans;

    private long approvedLoans;

    private long rejectedLoans;

    private long activeLoans;

    private long completedLoans;


    // =========================================================
    // PAYMENT OVERVIEW
    // =========================================================

    private double totalCollected;

    private long successfulPayments;

    private long pendingPayments;

    private long failedPayments;


    // =========================================================
    // RECENT LOANS
    // =========================================================

    private List<RecentLoanResponse> recentLoans;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ManagerDashboardResponse() {
    }


    public ManagerDashboardResponse(

            long totalCustomers,

            long totalStaff,

            long totalLoans,

            long totalGroups,

            long activeStaff,

            long inactiveStaff,

            long pendingLoans,

            long approvedLoans,

            long rejectedLoans,

            long activeLoans,

            long completedLoans,

            double totalCollected,

            long successfulPayments,

            long pendingPayments,

            long failedPayments,

            List<RecentLoanResponse> recentLoans
    ) {

        this.totalCustomers = totalCustomers;

        this.totalStaff = totalStaff;

        this.totalLoans = totalLoans;

        this.totalGroups = totalGroups;

        this.activeStaff = activeStaff;

        this.inactiveStaff = inactiveStaff;

        this.pendingLoans = pendingLoans;

        this.approvedLoans = approvedLoans;

        this.rejectedLoans = rejectedLoans;

        this.activeLoans = activeLoans;

        this.completedLoans = completedLoans;

        this.totalCollected = totalCollected;

        this.successfulPayments = successfulPayments;

        this.pendingPayments = pendingPayments;

        this.failedPayments = failedPayments;

        this.recentLoans = recentLoans;
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public long getTotalCustomers() {
        return totalCustomers;
    }


    public long getTotalStaff() {
        return totalStaff;
    }


    public long getTotalLoans() {
        return totalLoans;
    }


    public long getTotalGroups() {
        return totalGroups;
    }


    public long getActiveStaff() {
        return activeStaff;
    }


    public long getInactiveStaff() {
        return inactiveStaff;
    }


    public long getPendingLoans() {
        return pendingLoans;
    }


    public long getApprovedLoans() {
        return approvedLoans;
    }


    public long getRejectedLoans() {
        return rejectedLoans;
    }


    public long getActiveLoans() {
        return activeLoans;
    }


    public long getCompletedLoans() {
        return completedLoans;
    }


    public double getTotalCollected() {
        return totalCollected;
    }


    public long getSuccessfulPayments() {
        return successfulPayments;
    }


    public long getPendingPayments() {
        return pendingPayments;
    }


    public long getFailedPayments() {
        return failedPayments;
    }


    public List<RecentLoanResponse> getRecentLoans() {
        return recentLoans;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }


    public void setTotalStaff(long totalStaff) {
        this.totalStaff = totalStaff;
    }


    public void setTotalLoans(long totalLoans) {
        this.totalLoans = totalLoans;
    }


    public void setTotalGroups(long totalGroups) {
        this.totalGroups = totalGroups;
    }


    public void setActiveStaff(long activeStaff) {
        this.activeStaff = activeStaff;
    }


    public void setInactiveStaff(long inactiveStaff) {
        this.inactiveStaff = inactiveStaff;
    }


    public void setPendingLoans(long pendingLoans) {
        this.pendingLoans = pendingLoans;
    }


    public void setApprovedLoans(long approvedLoans) {
        this.approvedLoans = approvedLoans;
    }


    public void setRejectedLoans(long rejectedLoans) {
        this.rejectedLoans = rejectedLoans;
    }


    public void setActiveLoans(long activeLoans) {
        this.activeLoans = activeLoans;
    }


    public void setCompletedLoans(long completedLoans) {
        this.completedLoans = completedLoans;
    }


    public void setTotalCollected(double totalCollected) {
        this.totalCollected = totalCollected;
    }


    public void setSuccessfulPayments(long successfulPayments) {
        this.successfulPayments = successfulPayments;
    }


    public void setPendingPayments(long pendingPayments) {
        this.pendingPayments = pendingPayments;
    }


    public void setFailedPayments(long failedPayments) {
        this.failedPayments = failedPayments;
    }


    public void setRecentLoans(
            List<RecentLoanResponse> recentLoans
    ) {
        this.recentLoans = recentLoans;
    }


    // =========================================================
    // RECENT LOAN RESPONSE
    // =========================================================

    public static class RecentLoanResponse {

        private String loanId;

        private String customerId;

        private String customerName;

        private Double loanAmount;

        private String createdBy;

        private String status;

        private LocalDate loanDate;


        public RecentLoanResponse() {
        }


        public RecentLoanResponse(

                String loanId,

                String customerId,

                String customerName,

                Double loanAmount,

                String createdBy,

                String status,

                LocalDate loanDate
        ) {

            this.loanId = loanId;

            this.customerId = customerId;

            this.customerName = customerName;

            this.loanAmount = loanAmount;

            this.createdBy = createdBy;

            this.status = status;

            this.loanDate = loanDate;
        }


        public String getLoanId() {
            return loanId;
        }


        public void setLoanId(String loanId) {
            this.loanId = loanId;
        }


        public String getCustomerId() {
            return customerId;
        }


        public void setCustomerId(String customerId) {
            this.customerId = customerId;
        }


        public String getCustomerName() {
            return customerName;
        }


        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }


        public Double getLoanAmount() {
            return loanAmount;
        }


        public void setLoanAmount(Double loanAmount) {
            this.loanAmount = loanAmount;
        }


        public String getCreatedBy() {
            return createdBy;
        }


        public void setCreatedBy(String createdBy) {
            this.createdBy = createdBy;
        }


        public String getStatus() {
            return status;
        }


        public void setStatus(String status) {
            this.status = status;
        }


        public LocalDate getLoanDate() {
            return loanDate;
        }


        public void setLoanDate(LocalDate loanDate) {
            this.loanDate = loanDate;
        }
    }
}