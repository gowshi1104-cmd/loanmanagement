package com.loan.service.impl;

import com.loan.dto.ManagerDashboardResponse;
import com.loan.entity.Loan;
import com.loan.entity.Payment;
import com.loan.repository.GroupRepository;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.PaymentRepository;
import com.loan.repository.UserRepository;
import com.loan.service.ManagerDashboardService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ManagerDashboardServiceImpl
        implements ManagerDashboardService {

    private final MemberRepository memberRepository;
    private final GroupRepository groupRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public ManagerDashboardServiceImpl(
            MemberRepository memberRepository,
            GroupRepository groupRepository,
            LoanRepository loanRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository) {

        this.memberRepository = memberRepository;
        this.groupRepository = groupRepository;
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ManagerDashboardResponse getDashboard() {

        // =====================================================
        // ORGANIZATION OVERVIEW
        // =====================================================

        long totalCustomers =
                memberRepository.count();

        long totalStaff =
                userRepository.countByRoleName("STAFF");

        long totalLoans =
                loanRepository.count();

        long totalGroups =
                groupRepository.count();

        // =====================================================
        // LOAN OVERVIEW
        // =====================================================

        long pendingLoans =
                loanRepository.countByStatusIgnoreCase("PENDING");

        long approvedLoans =
                loanRepository.countByStatusIgnoreCase("APPROVED");

        long rejectedLoans =
                loanRepository.countByStatusIgnoreCase("REJECTED");

        long activeLoans =
                loanRepository.countByStatusIgnoreCase("ACTIVE");

        long completedLoans =
                loanRepository.countByStatusIgnoreCase("COMPLETED");

        // =====================================================
        // PAYMENT OVERVIEW
        // =====================================================

        List<Payment> payments =
                paymentRepository.findAll();

        long successfulPayments =
                payments.stream()
                        .filter(payment ->
                                "SUCCESS".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
                        .count();

        long pendingPayments =
                payments.stream()
                        .filter(payment ->
                                "PENDING".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
                        .count();

        long failedPayments =
                payments.stream()
                        .filter(payment ->
                                "FAILED".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
                        .count();

        double totalCollected =
                payments.stream()
                        .filter(payment ->
                                "SUCCESS".equalsIgnoreCase(
                                        payment.getStatus()
                                )
                        )
                        .filter(payment ->
                                payment.getAmount() != null
                        )
                        .mapToDouble(
                                Payment::getAmount
                        )
                        .sum();

        // =====================================================
        // RECENT LOANS
        // =====================================================

        List<Loan> recentLoans =
                loanRepository
                        .findTop10ByOrderByLoanDateDesc();

        List<ManagerDashboardResponse.RecentLoanResponse>
                recentLoanResponses =
                recentLoans.stream()
                        .map(this::mapRecentLoan)
                        .collect(Collectors.toList());

        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return new ManagerDashboardResponse(

                totalCustomers,
                totalStaff,
                totalLoans,
                totalGroups,

                pendingLoans,
                approvedLoans,
                rejectedLoans,
                activeLoans,
                completedLoans,

                totalCollected,
                successfulPayments,
                pendingPayments,
                failedPayments,

                recentLoanResponses
        );
    }

    // =========================================================
    // MAP LOAN → MANAGER DASHBOARD DTO
    // =========================================================

    private ManagerDashboardResponse.RecentLoanResponse
    mapRecentLoan(Loan loan) {

        String createdBy = null;

        if (loan.getCreatedBy() != null) {

            if (loan.getCreatedBy().getFullName() != null
                    && !loan.getCreatedBy()
                            .getFullName()
                            .trim()
                            .isEmpty()) {

                createdBy =
                        loan.getCreatedBy().getFullName();

            } else {

                createdBy =
                        loan.getCreatedBy().getUsername();
            }
        }

        return new ManagerDashboardResponse.RecentLoanResponse(

                loan.getLoanId(),

                loan.getCustomerId(),

                loan.getCustomerName(),

                loan.getLoanAmount(),

                createdBy,

                loan.getStatus(),

                loan.getLoanDate()
        );
    }
}