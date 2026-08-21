package com.loan.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "customer_payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_customer_payment_order_id",
                        columnNames = "cashfree_order_id"
                )
        }
)
public class CustomerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // CUSTOMER
    // =========================================================

    @Column(nullable = false, length = 100)
    private String customerId;

    @Column(nullable = false, length = 100)
    private String customerName;

    // =========================================================
    // LOAN
    // =========================================================

    @Column(nullable = false, length = 100)
    private String loanId;

    // =========================================================
    // EMI PAYMENT
    // =========================================================

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, length = 50)
    private String paymentMode;

    /*
     * PENDING
     * SUCCESS
     * FAILED
     */
    @Column(nullable = false, length = 50)
    private String status;

    /*
     * PENDING
     * VERIFIED
     * FAILED
     */
    @Column(nullable = false, length = 50)
    private String verificationStatus;

    // =========================================================
    // CASHFREE
    // =========================================================

    @Column(
            name = "cashfree_order_id",
            length = 150
    )
    private String cashfreeOrderId;

    @Column(
            name = "cashfree_payment_session_id",
            length = 1000
    )
    private String cashfreePaymentSessionId;

    @Column(
            name = "cashfree_payment_id",
            length = 150
    )
    private String cashfreePaymentId;

    // =========================================================
    // TRANSACTION
    // =========================================================

    @Column(length = 200)
    private String transactionReference;

    // =========================================================
    // RECEIPT
    // =========================================================

    @Column(unique = true, length = 100)
    private String receiptNumber;

    // =========================================================
    // DATES
    // =========================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerPayment() {
    }

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {

            createdAt =
                    LocalDateTime.now();
        }
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getLoanId() {
        return loanId;
    }

    public Double getAmount() {
        return amount;
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

    public String getCashfreeOrderId() {
        return cashfreeOrderId;
    }

    public String getCashfreePaymentSessionId() {
        return cashfreePaymentSessionId;
    }

    public String getCashfreePaymentId() {
        return cashfreePaymentId;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setCustomerId(
            String customerId) {

        this.customerId = customerId;
    }

    public void setCustomerName(
            String customerName) {

        this.customerName = customerName;
    }

    public void setLoanId(
            String loanId) {

        this.loanId = loanId;
    }

    public void setAmount(
            Double amount) {

        this.amount = amount;
    }

    public void setPaymentMode(
            String paymentMode) {

        this.paymentMode = paymentMode;
    }

    public void setStatus(
            String status) {

        this.status = status;
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

    public void setTransactionReference(
            String transactionReference) {

        this.transactionReference =
                transactionReference;
    }

    public void setReceiptNumber(
            String receiptNumber) {

        this.receiptNumber =
                receiptNumber;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    public void setPaidAt(
            LocalDateTime paidAt) {

        this.paidAt = paidAt;
    }
}