package com.loan.dto;

public class PaymentRequest {

    private String memberId;

    private Double amount;

    private String paymentDate;

    private String paymentMode;

    private String upiOption;

    private String upiId;

    private String receivedBy;

    private String accountNumber;

    private String ifscCode;

    private String bankName;

    private String transactionReference;

    public PaymentRequest() {
    }

    public String getMemberId() {
        return memberId;
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

    public String getUpiOption() {
        return upiOption;
    }

    public String getUpiId() {
        return upiId;
    }

    public String getReceivedBy() {
        return receivedBy;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public String getBankName() {
        return bankName;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
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

    public void setUpiOption(String upiOption) {
        this.upiOption = upiOption;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public void setReceivedBy(String receivedBy) {
        this.receivedBy = receivedBy;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }
}