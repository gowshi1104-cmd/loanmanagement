package com.loan.service;

import com.loan.dto.StaffDashboardResponse;
import com.loan.entity.Loan;
import com.loan.entity.User;
import com.loan.repository.LoanRepository;
import com.loan.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffDashboardService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public StaffDashboardService(
            LoanRepository loanRepository,
            UserRepository userRepository
    ) {
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // STAFF DASHBOARD
    // =========================================================

    public StaffDashboardResponse getDashboard(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Staff authentication information not found"
            );
        }

        String username = authentication.getName();

        User staff = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Staff user not found"
                        )
                );

        // =====================================================
        // ROLE VALIDATION
        // =====================================================

        if (staff.getRole() == null ||
                staff.getRole().getRoleName() == null ||
                !"STAFF".equalsIgnoreCase(
                        staff.getRole().getRoleName()
                )) {

            throw new RuntimeException(
                    "Access denied. Staff dashboard only."
            );
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        StaffDashboardResponse response =
                new StaffDashboardResponse();

        response.setStaffName(
                staff.getFullName() != null
                        ? staff.getFullName()
                        : staff.getUsername()
        );

        response.setUsername(
                staff.getUsername()
        );

        // =====================================================
        // LOAN COUNTS
        // =====================================================

        long totalLoans =
                loanRepository.countByCreatedBy(staff);

        long pendingLoans =
                loanRepository
                        .countByCreatedByAndStatusIgnoreCase(
                                staff,
                                "PENDING"
                        );

        long approvedLoans =
                loanRepository
                        .countByCreatedByAndStatusIgnoreCase(
                                staff,
                                "APPROVED"
                        );

        long rejectedLoans =
                loanRepository
                        .countByCreatedByAndStatusIgnoreCase(
                                staff,
                                "REJECTED"
                        );

        long activeLoans =
                loanRepository
                        .countByCreatedByAndStatusIgnoreCase(
                                staff,
                                "ACTIVE"
                        );

        long completedLoans =
                loanRepository
                        .countByCreatedByAndStatusIgnoreCase(
                                staff,
                                "COMPLETED"
                        );

        response.setTotalLoans(totalLoans);
        response.setPendingLoans(pendingLoans);
        response.setApprovedLoans(approvedLoans);
        response.setRejectedLoans(rejectedLoans);
        response.setActiveLoans(activeLoans);
        response.setCompletedLoans(completedLoans);

        // =====================================================
        // RECENT LOANS
        // =====================================================

        List<Loan> recentLoans =
                loanRepository
                        .findTop10ByCreatedByOrderByLoanDateDesc(
                                staff
                        );

        response.setRecentLoans(recentLoans);

        // =====================================================
        // AMOUNT CALCULATION
        // =====================================================

        double totalLoanAmount = 0.0;
        double approvedLoanAmount = 0.0;
        double activeLoanAmount = 0.0;

        for (Loan loan : recentLoans) {

            /*
             * Recent loans are used only for the dashboard table.
             *
             * Amount totals are calculated separately below
             * from all staff loans.
             */
        }

        List<Loan> staffLoans =
                loanRepository.findAll()
                        .stream()
                        .filter(loan ->
                                loan.getCreatedBy() != null &&
                                loan.getCreatedBy().getId()
                                        .equals(staff.getId())
                        )
                        .toList();

        for (Loan loan : staffLoans) {

            double amount =
                    loan.getLoanAmount() != null
                            ? loan.getLoanAmount()
                            : 0.0;

            totalLoanAmount += amount;

            if ("APPROVED".equalsIgnoreCase(
                    loan.getStatus()
            )) {

                approvedLoanAmount += amount;
            }

            if ("ACTIVE".equalsIgnoreCase(
                    loan.getStatus()
            )) {

                activeLoanAmount += amount;
            }
        }

        response.setTotalLoanAmount(
                totalLoanAmount
        );

        response.setApprovedLoanAmount(
                approvedLoanAmount
        );

        response.setActiveLoanAmount(
                activeLoanAmount
        );

        return response;
    }
}