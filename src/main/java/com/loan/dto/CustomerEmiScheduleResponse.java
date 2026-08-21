package com.loan.dto;

public class CustomerEmiScheduleResponse {

    private String loanId;
    private Integer emiNumber;

    // EMI date
    private String emiDate;

    // Added for compatibility with CustomerDashboardService
    private String dueDate;

    private Double emiAmount;
    private Double paidAmount;
    private Double dueAmount;

    private String status;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public CustomerEmiScheduleResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public CustomerEmiScheduleResponse(
            String loanId,
            Integer emiNumber,
            String emiDate,
            Double emiAmount,
            Double paidAmount,
            Double dueAmount,
            String status) {

        this.loanId = loanId;
        this.emiNumber = emiNumber;
        this.emiDate = emiDate;
        this.dueDate = emiDate;
        this.emiAmount = emiAmount;
        this.paidAmount = paidAmount;
        this.dueAmount = dueAmount;
        this.status = status;
    }

    // =========================================================
    // LOAN ID
    // =========================================================

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(String loanId) {
        this.loanId = loanId;
    }

    // =========================================================
    // EMI NUMBER
    // =========================================================

    public Integer getEmiNumber() {
        return emiNumber;
    }

    public void setEmiNumber(Integer emiNumber) {
        this.emiNumber = emiNumber;
    }

    // =========================================================
    // EMI DATE
    // =========================================================

    public String getEmiDate() {
        return emiDate;
    }

    public void setEmiDate(String emiDate) {
        this.emiDate = emiDate;

        // Keep dueDate synchronized
        this.dueDate = emiDate;
    }

    // =========================================================
    // DUE DATE
    // =========================================================

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;

        // Keep emiDate synchronized
        this.emiDate = dueDate;
    }

    // =========================================================
    // EMI AMOUNT
    // =========================================================

    public Double getEmiAmount() {
        return emiAmount;
    }

    public void setEmiAmount(Double emiAmount) {
        this.emiAmount = emiAmount;
    }

    // =========================================================
    // PAID AMOUNT
    // =========================================================

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    // =========================================================
    // DUE AMOUNT
    // =========================================================

    public Double getDueAmount() {
        return dueAmount;
    }

    public void setDueAmount(Double dueAmount) {
        this.dueAmount = dueAmount;
    }

    // =========================================================
    // STATUS
    // =========================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}