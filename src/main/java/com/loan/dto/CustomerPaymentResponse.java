package com.loan.dto;

import java.time.LocalDateTime;

public class CustomerPaymentResponse {

    private Long paymentId;

    private String customerId;

    private String customerName;

    private String loanId;

    private Double amount;

    private String paymentMode;

    private String status;

    private String verificationStatus;

    private String orderId;

    private String cfOrderId;

    private String paymentSessionId;

    private String cashfreePaymentId;

    private String transactionReference;

    private String receiptNumber;

    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public CustomerPaymentResponse() {
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(
            Long paymentId) {

        this.paymentId = paymentId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(
            String customerId) {

        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(
            String customerName) {

        this.customerName = customerName;
    }

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(
            String loanId) {

        this.loanId = loanId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(
            Double amount) {

        this.amount = amount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(
            String paymentMode) {

        this.paymentMode = paymentMode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            String verificationStatus) {

        this.verificationStatus =
                verificationStatus;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(
            String orderId) {

        this.orderId = orderId;
    }

    public String getCfOrderId() {
        return cfOrderId;
    }

    public void setCfOrderId(
            String cfOrderId) {

        this.cfOrderId = cfOrderId;
    }

    public String getPaymentSessionId() {
        return paymentSessionId;
    }

    public void setPaymentSessionId(
            String paymentSessionId) {

        this.paymentSessionId =
                paymentSessionId;
    }

    public String getCashfreePaymentId() {
        return cashfreePaymentId;
    }

    public void setCashfreePaymentId(
            String cashfreePaymentId) {

        this.cashfreePaymentId =
                cashfreePaymentId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(
            LocalDateTime paidAt) {

        this.paidAt = paidAt;
    }
}