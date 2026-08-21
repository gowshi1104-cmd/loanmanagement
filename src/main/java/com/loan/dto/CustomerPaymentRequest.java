package com.loan.dto;

public class CustomerPaymentRequest {

    private String loanId;

    public CustomerPaymentRequest() {
    }

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(
            String loanId) {

        this.loanId = loanId;
    }
}