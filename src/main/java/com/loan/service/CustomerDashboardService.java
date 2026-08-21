package com.loan.service;

import com.loan.dto.CustomerDashboardResponse;
import com.loan.dto.CustomerEmiScheduleResponse;
import com.loan.dto.PaymentHistoryResponse;
import com.loan.dto.PaymentHistoryResponse.PaymentHistoryItem;
import com.loan.dto.PaymentHistoryResponse.UpcomingPaymentItem;
import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Payment;
import com.loan.entity.User;
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
public class CustomerDashboardService {

    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE;

    public CustomerDashboardService(
            LoanRepository loanRepository,
            PaymentRepository paymentRepository,
            MemberRepository memberRepository) {

        this.loanRepository = loanRepository;
        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
    }

    // =========================================================
    // CUSTOMER DASHBOARD
    // =========================================================

    public CustomerDashboardResponse getDashboard(User user) {

        String customerId = user.getUsername();

        List<Loan> loans =
                loanRepository.findByCustomerId(customerId);

        CustomerDashboardResponse response =
                new CustomerDashboardResponse();

        if (loans == null) {
            loans = new ArrayList<>();
        }

        response.setTotalLoans(loans.size());

        long activeLoans =
                loans.stream()
                        .filter(loan ->
                                loan != null &&
                                "APPROVED".equalsIgnoreCase(
                                        loan.getStatus()
                                )
                        )
                        .count();

        response.setActiveLoans(activeLoans);

        // =====================================================
        // TOTAL PAID
        // =====================================================

        double totalPaid = 0.0;

        for (Loan loan : loans) {

            if (loan == null ||
                    loan.getLoanId() == null) {
                continue;
            }

            List<Payment> payments =
                    paymentRepository.findByLoanIdAndStatus(
                            loan.getLoanId(),
                            "SUCCESS"
                    );

            if (payments == null) {
                continue;
            }

            for (Payment payment : payments) {

                if (payment != null &&
                        payment.getAmount() != null) {

                    totalPaid += payment.getAmount();
                }
            }
        }

        response.setTotalPaidAmount(totalPaid);

        // =====================================================
        // OUTSTANDING + NEXT EMI
        // =====================================================

        double totalOutstanding = 0.0;

        Loan nextLoan = null;

        LocalDate today = LocalDate.now();

        for (Loan loan : loans) {

            if (loan == null ||
                    !"APPROVED".equalsIgnoreCase(
                            loan.getStatus())) {

                continue;
            }

            double loanAmount =
                    loan.getLoanAmount() != null
                            ? loan.getLoanAmount()
                            : 0.0;

            List<Payment> payments =
                    paymentRepository.findByLoanIdAndStatus(
                            loan.getLoanId(),
                            "SUCCESS"
                    );

            double paidAmount = 0.0;

            if (payments != null) {

                for (Payment payment : payments) {

                    if (payment != null &&
                            payment.getAmount() != null) {

                        paidAmount += payment.getAmount();
                    }
                }
            }

            double outstanding =
                    Math.max(
                            loanAmount - paidAmount,
                            0.0
                    );

            totalOutstanding += outstanding;

            LocalDate emiDate =
                    loan.getNextEmiDate();

            if (emiDate != null &&
                    !emiDate.isBefore(today)) {

                if (nextLoan == null ||
                        nextLoan.getNextEmiDate() == null ||
                        emiDate.isBefore(
                                nextLoan.getNextEmiDate()
                        )) {

                    nextLoan = loan;
                }
            }
        }

        response.setOutstandingAmount(
                totalOutstanding
        );

        if (nextLoan != null) {

            response.setUpcomingEmiAmount(
                    nextLoan.getEmiAmount()
            );

            response.setUpcomingEmiDate(
                    nextLoan.getNextEmiDate().toString()
            );

            response.setNextEmi(
                    new CustomerDashboardResponse.NextEmi(
                            nextLoan.getLoanId(),
                            nextLoan.getEmiAmount(),
                            nextLoan.getNextEmiDate().toString()
                    )
            );
        }

        return response;
    }

    // =========================================================
    // MY LOANS
    // =========================================================

    public List<Loan> getMyLoans(User user) {

        String customerId =
                user.getUsername();

        System.out.println(
                "================================="
        );

        System.out.println(
                "CUSTOMER MY LOANS"
        );

        System.out.println(
                "Customer ID: " + customerId
        );

        System.out.println(
                "================================="
        );

        List<Loan> loans =
                loanRepository.findByCustomerId(
                        customerId
                );

        return loans != null
                ? loans
                : new ArrayList<>();
    }

    // =========================================================
    // MY EMI SCHEDULE
    // =========================================================

    public List<CustomerEmiScheduleResponse> getMyEmiSchedule(
            User user) {

        String customerId =
                user.getUsername();

        System.out.println(
                "================================="
        );

        System.out.println(
                "CUSTOMER EMI SCHEDULE"
        );

        System.out.println(
                "Customer ID: " + customerId
        );

        System.out.println(
                "================================="
        );

        List<Loan> loans =
                loanRepository.findByCustomerId(
                        customerId
                );

        List<CustomerEmiScheduleResponse> result =
                new ArrayList<>();

        if (loans == null || loans.isEmpty()) {
            return result;
        }

        for (Loan loan : loans) {

            if (loan == null) {
                continue;
            }

            // Customer can see EMI schedule
            // only for APPROVED loans.

            if (!"APPROVED".equalsIgnoreCase(
                    loan.getStatus())) {

                continue;
            }

            buildEmiSchedule(
                    loan,
                    result
            );
        }

        return result;
    }

    // =========================================================
    // BUILD EMI SCHEDULE
    // =========================================================

    private void buildEmiSchedule(
            Loan loan,
            List<CustomerEmiScheduleResponse> result) {

        if (loan.getLoanId() == null ||
                loan.getLoanId().trim().isEmpty()) {

            return;
        }

        if (loan.getTenureMonths() == null ||
                loan.getTenureMonths() <= 0) {

            return;
        }

        if (loan.getEmiAmount() == null ||
                loan.getEmiAmount() <= 0) {

            return;
        }

        int tenure =
                loan.getTenureMonths();

        double emiAmount =
                loan.getEmiAmount();

        // =====================================================
        // SUCCESS PAYMENTS
        // =====================================================

        List<Payment> payments =
                paymentRepository.findByLoanIdAndStatus(
                        loan.getLoanId(),
                        "SUCCESS"
                );

        if (payments == null) {
            payments = new ArrayList<>();
        }

        // Sort payment history by payment date.
        payments.sort(
                Comparator.comparing(
                        this::getPaymentDateSafe,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );

        int paidEmis =
                Math.min(
                        payments.size(),
                        tenure
                );

        // =====================================================
        // FIRST EMI DATE
        // =====================================================

        LocalDate firstEmiDate = null;

        /*
         * If loan has loanDate:
         * First EMI = loan date + 1 month
         *
         * Otherwise:
         * Use nextEmiDate.
         */

        if (loan.getLoanDate() != null) {

            firstEmiDate =
                    loan.getLoanDate()
                            .plusMonths(1);

        } else if (loan.getNextEmiDate() != null) {

            firstEmiDate =
                    loan.getNextEmiDate();
        }

        if (firstEmiDate == null) {
            return;
        }

        LocalDate today =
                LocalDate.now();

        // =====================================================
        // GENERATE COMPLETE EMI SCHEDULE
        // =====================================================

        for (
                int emiNumber = 1;
                emiNumber <= tenure;
                emiNumber++
        ) {

            LocalDate dueDate =
                    firstEmiDate.plusMonths(
                            emiNumber - 1
                    );

            CustomerEmiScheduleResponse item =
                    new CustomerEmiScheduleResponse();

            // =================================================
            // BASIC DETAILS
            // =================================================

            item.setLoanId(
                    loan.getLoanId()
            );

            item.setEmiNumber(
                    emiNumber
            );

            item.setEmiDate(
                    dueDate.toString()
            );

            item.setEmiAmount(
                    emiAmount
            );

            // =================================================
            // PAID / DUE AMOUNT
            // =================================================

            double paidAmount = 0.0;

            if (emiNumber <= paidEmis) {

                Payment payment =
                        payments.get(
                                emiNumber - 1
                        );

                if (payment != null &&
                        payment.getAmount() != null) {

                    paidAmount =
                            payment.getAmount();
                }
            }

            double dueAmount =
                    Math.max(
                            emiAmount - paidAmount,
                            0.0
                    );

            item.setPaidAmount(
                    paidAmount
            );

            item.setDueAmount(
                    dueAmount
            );

            // =================================================
            // EMI STATUS
            // =================================================

            if (emiNumber <= paidEmis) {

                item.setStatus(
                        "PAID"
                );

            } else if (dueDate.isBefore(today)) {

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
    }

    // =========================================================
    // MY PAYMENT HISTORY
    // =========================================================

    public List<PaymentHistoryResponse> getMyPaymentHistory(
            User user) {

        String customerId =
                user.getUsername();

        System.out.println(
                "================================="
        );

        System.out.println(
                "CUSTOMER PAYMENT HISTORY"
        );

        System.out.println(
                "Customer ID: " + customerId
        );

        System.out.println(
                "================================="
        );

        List<Loan> loans =
                loanRepository.findByCustomerId(
                        customerId
                );

        List<PaymentHistoryResponse> result =
                new ArrayList<>();

        if (loans == null || loans.isEmpty()) {
            return result;
        }

        for (Loan loan : loans) {

            if (loan == null) {
                continue;
            }

            // =================================================
            // ONLY APPROVED LOANS
            // =================================================

            if (!"APPROVED".equalsIgnoreCase(
                    loan.getStatus())) {

                continue;
            }

            PaymentHistoryResponse response =
                    buildPaymentHistory(
                            loan
                    );

            if (response != null) {

                result.add(response);
            }
        }

        return result;
    }

    // =========================================================
    // BUILD PAYMENT HISTORY
    // =========================================================

    private PaymentHistoryResponse buildPaymentHistory(
            Loan loan) {

        String loanId =
                loan.getLoanId();

        if (loanId == null ||
                loanId.trim().isEmpty()) {

            return null;
        }

        loanId =
                loanId.trim().toUpperCase();

        // =====================================================
        // MEMBER
        // =====================================================

        Member member =
                memberRepository
                        .findByCustomerId(
                                loan.getCustomerId()
                        )
                        .orElse(null);

        // =====================================================
        // PAYMENTS
        // =====================================================

        List<Payment> payments =
                paymentRepository.findByLoanId(
                        loanId
                );

        if (payments == null) {
            payments = new ArrayList<>();
        }

        // =====================================================
        // SUCCESS PAYMENTS ONLY
        // =====================================================

        List<Payment> successfulPayments =
                payments.stream()
                        .filter(payment ->
                                payment != null &&
                                "SUCCESS".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
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

        double loanAmount =
                loan.getLoanAmount() != null
                        ? loan.getLoanAmount()
                        : 0.0;

        // =====================================================
        // PAID EMIS
        // =====================================================

        int paidEmis =
                Math.min(
                        successfulPayments.size(),
                        tenureMonths
                );

        // =====================================================
        // REMAINING EMIS
        // =====================================================

        int remainingEmis =
                Math.max(
                        tenureMonths - paidEmis,
                        0
                );

        // =====================================================
        // TOTAL PAID
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
        // OVERDUE
        // =====================================================

        double overdueAmount =
                calculateOverdueAmount(
                        loan,
                        paidEmis,
                        emiAmount,
                        nextEmiDate
                );

        // =====================================================
        // PAID PAYMENT LIST
        // =====================================================

        List<PaymentHistoryItem> paidPaymentItems =
                buildPaidPaymentHistory(
                        successfulPayments
                );

        // =====================================================
        // UPCOMING PAYMENT LIST
        // =====================================================

        List<UpcomingPaymentItem> upcomingPaymentItems =
                buildUpcomingPayments(
                        loan,
                        paidEmis,
                        nextEmiDate
                );

        // =====================================================
        // RESPONSE
        // =====================================================

        PaymentHistoryResponse response =
                new PaymentHistoryResponse();

        response.setCustomerId(
                loan.getCustomerId()
        );

        response.setCustomerName(
                member != null
                        ? member.getName()
                        : loan.getCustomerId()
        );

        response.setPhone(
                member != null
                        ? member.getPhone()
                        : null
        );

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

        response.setPaidPayments(
                paidPaymentItems
        );

        response.setUpcomingPayments(
                upcomingPaymentItems
        );

        return response;
    }

    // =========================================================
    // PAID PAYMENT HISTORY
    // =========================================================

    private List<PaymentHistoryItem> buildPaidPaymentHistory(
            List<Payment> payments) {

        List<PaymentHistoryItem> result =
                new ArrayList<>();

        int emiNumber = 1;

        for (Payment payment : payments) {

            if (payment == null) {
                continue;
            }

            PaymentHistoryItem item =
                    new PaymentHistoryItem();

            item.setPaymentId(
                    payment.getId()
            );

            item.setEmiNumber(
                    emiNumber
            );

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

            emiNumber++;
        }

        return result;
    }

    // =========================================================
    // UPCOMING EMI SCHEDULE
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
    // NEXT EMI DATE
    // =========================================================

    private LocalDate calculateNextEmiDate(
            Loan loan,
            int paidEmis) {

        if (loan.getTenureMonths() != null &&
                paidEmis >= loan.getTenureMonths()) {

            return null;
        }

        /*
         * If nextEmiDate is already stored in Loan,
         * use that date.
         */

        if (loan.getNextEmiDate() != null) {

            return loan.getNextEmiDate();
        }

        /*
         * Otherwise calculate from loan date.
         */

        if (loan.getLoanDate() != null) {

            return loan.getLoanDate()
                    .plusMonths(
                            paidEmis + 1
                    );
        }

        return null;
    }

    // =========================================================
    // OVERDUE AMOUNT
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

            return LocalDate.parse(
                    payment.getPaymentDate(),
                    DATE_FORMATTER
            );

        } catch (DateTimeParseException e) {

            return null;
        }
    }
}