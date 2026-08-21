package com.loan.dto;

public class MemberPaymentDetailsResponse {

    private String memberId;

    private String customerName;

    private String phone;

    private Double dueAmount;

    public MemberPaymentDetailsResponse() {
    }

    public String getMemberId() {
        return memberId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getPhone() {
        return phone;
    }

    public Double getDueAmount() {
        return dueAmount;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setDueAmount(Double dueAmount) {
        this.dueAmount = dueAmount;
    }
}