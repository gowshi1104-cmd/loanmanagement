package com.loan.dto;

public class RazorpayQrResponse {

    private Long paymentId;

    private String qrId;

    private String imageUrl;

    private String imageContent;

    private Double amount;

    private String currency;

    private String status;

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getPaymentId() {
        return paymentId;
    }

    public String getQrId() {
        return qrId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getImageContent() {
        return imageContent;
    }

    public Double getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
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

    public void setQrId(String qrId) {
        this.qrId = qrId;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setImageContent(String imageContent) {
        this.imageContent = imageContent;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}