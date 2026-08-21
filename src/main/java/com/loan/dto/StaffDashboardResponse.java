package com.loan.dto;

import com.loan.entity.Loan;

import java.util.List;

public class StaffDashboardResponse {

    // =========================================================
    // STAFF DETAILS
    // =========================================================

    private String staffName;
    private String username;

    // =========================================================
    // LOAN COUNTS
    // =========================================================

    private long totalLoans;
    private long pendingLoans;
    private long approvedLoans;
    private long rejectedLoans;
    private long activeLoans;
    private long completedLoans;

    // =========================================================
    // LOAN AMOUNTS
    // =========================================================

    private double totalLoanAmount;
    private double approvedLoanAmount;
    private double activeLoanAmount;

    // =========================================================
    // RECENT LOANS
    // =========================================================

    private List<Loan> recentLoans;

    public StaffDashboardResponse() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public String getStaffName() {
        return staffName;
    }

    public String getUsername() {
        return username;
    }

    public long getTotalLoans() {
        return totalLoans;
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

    public double getTotalLoanAmount() {
        return totalLoanAmount;
    }

    public double getApprovedLoanAmount() {
        return approvedLoanAmount;
    }

    public double getActiveLoanAmount() {
        return activeLoanAmount;
    }

    public List<Loan> getRecentLoans() {
        return recentLoans;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setTotalLoans(long totalLoans) {
        this.totalLoans = totalLoans;
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

    public void setTotalLoanAmount(double totalLoanAmount) {
        this.totalLoanAmount = totalLoanAmount;
    }

    public void setApprovedLoanAmount(double approvedLoanAmount) {
        this.approvedLoanAmount = approvedLoanAmount;
    }

    public void setActiveLoanAmount(double activeLoanAmount) {
        this.activeLoanAmount = activeLoanAmount;
    }

    public void setRecentLoans(List<Loan> recentLoans) {
        this.recentLoans = recentLoans;
    }
}