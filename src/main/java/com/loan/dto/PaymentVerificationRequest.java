package com.loan.dto;

public class PaymentVerificationRequest {

    private Long paymentId;

    // =========================================================
    // RAZORPAY
    // =========================================================

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;

    // =========================================================
    // BACKWARD COMPATIBILITY
    // =========================================================

    private String gatewayPaymentId;
    private String gatewayOrderId;
    private String transactionId;
    private String status;

    public PaymentVerificationRequest() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getPaymentId() {
        return paymentId;
    }

    public String getRazorpayPaymentId() {

        if (razorpayPaymentId != null &&
                !razorpayPaymentId.isBlank()) {

            return razorpayPaymentId;
        }

        return gatewayPaymentId;
    }

    public String getRazorpayOrderId() {

        if (razorpayOrderId != null &&
                !razorpayOrderId.isBlank()) {

            return razorpayOrderId;
        }

        return gatewayOrderId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public String getGatewayPaymentId() {
        return gatewayPaymentId;
    }

    public String getGatewayOrderId() {
        return gatewayOrderId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getStatus() {
        return status;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public void setRazorpayPaymentId(
            String razorpayPaymentId) {

        this.razorpayPaymentId =
                razorpayPaymentId;
    }

    public void setRazorpayOrderId(
            String razorpayOrderId) {

        this.razorpayOrderId =
                razorpayOrderId;
    }

    public void setRazorpaySignature(
            String razorpaySignature) {

        this.razorpaySignature =
                razorpaySignature;
    }

    public void setGatewayPaymentId(
            String gatewayPaymentId) {

        this.gatewayPaymentId =
                gatewayPaymentId;
    }

    public void setGatewayOrderId(
            String gatewayOrderId) {

        this.gatewayOrderId =
                gatewayOrderId;
    }

    public void setTransactionId(
            String transactionId) {

        this.transactionId =
                transactionId;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}