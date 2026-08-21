package com.loan.dto;

public class PaymentErrorResponse {

    private String message;

    public PaymentErrorResponse() {
    }

    public PaymentErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}