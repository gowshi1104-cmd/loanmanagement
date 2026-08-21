package com.loan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // MEMBER / CUSTOMER
    // =========================================================

    private String memberId;

    /*
     * IMPORTANT:
     *
     * memberId = CUSTOMER ID
     * Example: LN001
     */

    private String loanId;

    /*
     * IMPORTANT:
     *
     * loanId = LOAN ID
     * Example: LOAN3919
     */

    private String customerName;

    // =========================================================
    // PAYMENT
    // =========================================================

    private Double amount;

    private String paymentDate;

    private String paymentMode;

    /*
     * SUCCESS
     * PENDING
     * FAILED
     */

    private String status;

    // =========================================================
    // UPI
    // =========================================================

    private String upiOption;

    private String upiId;

    // =========================================================
    // CASH
    // =========================================================

    private String receivedBy;

    // =========================================================
    // BANK TRANSFER
    // =========================================================

    private String accountNumber;

    private String ifscCode;

    private String bankName;

    // =========================================================
    // TRANSACTION
    // =========================================================

    private String transactionReference;

    private String verificationStatus;

    @Column(length = 100)
    private String cashfreeOrderId;

    @Column(length = 500)
    private String cashfreePaymentSessionId;

    @Column(length = 100)
    private String cashfreePaymentId;

    // =========================================================
    // RECEIPT
    // =========================================================

    @Column(unique = true)
    private String receiptNumber;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Payment() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getMemberId() {
        return memberId;
    }

    public String getLoanId() {
        return loanId;
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

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public String getCashfreeOrderId() {
        return cashfreeOrderId;
    }

    public String getCashfreePaymentSessionId() {
        return cashfreePaymentSessionId;
    }

    public String getCashfreePaymentId() {
        return cashfreePaymentId;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public void setLoanId(String loanId) {
        this.loanId = loanId;
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

    public void setTransactionReference(
            String transactionReference) {

        this.transactionReference =
                transactionReference;
    }

    public void setVerificationStatus(
            String verificationStatus) {

        this.verificationStatus =
                verificationStatus;
    }

    public void setCashfreeOrderId(
            String cashfreeOrderId) {

        this.cashfreeOrderId =
                cashfreeOrderId;
    }

    public void setCashfreePaymentSessionId(
            String cashfreePaymentSessionId) {

        this.cashfreePaymentSessionId =
                cashfreePaymentSessionId;
    }

    public void setCashfreePaymentId(
            String cashfreePaymentId) {

        this.cashfreePaymentId =
                cashfreePaymentId;
    }

    public void setReceiptNumber(
            String receiptNumber) {

        this.receiptNumber =
                receiptNumber;
    }
}