package com.loan.dto;

import java.util.List;

public class MemberHistoryResponse {

    // =========================================================
    // MEMBER DETAILS
    // =========================================================

    private String customerId;
    private String customerName;
    private String phone;
    private String groupName;
    private String memberStatus;

    // =========================================================
    // LOAN SUMMARY
    // =========================================================

    private Integer totalLoans;
    private Double totalLoanAmount;
    private Double totalPaidAmount;
    private Double totalDueAmount;
    private Double totalOverdueAmount;

    // =========================================================
    // LOANS
    // =========================================================

    private List<LoanHistory> loans;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MemberHistoryResponse() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public String getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public String getGroupName() {
        return groupName;
    }

    public String getMemberStatus() {
        return memberStatus;
    }

    public Integer getTotalLoans() {
        return totalLoans;
    }

    public Double getTotalLoanAmount() {
        return totalLoanAmount;
    }

    public Double getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public Double getTotalDueAmount() {
        return totalDueAmount;
    }

    public Double getTotalOverdueAmount() {
        return totalOverdueAmount;
    }

    public List<LoanHistory> getLoans() {
        return loans;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public void setMemberStatus(String memberStatus) {
        this.memberStatus = memberStatus;
    }

    public void setTotalLoans(Integer totalLoans) {
        this.totalLoans = totalLoans;
    }

    public void setTotalLoanAmount(Double totalLoanAmount) {
        this.totalLoanAmount = totalLoanAmount;
    }

    public void setTotalPaidAmount(Double totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public void setTotalDueAmount(Double totalDueAmount) {
        this.totalDueAmount = totalDueAmount;
    }

    public void setTotalOverdueAmount(Double totalOverdueAmount) {
        this.totalOverdueAmount = totalOverdueAmount;
    }

    public void setLoans(List<LoanHistory> loans) {
        this.loans = loans;
    }

    // =========================================================
    // LOAN HISTORY
    // =========================================================

    public static class LoanHistory {

        private String loanId;
        private Double loanAmount;
        private Double interestRate;
        private Integer tenureMonths;
        private Double emiAmount;
        private String loanDate;
        private String nextEmiDate;
        private String loanStatus;

        private Integer paidEmis;
        private Integer remainingEmis;

        private Double totalPaidAmount;
        private Double totalDueAmount;
        private Double overdueAmount;

        // Paid EMI history
        private List<PaymentHistory> payments;

        // Upcoming EMI schedule
        private List<UpcomingPayment> upcomingPayments;

        // =====================================================
        // CONSTRUCTOR
        // =====================================================

        public LoanHistory() {
        }

        // =====================================================
        // GETTERS
        // =====================================================

        public String getLoanId() {
            return loanId;
        }

        public Double getLoanAmount() {
            return loanAmount;
        }

        public Double getInterestRate() {
            return interestRate;
        }

        public Integer getTenureMonths() {
            return tenureMonths;
        }

        public Double getEmiAmount() {
            return emiAmount;
        }

        public String getLoanDate() {
            return loanDate;
        }

        public String getNextEmiDate() {
            return nextEmiDate;
        }

        public String getLoanStatus() {
            return loanStatus;
        }

        public Integer getPaidEmis() {
            return paidEmis;
        }

        public Integer getRemainingEmis() {
            return remainingEmis;
        }

        public Double getTotalPaidAmount() {
            return totalPaidAmount;
        }

        public Double getTotalDueAmount() {
            return totalDueAmount;
        }

        public Double getOverdueAmount() {
            return overdueAmount;
        }

        public List<PaymentHistory> getPayments() {
            return payments;
        }

        public List<UpcomingPayment> getUpcomingPayments() {
            return upcomingPayments;
        }

        // =====================================================
        // SETTERS
        // =====================================================

        public void setLoanId(String loanId) {
            this.loanId = loanId;
        }

        public void setLoanAmount(Double loanAmount) {
            this.loanAmount = loanAmount;
        }

        public void setInterestRate(Double interestRate) {
            this.interestRate = interestRate;
        }

        public void setTenureMonths(Integer tenureMonths) {
            this.tenureMonths = tenureMonths;
        }

        public void setEmiAmount(Double emiAmount) {
            this.emiAmount = emiAmount;
        }

        public void setLoanDate(String loanDate) {
            this.loanDate = loanDate;
        }

        public void setNextEmiDate(String nextEmiDate) {
            this.nextEmiDate = nextEmiDate;
        }

        public void setLoanStatus(String loanStatus) {
            this.loanStatus = loanStatus;
        }

        public void setPaidEmis(Integer paidEmis) {
            this.paidEmis = paidEmis;
        }

        public void setRemainingEmis(Integer remainingEmis) {
            this.remainingEmis = remainingEmis;
        }

        public void setTotalPaidAmount(Double totalPaidAmount) {
            this.totalPaidAmount = totalPaidAmount;
        }

        public void setTotalDueAmount(Double totalDueAmount) {
            this.totalDueAmount = totalDueAmount;
        }

        public void setOverdueAmount(Double overdueAmount) {
            this.overdueAmount = overdueAmount;
        }

        public void setPayments(List<PaymentHistory> payments) {
            this.payments = payments;
        }

        public void setUpcomingPayments(
                List<UpcomingPayment> upcomingPayments) {

            this.upcomingPayments = upcomingPayments;
        }
    }

    // =========================================================
    // PAID PAYMENT HISTORY
    // =========================================================

    public static class PaymentHistory {

        private Long paymentId;
        private Double amount;
        private String paymentDate;
        private String paymentMode;
        private String status;
        private String transactionReference;
        private String receiptNumber;

        public PaymentHistory() {
        }

        // =====================================================
        // GETTERS
        // =====================================================

        public Long getPaymentId() {
            return paymentId;
        }

        public Double getAmount() {
            return amount;
        }

        public String getPaymentDate() {
            return paymentDate;
        }

        public String getPaymentMode() {
            return paymentMode;
        }

        public String getStatus() {
            return status;
        }

        public String getTransactionReference() {
            return transactionReference;
        }

        public String getReceiptNumber() {
            return receiptNumber;
        }

        // =====================================================
        // SETTERS
        // =====================================================

        public void setPaymentId(Long paymentId) {
            this.paymentId = paymentId;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public void setPaymentDate(String paymentDate) {
            this.paymentDate = paymentDate;
        }

        public void setPaymentMode(String paymentMode) {
            this.paymentMode = paymentMode;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setTransactionReference(
                String transactionReference) {

            this.transactionReference = transactionReference;
        }

        public void setReceiptNumber(String receiptNumber) {
            this.receiptNumber = receiptNumber;
        }
    }

    // =========================================================
    // UPCOMING PAYMENT
    // =========================================================

    public static class UpcomingPayment {

        private Integer emiNumber;
        private String dueDate;
        private Double emiAmount;
        private String status;

        public UpcomingPayment() {
        }

        // =====================================================
        // GETTERS
        // =====================================================

        public Integer getEmiNumber() {
            return emiNumber;
        }

        public String getDueDate() {
            return dueDate;
        }

        public Double getEmiAmount() {
            return emiAmount;
        }

        public String getStatus() {
            return status;
        }

        // =====================================================
        // SETTERS
        // =====================================================

        public void setEmiNumber(Integer emiNumber) {
            this.emiNumber = emiNumber;
        }

        public void setDueDate(String dueDate) {
            this.dueDate = dueDate;
        }

        public void setEmiAmount(Double emiAmount) {
            this.emiAmount = emiAmount;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}