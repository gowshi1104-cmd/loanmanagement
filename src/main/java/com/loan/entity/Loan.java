package com.loan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "loans",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_loan_id",
                        columnNames = "loan_id"
                )
        }
)
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // LOAN ID
    // =========================================================

    @Column(
            name = "loan_id",
            unique = true,
            nullable = false,
            length = 8
    )
    private String loanId;

    // =========================================================
    // CUSTOMER DETAILS
    // =========================================================

    @Column(nullable = false)
    private String customerId;

    private String customerName;

    // =========================================================
    // CUSTOMER DOCUMENTS
    // =========================================================

    @Column(
            nullable = false,
            length = 12
    )
    private String aadhaarNumber;

    @Column(length = 10)
    private String panNumber;

    // =========================================================
    // NOMINEE DETAILS
    // =========================================================

    @Column(nullable = false)
    private String nomineeName;

    @Column(nullable = false)
    private String nomineeRelationship;

    @Column(
            nullable = false,
            length = 15
    )
    private String nomineeMobile;

    @Column(length = 12)
    private String nomineeAadhaarNumber;

    

    // =========================================================
    // INCOME DETAILS
    // =========================================================

    private Double monthlyIncome;

    @Column(name = "income_proof_file_name")
    private String incomeProofFileName;

    // =========================================================
    // LOAN DETAILS
    // =========================================================

    private Double loanAmount;

    private Double interestRate;

    private Integer tenureMonths;

    private Double emiAmount;

    // =========================================================
    // DATES
    // =========================================================

    private LocalDate loanDate;

    private LocalDate nextEmiDate;

    private LocalDate disbursalExpectedDate;

    // =========================================================
    // STATUS
    // =========================================================

    private String status;

    // =========================================================
    // CREATED BY
    // =========================================================
    /*
     * Stores the STAFF user who created this loan.
     *
     * This is required for notification:
     *
     * STAFF creates loan
     *        ↓
     * ADMIN / MANAGER notified
     *
     * ADMIN / MANAGER approves/rejects
     *        ↓
     * Original STAFF notified
     */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    @JsonIgnore
    private User createdBy;

    

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Loan() {
    }

    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =========================================================
    // LOAN ID
    // =========================================================

    public String getLoanId() {
        return loanId;
    }

    public void setLoanId(String loanId) {
        this.loanId = loanId;
    }

    // =========================================================
    // CUSTOMER ID
    // =========================================================

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    // =========================================================
    // CUSTOMER NAME
    // =========================================================

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    // =========================================================
    // AADHAAR
    // =========================================================

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }

    // =========================================================
    // PAN
    // =========================================================

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    // =========================================================
    // NOMINEE NAME
    // =========================================================

    public String getNomineeName() {
        return nomineeName;
    }

    public void setNomineeName(String nomineeName) {
        this.nomineeName = nomineeName;
    }

    // =========================================================
    // NOMINEE RELATIONSHIP
    // =========================================================

    public String getNomineeRelationship() {
        return nomineeRelationship;
    }

    public void setNomineeRelationship(String nomineeRelationship) {
        this.nomineeRelationship = nomineeRelationship;
    }

    // =========================================================
    // NOMINEE MOBILE
    // =========================================================

    public String getNomineeMobile() {
        return nomineeMobile;
    }

    public void setNomineeMobile(String nomineeMobile) {
        this.nomineeMobile = nomineeMobile;
    }

    // =========================================================
    // NOMINEE AADHAAR
    // =========================================================

    public String getNomineeAadhaarNumber() {
        return nomineeAadhaarNumber;
    }

    public void setNomineeAadhaarNumber(
            String nomineeAadhaarNumber) {

        this.nomineeAadhaarNumber = nomineeAadhaarNumber;
    }

    // =========================================================
    // MONTHLY INCOME
    // =========================================================

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    // =========================================================
    // INCOME PROOF
    // =========================================================

    public String getIncomeProofFileName() {
        return incomeProofFileName;
    }

    public void setIncomeProofFileName(
            String incomeProofFileName) {

        this.incomeProofFileName = incomeProofFileName;
    }

    // =========================================================
    // LOAN AMOUNT
    // =========================================================

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    // =========================================================
    // INTEREST RATE
    // =========================================================

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    // =========================================================
    // TENURE
    // =========================================================

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    // =========================================================
    // EMI
    // =========================================================

    public Double getEmiAmount() {
        return emiAmount;
    }

    public void setEmiAmount(Double emiAmount) {
        this.emiAmount = emiAmount;
    }

    // =========================================================
    // LOAN DATE
    // =========================================================

    public LocalDate getLoanDate() {
        return loanDate;
    }

    public void setLoanDate(LocalDate loanDate) {
        this.loanDate = loanDate;
    }

    // =========================================================
    // NEXT EMI DATE
    // =========================================================

    public LocalDate getNextEmiDate() {
        return nextEmiDate;
    }

    public void setNextEmiDate(LocalDate nextEmiDate) {
        this.nextEmiDate = nextEmiDate;
    }

    // =========================================================
    // DISBURSAL EXPECTED DATE
    // =========================================================

    public LocalDate getDisbursalExpectedDate() {
        return disbursalExpectedDate;
    }

    public void setDisbursalExpectedDate(
            LocalDate disbursalExpectedDate) {

        this.disbursalExpectedDate = disbursalExpectedDate;
    }

    // =========================================================
    // STATUS
    // =========================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // =========================================================
    // CREATED BY
    // =========================================================

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}