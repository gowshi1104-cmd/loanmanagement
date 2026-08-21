package com.loan.service;

import com.loan.dto.MemberHistoryResponse;
import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Payment;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MemberHistoryService {

    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MemberHistoryService(
            MemberRepository memberRepository,
            LoanRepository loanRepository,
            PaymentRepository paymentRepository) {

        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // GET MEMBER COMPLETE HISTORY
    // =========================================================

    public MemberHistoryResponse getMemberHistory(
            String customerId) {

        if (customerId == null ||
                customerId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer ID is required"
            );
        }

        String normalizedCustomerId =
                customerId.trim().toUpperCase();

        // =====================================================
        // FIND MEMBER
        // =====================================================

        Member member =
                memberRepository
                        .findByCustomerId(
                                normalizedCustomerId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Member not found with ID: "
                                                + normalizedCustomerId
                                )
                        );

        // =====================================================
        // FIND ALL LOANS
        // =====================================================

        List<Loan> loans =
                loanRepository
                        .findByCustomerIdOrderByLoanDateDesc(
                                normalizedCustomerId
                        );

        if (loans == null) {
            loans = new ArrayList<>();
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        MemberHistoryResponse response =
                new MemberHistoryResponse();

        // =====================================================
        // MEMBER DETAILS
        // =====================================================

        response.setCustomerId(
                member.getCustomerId()
        );

        response.setCustomerName(
                member.getName()
        );

        response.setPhone(
                member.getPhone()
        );

        response.setGroupName(
                member.getGroupName()
        );

        response.setMemberStatus(
                member.getStatus()
        );

        // =====================================================
        // SUMMARY
        // =====================================================

        int totalLoans = 0;

        double totalLoanAmount = 0.0;
        double totalPaidAmount = 0.0;
        double totalDueAmount = 0.0;
        double totalOverdueAmount = 0.0;

        List<MemberHistoryResponse.LoanHistory>
                loanHistoryList =
                new ArrayList<>();

        // =====================================================
        // PROCESS EACH LOAN
        // =====================================================

        for (Loan loan : loans) {

            if (loan == null) {
                continue;
            }

            totalLoans++;

            // =================================================
            // LOAN AMOUNT
            // =================================================

            double loanAmount =
                    loan.getLoanAmount() != null
                            ? loan.getLoanAmount()
                            : 0.0;

            totalLoanAmount += loanAmount;

            // =================================================
            // TENURE
            // =================================================

            int tenureMonths =
                    loan.getTenureMonths() != null
                            ? loan.getTenureMonths()
                            : 0;

            // =================================================
            // EMI AMOUNT
            // =================================================

            double emiAmount =
                    loan.getEmiAmount() != null
                            ? loan.getEmiAmount()
                            : 0.0;

            // =================================================
            // PAYMENT HISTORY
            //
            // Only APPROVED loans are considered for payment
            // history.
            // =================================================

            List<Payment> payments =
                    new ArrayList<>();

            if ("APPROVED".equalsIgnoreCase(
                    loan.getStatus())) {

                List<Payment> existingPayments =
                        paymentRepository
                                .findByLoanIdOrderByPaymentDateDesc(
                                        loan.getLoanId()
                                );

                if (existingPayments != null) {
                    payments = existingPayments;
                }
            }

            // =================================================
            // PAYMENT HISTORY DTO
            // =================================================

            List<MemberHistoryResponse.PaymentHistory>
                    paymentHistoryList =
                    new ArrayList<>();

            double loanPaidAmount = 0.0;

            int paidEmis = 0;

            // =================================================
            // PROCESS PAYMENTS
            // =================================================

            for (Payment payment : payments) {

                if (payment == null) {
                    continue;
                }

                // -------------------------------------------------
                // ONLY SUCCESSFUL PAYMENTS COUNT AS PAID
                // -------------------------------------------------

                if ("SUCCESS".equalsIgnoreCase(
                        payment.getStatus())) {

                    if (payment.getAmount() != null) {

                        loanPaidAmount +=
                                payment.getAmount();
                    }

                    paidEmis++;
                }

                // -------------------------------------------------
                // PAYMENT HISTORY ITEM
                // -------------------------------------------------

                MemberHistoryResponse.PaymentHistory
                        paymentHistory =
                        new MemberHistoryResponse
                                .PaymentHistory();

                paymentHistory.setPaymentId(
                        payment.getId()
                );

                paymentHistory.setAmount(
                        payment.getAmount()
                );

                paymentHistory.setPaymentDate(
                        payment.getPaymentDate()
                );

                paymentHistory.setPaymentMode(
                        payment.getPaymentMode()
                );

                paymentHistory.setStatus(
                        payment.getStatus()
                );

                paymentHistory.setTransactionReference(
                        payment.getTransactionReference()
                );

                paymentHistory.setReceiptNumber(
                        payment.getReceiptNumber()
                );

                paymentHistoryList.add(
                        paymentHistory
                );
            }

            // =================================================
            // LATEST PAYMENT FIRST
            // =================================================

            paymentHistoryList.sort(
                    Comparator.comparing(
                            MemberHistoryResponse.PaymentHistory::getPaymentDate,
                            Comparator.nullsLast(
                                    Comparator.reverseOrder()
                            )
                    )
            );

            // =================================================
            // TOTAL PAYABLE AMOUNT
            //
            // EMI × Tenure
            // =================================================

            double totalPayableAmount =
                    emiAmount * tenureMonths;

            // =================================================
            // TOTAL DUE AMOUNT
            // =================================================

            double loanDueAmount =
                    totalPayableAmount -
                            loanPaidAmount;

            if (loanDueAmount < 0) {
                loanDueAmount = 0.0;
            }

            // =================================================
            // REMAINING EMIS
            // =================================================

            int remainingEmis =
                    tenureMonths - paidEmis;

            if (remainingEmis < 0) {
                remainingEmis = 0;
            }

            // =================================================
            // UPCOMING EMI SCHEDULE
            // =================================================

            List<MemberHistoryResponse.UpcomingPayment>
                    upcomingPaymentList =
                    buildUpcomingPayments(
                            loan,
                            paidEmis,
                            tenureMonths
                    );

            // =================================================
            // OVERDUE AMOUNT
            // =================================================

            double overdueAmount =
                    calculateOverdueAmount(
                            upcomingPaymentList
                    );

            // =================================================
            // MEMBER TOTALS
            // =================================================

            totalPaidAmount +=
                    loanPaidAmount;

            totalDueAmount +=
                    loanDueAmount;

            totalOverdueAmount +=
                    overdueAmount;

            // =================================================
            // LOAN HISTORY
            // =================================================

            MemberHistoryResponse.LoanHistory
                    loanHistory =
                    new MemberHistoryResponse.LoanHistory();

            loanHistory.setLoanId(
                    loan.getLoanId()
            );

            loanHistory.setLoanAmount(
                    loan.getLoanAmount()
            );

            loanHistory.setInterestRate(
                    loan.getInterestRate()
            );

            loanHistory.setTenureMonths(
                    loan.getTenureMonths()
            );

            loanHistory.setEmiAmount(
                    loan.getEmiAmount()
            );

            // =================================================
            // DATES
            // =================================================

            loanHistory.setLoanDate(
                    loan.getLoanDate() != null
                            ? loan.getLoanDate().toString()
                            : null
            );

            loanHistory.setNextEmiDate(
                    loan.getNextEmiDate() != null
                            ? loan.getNextEmiDate().toString()
                            : null
            );

            loanHistory.setLoanStatus(
                    loan.getStatus()
            );

            // =================================================
            // EMI COUNTS
            // =================================================

            loanHistory.setPaidEmis(
                    paidEmis
            );

            loanHistory.setRemainingEmis(
                    remainingEmis
            );

            // =================================================
            // MONEY
            // =================================================

            loanHistory.setTotalPaidAmount(
                    loanPaidAmount
            );

            loanHistory.setTotalDueAmount(
                    loanDueAmount
            );

            loanHistory.setOverdueAmount(
                    overdueAmount
            );

            // =================================================
            // PAYMENT HISTORY
            // =================================================

            loanHistory.setPayments(
                    paymentHistoryList
            );

            // =================================================
            // UPCOMING PAYMENTS
            // =================================================

            loanHistory.setUpcomingPayments(
                    upcomingPaymentList
            );

            // =================================================
            // ADD LOAN
            // =================================================

            loanHistoryList.add(
                    loanHistory
            );
        }

        // =====================================================
        // FINAL MEMBER SUMMARY
        // =====================================================

        response.setTotalLoans(
                totalLoans
        );

        response.setTotalLoanAmount(
                totalLoanAmount
        );

        response.setTotalPaidAmount(
                totalPaidAmount
        );

        response.setTotalDueAmount(
                totalDueAmount
        );

        response.setTotalOverdueAmount(
                totalOverdueAmount
        );

        response.setLoans(
                loanHistoryList
        );

        return response;
    }

    // =========================================================
    // BUILD UPCOMING EMI SCHEDULE
    // =========================================================

    private List<MemberHistoryResponse.UpcomingPayment>
    buildUpcomingPayments(
            Loan loan,
            int paidEmis,
            int tenureMonths) {

        List<MemberHistoryResponse.UpcomingPayment>
                result =
                new ArrayList<>();

        // =====================================================
        // VALIDATION
        // =====================================================

        if (loan == null) {
            return result;
        }

        if (tenureMonths <= 0) {
            return result;
        }

        Double emiAmount =
                loan.getEmiAmount();

        if (emiAmount == null ||
                emiAmount <= 0) {

            return result;
        }

        // =====================================================
        // ALL EMI PAID
        // =====================================================

        if (paidEmis >= tenureMonths) {
            return result;
        }

        // =====================================================
        // FIRST EMI DATE
        // =====================================================

        LocalDate firstEmiDate =
                loan.getNextEmiDate();

        // =====================================================
        // FALLBACK
        // =====================================================

        if (firstEmiDate == null &&
                loan.getLoanDate() != null) {

            firstEmiDate =
                    loan.getLoanDate()
                            .plusMonths(2);
        }

        if (firstEmiDate == null) {
            return result;
        }

        // =====================================================
        // NEXT UNPAID EMI DATE
        // =====================================================

        LocalDate nextDueDate =
                firstEmiDate.plusMonths(
                        paidEmis
                );

        // =====================================================
        // TODAY
        // =====================================================

        LocalDate today =
                LocalDate.now();

        // =====================================================
        // GENERATE EMI SCHEDULE
        // =====================================================

        for (
                int emiNumber = paidEmis + 1;
                emiNumber <= tenureMonths;
                emiNumber++
        ) {

            int monthOffset =
                    emiNumber -
                            (paidEmis + 1);

            LocalDate dueDate =
                    nextDueDate.plusMonths(
                            monthOffset
                    );

            MemberHistoryResponse.UpcomingPayment
                    upcomingPayment =
                    new MemberHistoryResponse
                            .UpcomingPayment();

            // =================================================
            // EMI NUMBER
            // =================================================

            upcomingPayment.setEmiNumber(
                    emiNumber
            );

            // =================================================
            // DUE DATE
            // =================================================

            upcomingPayment.setDueDate(
                    dueDate.toString()
            );

            // =================================================
            // EMI AMOUNT
            // =================================================

            upcomingPayment.setEmiAmount(
                    emiAmount
            );

            // =================================================
            // STATUS
            // =================================================

            if (dueDate.isBefore(today)) {

                upcomingPayment.setStatus(
                        "OVERDUE"
                );

            } else if (dueDate.equals(today)) {

                upcomingPayment.setStatus(
                        "DUE_TODAY"
                );

            } else {

                upcomingPayment.setStatus(
                        "UPCOMING"
                );
            }

            result.add(
                    upcomingPayment
            );
        }

        return result;
    }

    // =========================================================
    // CALCULATE OVERDUE AMOUNT
    // =========================================================

    private double calculateOverdueAmount(
            List<MemberHistoryResponse.UpcomingPayment>
                    upcomingPayments) {

        if (upcomingPayments == null ||
                upcomingPayments.isEmpty()) {

            return 0.0;
        }

        double overdueAmount = 0.0;

        for (
                MemberHistoryResponse.UpcomingPayment payment
                : upcomingPayments
        ) {

            if (payment == null) {
                continue;
            }

            if ("OVERDUE".equalsIgnoreCase(
                    payment.getStatus())) {

                if (payment.getEmiAmount() != null) {

                    overdueAmount +=
                            payment.getEmiAmount();
                }
            }
        }

        return overdueAmount;
    }
}