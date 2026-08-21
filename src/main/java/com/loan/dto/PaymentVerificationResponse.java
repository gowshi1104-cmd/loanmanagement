package com.loan.dto;

public class PaymentVerificationResponse {

    // =========================================================
    // PAYMENT DETAILS
    // =========================================================

    private Long paymentId;

    private String customerName;

    private Double amount;

    private String paymentDate;

    private String paymentMode;

    private String status;

    // =========================================================
    // VERIFICATION DETAILS
    // =========================================================

    private String verificationStatus;

    private String transactionReference;

    // =========================================================
    // RECEIPT
    // =========================================================

    private String receiptNumber;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentVerificationResponse() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getPaymentId() {
        return paymentId;
    }

    public String getCustomerName() {
        return customerName;
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

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }
}