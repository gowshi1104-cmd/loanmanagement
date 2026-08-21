package com.loan.dto;

import java.util.List;

public class PaymentHistoryResponse {

    // =========================================================
    // CUSTOMER DETAILS
    // =========================================================

    private String customerId;
    private String customerName;
    private String phone;

    // =========================================================
    // LOAN DETAILS
    // =========================================================

    private String loanId;
    private Double loanAmount;
    private Double emiAmount;
    private Double interestRate;
    private Integer tenureMonths;
    private String loanDate;
    private String loanStatus;

    // =========================================================
    // PAYMENT SUMMARY
    // =========================================================

    private Integer paidEmis;
    private Integer remainingEmis;

    private Double totalPaidAmount;
    private Double totalDueAmount;
    private Double overdueAmount;

    private String nextEmiDate;

    // =========================================================
    // PAYMENT HISTORY
    // =========================================================

    private List<PaymentHistoryItem> paidPayments;

    // =========================================================
    // UPCOMING PAYMENTS
    // =========================================================

    private List<UpcomingPaymentItem> upcomingPayments;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentHistoryResponse() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(String loanId) {
        this.loanId = loanId;
    }

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Double getEmiAmount() {
        return emiAmount;
    }

    public void setEmiAmount(Double emiAmount) {
        this.emiAmount = emiAmount;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public String getLoanDate() {
        return loanDate;
    }

    public void setLoanDate(String loanDate) {
        this.loanDate = loanDate;
    }

    public String getLoanStatus() {
        return loanStatus;
    }

    public void setLoanStatus(String loanStatus) {
        this.loanStatus = loanStatus;
    }

    public Integer getPaidEmis() {
        return paidEmis;
    }

    public void setPaidEmis(Integer paidEmis) {
        this.paidEmis = paidEmis;
    }

    public Integer getRemainingEmis() {
        return remainingEmis;
    }

    public void setRemainingEmis(Integer remainingEmis) {
        this.remainingEmis = remainingEmis;
    }

    public Double getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(Double totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public Double getTotalDueAmount() {
        return totalDueAmount;
    }

    public void setTotalDueAmount(Double totalDueAmount) {
        this.totalDueAmount = totalDueAmount;
    }

    public Double getOverdueAmount() {
        return overdueAmount;
    }

    public void setOverdueAmount(Double overdueAmount) {
        this.overdueAmount = overdueAmount;
    }

    public String getNextEmiDate() {
        return nextEmiDate;
    }

    public void setNextEmiDate(String nextEmiDate) {
        this.nextEmiDate = nextEmiDate;
    }

    public List<PaymentHistoryItem> getPaidPayments() {
        return paidPayments;
    }

    public void setPaidPayments(
            List<PaymentHistoryItem> paidPayments) {

        this.paidPayments = paidPayments;
    }

    public List<UpcomingPaymentItem> getUpcomingPayments() {
        return upcomingPayments;
    }

    public void setUpcomingPayments(
            List<UpcomingPaymentItem> upcomingPayments) {

        this.upcomingPayments = upcomingPayments;
    }

    // =========================================================
    // PAID PAYMENT ITEM
    // =========================================================

    public static class PaymentHistoryItem {

        private Long paymentId;
        private Integer emiNumber;
        private String paymentDate;
        private Double amount;
        private String paymentMode;
        private String status;
        private String transactionReference;
        private String receiptNumber;

        public PaymentHistoryItem() {
        }

        public Long getPaymentId() {
            return paymentId;
        }

        public void setPaymentId(Long paymentId) {
            this.paymentId = paymentId;
        }

        public Integer getEmiNumber() {
            return emiNumber;
        }

        public void setEmiNumber(Integer emiNumber) {
            this.emiNumber = emiNumber;
        }

        public String getPaymentDate() {
            return paymentDate;
        }

        public void setPaymentDate(String paymentDate) {
            this.paymentDate = paymentDate;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getPaymentMode() {
            return paymentMode;
        }

        public void setPaymentMode(String paymentMode) {
            this.paymentMode = paymentMode;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getTransactionReference() {
            return transactionReference;
        }

        public void setTransactionReference(
                String transactionReference) {

            this.transactionReference =
                    transactionReference;
        }

        public String getReceiptNumber() {
            return receiptNumber;
        }

        public void setReceiptNumber(
                String receiptNumber) {

            this.receiptNumber =
                    receiptNumber;
        }
    }

    // =========================================================
    // UPCOMING PAYMENT ITEM
    // =========================================================

    public static class UpcomingPaymentItem {

        private Integer emiNumber;
        private String dueDate;
        private Double emiAmount;
        private String status;

        public UpcomingPaymentItem() {
        }

        public Integer getEmiNumber() {
            return emiNumber;
        }

        public void setEmiNumber(Integer emiNumber) {
            this.emiNumber = emiNumber;
        }

        public String getDueDate() {
            return dueDate;
        }

        public void setDueDate(String dueDate) {
            this.dueDate = dueDate;
        }

        public Double getEmiAmount() {
            return emiAmount;
        }

        public void setEmiAmount(Double emiAmount) {
            this.emiAmount = emiAmount;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}