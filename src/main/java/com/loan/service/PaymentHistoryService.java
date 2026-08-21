package com.loan.service;

import com.loan.dto.PaymentHistoryResponse;
import com.loan.dto.PaymentHistoryResponse.PaymentHistoryItem;
import com.loan.dto.PaymentHistoryResponse.UpcomingPaymentItem;
import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Payment;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.PaymentRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class PaymentHistoryService {

    private final PaymentRepository paymentRepository;
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE;

    public PaymentHistoryService(
            PaymentRepository paymentRepository,
            LoanRepository loanRepository,
            MemberRepository memberRepository) {

        this.paymentRepository = paymentRepository;
        this.loanRepository = loanRepository;
        this.memberRepository = memberRepository;
    }

    // =========================================================
    // GET PAYMENT HISTORY BY LOAN ID
    // =========================================================

    public PaymentHistoryResponse getPaymentHistory(String loanId) {

        if (loanId == null || loanId.trim().isEmpty()) {
            throw new RuntimeException("Loan ID is required");
        }

        String normalizedLoanId =
                loanId.trim().toUpperCase();

        // =====================================================
        // FIND LOAN
        // =====================================================

        Loan loan =
                loanRepository
                        .findByLoanId(normalizedLoanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found with ID: "
                                                + normalizedLoanId
                                )
                        );

        // =====================================================
        // FIND MEMBER
        // =====================================================

        Member member =
                memberRepository
                        .findByCustomerId(
                                loan.getCustomerId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Member not found with customer ID: "
                                                + loan.getCustomerId()
                                )
                        );

        // =====================================================
        // GET ALL PAYMENTS FOR THIS LOAN
        //
        // IMPORTANT:
        // Do not filter SUCCESS here.
        //
        // Admin/customer history can see the payment record,
        // while only SUCCESS payments affect EMI calculations.
        // =====================================================

        List<Payment> payments =
                paymentRepository.findByLoanId(
                        normalizedLoanId
                );

        if (payments == null) {
            payments = new ArrayList<>();
        }

        // =====================================================
        // SORT PAYMENT HISTORY BY PAYMENT DATE
        // =====================================================

        List<Payment> sortedPayments =
                payments.stream()
                        .filter(payment -> payment != null)
                        .sorted(
                                Comparator.comparing(
                                        this::getPaymentDateSafe,
                                        Comparator.nullsLast(
                                                Comparator.naturalOrder()
                                        )
                                )
                        )
                        .toList();

        // =====================================================
        // LOAN VALUES
        // =====================================================

        double emiAmount =
                loan.getEmiAmount() != null
                        ? loan.getEmiAmount()
                        : 0.0;

        int tenureMonths =
                loan.getTenureMonths() != null &&
                        loan.getTenureMonths() > 0
                        ? loan.getTenureMonths()
                        : 0;

        // =====================================================
        // SUCCESS PAYMENTS
        //
        // Only SUCCESS payments are considered paid EMIs.
        // =====================================================

        List<Payment> successfulPayments =
                sortedPayments.stream()
                        .filter(payment ->
                                "SUCCESS".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
                        .toList();

        // =====================================================
        // PAID EMI COUNT
        // =====================================================

        int paidEmis =
                Math.min(
                        successfulPayments.size(),
                        tenureMonths
                );

        // =====================================================
        // REMAINING EMI COUNT
        // =====================================================

        int remainingEmis =
                Math.max(
                        tenureMonths - paidEmis,
                        0
                );

        // =====================================================
        // TOTAL PAID AMOUNT
        //
        // SUCCESS payments only.
        // =====================================================

        double totalPaidAmount =
                successfulPayments.stream()
                        .filter(payment ->
                                payment.getAmount() != null
                        )
                        .mapToDouble(
                                Payment::getAmount
                        )
                        .sum();

        // =====================================================
        // LOAN AMOUNT
        // =====================================================

        double loanAmount =
                loan.getLoanAmount() != null
                        ? loan.getLoanAmount()
                        : 0.0;

        // =====================================================
        // TOTAL DUE
        // =====================================================

        double totalDueAmount =
                remainingEmis * emiAmount;

        // =====================================================
        // NEXT EMI DATE
        // =====================================================

        LocalDate nextEmiDate =
                calculateNextEmiDate(
                        loan,
                        paidEmis
                );

        // =====================================================
        // OVERDUE AMOUNT
        // =====================================================

        double overdueAmount =
                calculateOverdueAmount(
                        loan,
                        paidEmis,
                        emiAmount,
                        nextEmiDate
                );

        // =====================================================
        // PAYMENT HISTORY
        //
        // ALL PAYMENT STATUSES ARE INCLUDED.
        // =====================================================

        List<PaymentHistoryItem> paymentHistoryItems =
                buildPaymentHistory(
                        sortedPayments
                );

        // =====================================================
        // UPCOMING EMI SCHEDULE
        // =====================================================

        List<UpcomingPaymentItem> upcomingPaymentItems =
                buildUpcomingPayments(
                        loan,
                        paidEmis,
                        nextEmiDate
                );

        // =====================================================
        // BUILD RESPONSE
        // =====================================================

        PaymentHistoryResponse response =
                new PaymentHistoryResponse();

        // =====================================================
        // CUSTOMER DETAILS
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

        // =====================================================
        // LOAN DETAILS
        // =====================================================

        response.setLoanId(
                loan.getLoanId()
        );

        response.setLoanAmount(
                loanAmount
        );

        response.setEmiAmount(
                emiAmount
        );

        response.setInterestRate(
                loan.getInterestRate()
        );

        response.setTenureMonths(
                tenureMonths
        );

        response.setLoanDate(
                loan.getLoanDate() != null
                        ? loan.getLoanDate().toString()
                        : null
        );

        response.setLoanStatus(
                loan.getStatus()
        );

        // =====================================================
        // SUMMARY
        // =====================================================

        response.setPaidEmis(
                paidEmis
        );

        response.setRemainingEmis(
                remainingEmis
        );

        response.setTotalPaidAmount(
                totalPaidAmount
        );

        response.setTotalDueAmount(
                totalDueAmount
        );

        response.setOverdueAmount(
                overdueAmount
        );

        response.setNextEmiDate(
                nextEmiDate != null
                        ? nextEmiDate.toString()
                        : null
        );

        // =====================================================
        // PAYMENT HISTORY
        // =====================================================

        response.setPaidPayments(
                paymentHistoryItems
        );

        // =====================================================
        // UPCOMING PAYMENTS
        // =====================================================

        response.setUpcomingPayments(
                upcomingPaymentItems
        );

        return response;
    }

    // =========================================================
    // BUILD PAYMENT HISTORY
    // =========================================================

    private List<PaymentHistoryItem> buildPaymentHistory(
            List<Payment> payments) {

        List<PaymentHistoryItem> result =
                new ArrayList<>();

        int paidEmiNumber = 0;

        for (Payment payment : payments) {

            if (payment == null) {
                continue;
            }

            String status =
                    payment.getStatus() != null
                            ? payment.getStatus()
                                    .trim()
                                    .toUpperCase()
                            : "";

            // =================================================
            // SUCCESS PAYMENT CONSUMES AN EMI
            // =================================================

            if ("SUCCESS".equals(status)) {
                paidEmiNumber++;
            }

            PaymentHistoryItem item =
                    new PaymentHistoryItem();

            item.setPaymentId(
                    payment.getId()
            );

            // =================================================
            // EMI NUMBER
            //
            // SUCCESS -> actual paid EMI number
            // PENDING/FAILED -> no EMI number
            // =================================================

            if ("SUCCESS".equals(status)) {

                item.setEmiNumber(
                        paidEmiNumber
                );

            } else {

                item.setEmiNumber(
                        null
                );
            }

            item.setPaymentDate(
                    payment.getPaymentDate()
            );

            item.setAmount(
                    payment.getAmount()
            );

            item.setPaymentMode(
                    payment.getPaymentMode()
            );

            item.setStatus(
                    payment.getStatus()
            );

            item.setTransactionReference(
                    payment.getTransactionReference()
            );

            item.setReceiptNumber(
                    payment.getReceiptNumber()
            );

            result.add(item);
        }

        return result;
    }

    // =========================================================
    // BUILD UPCOMING EMI SCHEDULE
    // =========================================================

    private List<UpcomingPaymentItem> buildUpcomingPayments(
            Loan loan,
            int paidEmis,
            LocalDate nextEmiDate) {

        List<UpcomingPaymentItem> result =
                new ArrayList<>();

        if (loan.getTenureMonths() == null ||
                loan.getTenureMonths() <= 0) {

            return result;
        }

        if (loan.getEmiAmount() == null ||
                loan.getEmiAmount() <= 0) {

            return result;
        }

        int tenure =
                loan.getTenureMonths();

        if (paidEmis >= tenure) {
            return result;
        }

        if (nextEmiDate == null) {
            return result;
        }

        LocalDate today =
                LocalDate.now();

        // =====================================================
        // GENERATE REMAINING EMIS
        // =====================================================

        for (
                int emiNumber = paidEmis + 1;
                emiNumber <= tenure;
                emiNumber++
        ) {

            int monthOffset =
                    emiNumber - (paidEmis + 1);

            LocalDate dueDate =
                    nextEmiDate.plusMonths(
                            monthOffset
                    );

            UpcomingPaymentItem item =
                    new UpcomingPaymentItem();

            item.setEmiNumber(
                    emiNumber
            );

            item.setDueDate(
                    dueDate.toString()
            );

            item.setEmiAmount(
                    loan.getEmiAmount()
            );

            // =================================================
            // EMI STATUS
            // =================================================

            if (dueDate.isBefore(today)) {

                item.setStatus(
                        "OVERDUE"
                );

            } else if (dueDate.equals(today)) {

                item.setStatus(
                        "DUE_TODAY"
                );

            } else {

                item.setStatus(
                        "UPCOMING"
                );
            }

            result.add(item);
        }

        return result;
    }

    // =========================================================
    // CALCULATE NEXT EMI DATE
    // =========================================================

    private LocalDate calculateNextEmiDate(
            Loan loan,
            int paidEmis) {

        if (loan.getTenureMonths() != null &&
                paidEmis >= loan.getTenureMonths()) {

            return null;
        }

        // =====================================================
        // USE EXPLICIT NEXT EMI DATE IF AVAILABLE
        // =====================================================

        if (loan.getNextEmiDate() != null) {

            return loan.getNextEmiDate();
        }

        // =====================================================
        // FALLBACK TO LOAN DATE
        // =====================================================

        if (loan.getLoanDate() == null) {
            return null;
        }

        return loan.getLoanDate()
                .plusMonths(
                        paidEmis + 1
                );
    }

    // =========================================================
    // CALCULATE OVERDUE AMOUNT
    // =========================================================

    private double calculateOverdueAmount(
            Loan loan,
            int paidEmis,
            double emiAmount,
            LocalDate nextEmiDate) {

        if (emiAmount <= 0 ||
                nextEmiDate == null ||
                loan.getTenureMonths() == null) {

            return 0.0;
        }

        if (paidEmis >= loan.getTenureMonths()) {
            return 0.0;
        }

        LocalDate today =
                LocalDate.now();

        int overdueEmis = 0;

        LocalDate dueDate =
                nextEmiDate;

        while (
                dueDate.isBefore(today) &&
                paidEmis + overdueEmis
                        < loan.getTenureMonths()
        ) {

            overdueEmis++;

            dueDate =
                    dueDate.plusMonths(1);
        }

        return overdueEmis * emiAmount;
    }

    // =========================================================
    // SAFE PAYMENT DATE
    // =========================================================

    private LocalDate getPaymentDateSafe(
            Payment payment) {

        if (payment == null ||
                payment.getPaymentDate() == null ||
                payment.getPaymentDate().isBlank()) {

            return null;
        }

        try {

            String dateValue =
                    payment.getPaymentDate()
                            .trim();

            if (dateValue.length() >= 10) {
                dateValue =
                        dateValue.substring(0, 10);
            }

            return LocalDate.parse(
                    dateValue,
                    DATE_FORMATTER
            );

        } catch (DateTimeParseException e) {

            return null;
        }
    }
}