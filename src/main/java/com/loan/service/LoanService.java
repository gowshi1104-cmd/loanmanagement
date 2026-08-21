package com.loan.service;

import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class LoanService {

    private static final double MONTHLY_INTEREST_RATE = 2.0;

    // Maximum 2 loans per customer
    private static final int MAX_TOTAL_LOANS = 2;

    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LoanService(
            LoanRepository loanRepository,
            MemberRepository memberRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.loanRepository = loanRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE LOAN
    // =========================================================

    @Transactional
    public Loan createLoan(Loan loan) {

        return createLoan(
                loan,
                null
        );
    }

    // =========================================================
    // CREATE LOAN WITH CREATED BY USERNAME
    // =========================================================

    @Transactional
    public Loan createLoan(
            Loan loan,
            String createdByUsername) {

        if (loan == null) {
            throw new IllegalArgumentException(
                    "Loan details are required"
            );
        }

        // -----------------------------------------------------
        // CUSTOMER ID
        // -----------------------------------------------------

        if (loan.getCustomerId() == null ||
                loan.getCustomerId().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Customer ID is required"
            );
        }

        String customerId =
                loan.getCustomerId()
                        .trim()
                        .toUpperCase();

        // -----------------------------------------------------
        // FIND CUSTOMER
        // -----------------------------------------------------

        Member member =
                memberRepository
                        .findByCustomerId(customerId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Customer not found"
                                )
                        );

        // -----------------------------------------------------
        // EXISTING LOANS
        // -----------------------------------------------------

        List<Loan> existingLoans =
                loanRepository
                        .findByCustomerIdOrderByLoanDateDesc(
                                customerId
                        );

        if (existingLoans == null) {
            existingLoans = List.of();
        }

        // -----------------------------------------------------
        // LOAN AMOUNT VALIDATION
        // -----------------------------------------------------

        if (loan.getLoanAmount() == null ||
                loan.getLoanAmount() <= 0) {

            throw new IllegalArgumentException(
                    "Loan amount must be greater than 0"
            );
        }

        // -----------------------------------------------------
        // TENURE VALIDATION
        // -----------------------------------------------------

        if (loan.getTenureMonths() == null ||
                loan.getTenureMonths() <= 0) {

            throw new IllegalArgumentException(
                    "Tenure must be greater than 0 months"
            );
        }

        // -----------------------------------------------------
        // LOAN ELIGIBILITY
        // -----------------------------------------------------

        validateLoanEligibility(
                existingLoans,
                loan
        );

        // -----------------------------------------------------
        // CUSTOMER DETAILS
        // -----------------------------------------------------

        loan.setCustomerId(
                member.getCustomerId()
        );

        loan.setCustomerName(
                member.getName()
        );

        // -----------------------------------------------------
        // SYSTEM GENERATED LOAN ID
        // -----------------------------------------------------

        loan.setLoanId(
                generateUniqueLoanId()
        );

        // -----------------------------------------------------
        // FIXED INTEREST RATE
        // -----------------------------------------------------

        loan.setInterestRate(
                MONTHLY_INTEREST_RATE
        );

        // -----------------------------------------------------
        // LOAN DATE
        // -----------------------------------------------------

        if (loan.getLoanDate() == null) {

            loan.setLoanDate(
                    LocalDate.now()
            );
        }

        // -----------------------------------------------------
        // DISBURSAL EXPECTED DATE
        // -----------------------------------------------------

        loan.setDisbursalExpectedDate(
                addWorkingDays(
                        loan.getLoanDate(),
                        5
                )
        );

        // -----------------------------------------------------
        // FIRST EMI DATE
        // -----------------------------------------------------

        loan.setNextEmiDate(
                loan.getLoanDate()
                        .plusMonths(2)
        );

        // -----------------------------------------------------
        // EMI
        // -----------------------------------------------------

        loan.setEmiAmount(
                calculateEmi(
                        loan.getLoanAmount(),
                        loan.getInterestRate(),
                        loan.getTenureMonths()
                )
        );

        // -----------------------------------------------------
        // FORCE PENDING
        // -----------------------------------------------------

        loan.setStatus("PENDING");

        // =====================================================
        // CREATED BY USER
        // =====================================================

        User createdByUser = null;

        if (createdByUsername != null &&
                !createdByUsername.trim().isEmpty()) {

            createdByUser =
                    userRepository
                            .findByUsername(
                                    createdByUsername.trim()
                            )
                            .orElse(null);

            if (createdByUser != null) {

                loan.setCreatedBy(
                        createdByUser
                );
            }
        }

        // -----------------------------------------------------
        // SAVE LOAN
        // -----------------------------------------------------

        Loan savedLoan =
                loanRepository.save(loan);

        // =====================================================
        // NOTIFICATION
        //
        // ONLY STAFF CREATION
        //
        // STAFF
        //   ↓
        // ADMIN + MANAGER
        // =====================================================

        if (createdByUser != null &&
                isStaffUser(createdByUser)) {

            notificationService
                    .notifyAdminAndManagerForNewLoan(
                            savedLoan.getLoanId(),
                            savedLoan.getCustomerName(),
                            getDisplayUserName(createdByUser)
                    );
        }

        return savedLoan;
    }

    // =========================================================
    // UPDATE LOAN
    // =========================================================

    @Transactional
    public Loan updateLoan(
            Long id,
            Loan updatedLoan) {

        if (updatedLoan == null) {
            throw new IllegalArgumentException(
                    "Loan details are required"
            );
        }

        Loan loan =
                loanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Loan not found"
                                )
                        );

        // =====================================================
        // STORE OLD STATUS
        // =====================================================

        String oldStatus =
                normalizeStatus(
                        loan.getStatus()
                );

        // -----------------------------------------------------
        // CUSTOMER
        // -----------------------------------------------------

        if (updatedLoan.getCustomerId() != null &&
                !updatedLoan.getCustomerId()
                        .trim()
                        .isEmpty()) {

            String customerId =
                    updatedLoan.getCustomerId()
                            .trim()
                            .toUpperCase();

            Member member =
                    memberRepository
                            .findByCustomerId(customerId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Customer not found"
                                    )
                            );

            loan.setCustomerId(
                    member.getCustomerId()
            );

            loan.setCustomerName(
                    member.getName()
            );
        }

        // -----------------------------------------------------
        // AADHAAR
        // -----------------------------------------------------

        if (updatedLoan.getAadhaarNumber() != null) {

            String aadhaar =
                    updatedLoan.getAadhaarNumber()
                            .trim();

            loan.setAadhaarNumber(
                    aadhaar.isEmpty()
                            ? null
                            : aadhaar
            );
        }

        // -----------------------------------------------------
        // PAN
        // -----------------------------------------------------

        if (updatedLoan.getPanNumber() != null) {

            String pan =
                    updatedLoan.getPanNumber()
                            .trim()
                            .toUpperCase();

            loan.setPanNumber(
                    pan.isEmpty()
                            ? null
                            : pan
            );
        }

        // -----------------------------------------------------
        // NOMINEE NAME
        // -----------------------------------------------------

        if (updatedLoan.getNomineeName() != null) {

            String nomineeName =
                    updatedLoan.getNomineeName()
                            .trim();

            loan.setNomineeName(
                    nomineeName.isEmpty()
                            ? null
                            : nomineeName
            );
        }

        // -----------------------------------------------------
        // NOMINEE RELATIONSHIP
        // -----------------------------------------------------

        if (updatedLoan.getNomineeRelationship() != null) {

            String relationship =
                    updatedLoan.getNomineeRelationship()
                            .trim();

            loan.setNomineeRelationship(
                    relationship.isEmpty()
                            ? null
                            : relationship
            );
        }

        // -----------------------------------------------------
        // NOMINEE MOBILE
        // -----------------------------------------------------

        if (updatedLoan.getNomineeMobile() != null) {

            String nomineeMobile =
                    updatedLoan.getNomineeMobile()
                            .trim();

            loan.setNomineeMobile(
                    nomineeMobile.isEmpty()
                            ? null
                            : nomineeMobile
            );
        }

        // -----------------------------------------------------
        // NOMINEE AADHAAR
        // -----------------------------------------------------

        if (updatedLoan.getNomineeAadhaarNumber() != null) {

            String nomineeAadhaar =
                    updatedLoan
                            .getNomineeAadhaarNumber()
                            .trim();

            loan.setNomineeAadhaarNumber(
                    nomineeAadhaar.isEmpty()
                            ? null
                            : nomineeAadhaar
            );
        }

        // -----------------------------------------------------
        // MONTHLY INCOME
        // -----------------------------------------------------

        if (updatedLoan.getMonthlyIncome() != null) {

            if (updatedLoan.getMonthlyIncome() <= 0) {

                throw new IllegalArgumentException(
                        "Monthly income must be greater than 0"
                );
            }

            loan.setMonthlyIncome(
                    updatedLoan.getMonthlyIncome()
            );
        }

        // -----------------------------------------------------
        // INCOME PROOF
        // -----------------------------------------------------

        if (updatedLoan.getIncomeProofFileName() != null) {

            String fileName =
                    updatedLoan
                            .getIncomeProofFileName()
                            .trim();

            loan.setIncomeProofFileName(
                    fileName.isEmpty()
                            ? null
                            : fileName
            );
        }

        // -----------------------------------------------------
        // LOAN AMOUNT
        // -----------------------------------------------------

        if (updatedLoan.getLoanAmount() != null) {

            if (updatedLoan.getLoanAmount() <= 0) {

                throw new IllegalArgumentException(
                        "Loan amount must be greater than 0"
                );
            }

            loan.setLoanAmount(
                    updatedLoan.getLoanAmount()
            );
        }

        // -----------------------------------------------------
        // TENURE
        // -----------------------------------------------------

        if (updatedLoan.getTenureMonths() != null) {

            if (updatedLoan.getTenureMonths() <= 0) {

                throw new IllegalArgumentException(
                        "Tenure must be greater than 0 months"
                );
            }

            loan.setTenureMonths(
                    updatedLoan.getTenureMonths()
            );
        }

        // -----------------------------------------------------
        // LOAN DATE
        // -----------------------------------------------------

        if (updatedLoan.getLoanDate() != null) {

            loan.setLoanDate(
                    updatedLoan.getLoanDate()
            );

        } else if (loan.getLoanDate() == null) {

            loan.setLoanDate(
                    LocalDate.now()
            );
        }

        // =====================================================
        // STATUS
        // =====================================================

        String newStatus =
                oldStatus;

        if (updatedLoan.getStatus() != null) {

            newStatus =
                    normalizeStatus(
                            updatedLoan.getStatus()
                    );

            if (newStatus == null) {

                throw new IllegalArgumentException(
                        "Invalid loan status"
                );
            }

            loan.setStatus(
                    newStatus
            );
        }

        // -----------------------------------------------------
        // FIXED INTEREST
        // -----------------------------------------------------

        loan.setInterestRate(
                MONTHLY_INTEREST_RATE
        );

        // -----------------------------------------------------
        // DISBURSAL DATE
        // -----------------------------------------------------

        loan.setDisbursalExpectedDate(
                addWorkingDays(
                        loan.getLoanDate(),
                        5
                )
        );

        // -----------------------------------------------------
        // NEXT EMI
        // -----------------------------------------------------

        loan.setNextEmiDate(
                loan.getLoanDate()
                        .plusMonths(2)
        );

        // -----------------------------------------------------
        // EMI VALIDATION
        // -----------------------------------------------------

        if (loan.getLoanAmount() == null ||
                loan.getLoanAmount() <= 0) {

            throw new IllegalArgumentException(
                    "Loan amount must be greater than 0"
            );
        }

        if (loan.getTenureMonths() == null ||
                loan.getTenureMonths() <= 0) {

            throw new IllegalArgumentException(
                    "Tenure must be greater than 0 months"
            );
        }

        // -----------------------------------------------------
        // RECALCULATE EMI
        // -----------------------------------------------------

        loan.setEmiAmount(
                calculateEmi(
                        loan.getLoanAmount(),
                        loan.getInterestRate(),
                        loan.getTenureMonths()
                )
        );

        // =====================================================
        // SAVE UPDATED LOAN
        // =====================================================

        Loan savedLoan =
                loanRepository.save(loan);

        // =====================================================
        // APPROVAL / REJECTION NOTIFICATION
        // =====================================================

        /*
         * Only send notification when status actually changes.
         *
         * PENDING -> APPROVED
         * PENDING -> REJECTED
         *
         * Do NOT send duplicate notification if:
         *
         * APPROVED -> APPROVED
         * REJECTED -> REJECTED
         */

        if (!equalsStatus(oldStatus, newStatus)) {

            // -------------------------------------------------
            // APPROVED
            // -------------------------------------------------

            if ("APPROVED".equals(newStatus)) {

                notifyOriginalStaffLoanApproved(
                        savedLoan
                );
            }

            // -------------------------------------------------
            // REJECTED
            // -------------------------------------------------

            else if ("REJECTED".equals(newStatus)) {

                notifyOriginalStaffLoanRejected(
                        savedLoan
                );
            }
        }

        return savedLoan;
    }

    // =========================================================
    // APPROVED NOTIFICATION
    // =========================================================

    private void notifyOriginalStaffLoanApproved(
            Loan loan) {

        if (loan == null) {
            return;
        }

        User staff =
                loan.getCreatedBy();

        if (staff == null) {
            return;
        }

        notificationService
                .notifyStaffLoanApproved(
                        staff,
                        loan.getLoanId(),
                        loan.getCustomerName()
                );
    }

    // =========================================================
    // REJECTED NOTIFICATION
    // =========================================================

    private void notifyOriginalStaffLoanRejected(
            Loan loan) {

        if (loan == null) {
            return;
        }

        User staff =
                loan.getCreatedBy();

        if (staff == null) {
            return;
        }

        notificationService
                .notifyStaffLoanRejected(
                        staff,
                        loan.getLoanId(),
                        loan.getCustomerName()
                );
    }

    // =========================================================
    // CHECK STAFF
    // =========================================================

    private boolean isStaffUser(
            User user) {

        if (user == null) {
            return false;
        }

        Role role =
                user.getRole();

        if (role == null ||
                role.getRoleName() == null) {

            return false;
        }

        String roleName =
                role.getRoleName()
                        .trim()
                        .toUpperCase();

        return roleName.equals("STAFF");
    }

    // =========================================================
    // USER DISPLAY NAME
    // =========================================================

    private String getDisplayUserName(
            User user) {

        if (user == null) {
            return "Staff";
        }

        if (user.getFullName() != null &&
                !user.getFullName()
                        .trim()
                        .isEmpty()) {

            return user.getFullName()
                    .trim();
        }

        if (user.getUsername() != null &&
                !user.getUsername()
                        .trim()
                        .isEmpty()) {

            return user.getUsername()
                    .trim();
        }

        return "Staff";
    }

    // =========================================================
    // STATUS COMPARISON
    // =========================================================

    private boolean equalsStatus(
            String first,
            String second) {

        if (first == null &&
                second == null) {

            return true;
        }

        if (first == null ||
                second == null) {

            return false;
        }

        return first.equalsIgnoreCase(
                second
        );
    }

    // =========================================================
    // LOAN ELIGIBILITY
    // =========================================================

    private void validateLoanEligibility(
            List<Loan> existingLoans,
            Loan newLoan) {

        if (existingLoans == null ||
                existingLoans.isEmpty()) {

            return;
        }

        // -----------------------------------------------------
        // MAXIMUM 2 LOANS
        // -----------------------------------------------------

        if (existingLoans.size() >= MAX_TOTAL_LOANS) {

            throw new IllegalArgumentException(
                    "Customer has already reached the maximum " +
                    "limit of 2 loans."
            );
        }

        // -----------------------------------------------------
        // CHECK EXISTING LOANS
        // -----------------------------------------------------

        for (Loan existingLoan : existingLoans) {

            if (existingLoan == null) {
                continue;
            }

            String status =
                    normalizeStatus(
                            existingLoan.getStatus()
                    );

            if (status == null) {
                continue;
            }

            // -------------------------------------------------
            // ACTIVE / PROCESSING LOAN
            // -------------------------------------------------

            if (status.equals("PENDING") ||
                    status.equals("APPROVED") ||
                    status.equals("ACTIVE") ||
                    status.equals("OVERDUE")) {

                if (!hasSecondLoanRequirements(newLoan)) {

                    throw new IllegalArgumentException(
                            "Customer already has an active/process " +
                            "loan. Second loan requires Aadhaar, " +
                            "nominee details, monthly income and " +
                            "income proof."
                    );
                }

                return;
            }
        }
    }

    // =========================================================
    // SECOND LOAN REQUIREMENTS
    // =========================================================

    private boolean hasSecondLoanRequirements(
            Loan loan) {

        if (loan == null) {
            return false;
        }

        boolean aadhaarAvailable =
                loan.getAadhaarNumber() != null &&
                        !loan.getAadhaarNumber()
                                .trim()
                                .isEmpty();

        boolean nomineeNameAvailable =
                loan.getNomineeName() != null &&
                        !loan.getNomineeName()
                                .trim()
                                .isEmpty();

        boolean nomineeRelationshipAvailable =
                loan.getNomineeRelationship() != null &&
                        !loan.getNomineeRelationship()
                                .trim()
                                .isEmpty();

        boolean nomineeMobileAvailable =
                loan.getNomineeMobile() != null &&
                        !loan.getNomineeMobile()
                                .trim()
                                .isEmpty();

        boolean incomeAvailable =
                loan.getMonthlyIncome() != null &&
                        loan.getMonthlyIncome() > 0;

        boolean incomeProofAvailable =
                loan.getIncomeProofFileName() != null &&
                        !loan.getIncomeProofFileName()
                                .trim()
                                .isEmpty();

        return aadhaarAvailable &&
                nomineeNameAvailable &&
                nomineeRelationshipAvailable &&
                nomineeMobileAvailable &&
                incomeAvailable &&
                incomeProofAvailable;
    }

    // =========================================================
    // LOAN ID GENERATOR
    // =========================================================

    private String generateUniqueLoanId() {

        String loanId;

        do {

            int number =
                    ThreadLocalRandom
                            .current()
                            .nextInt(
                                    1000,
                                    10000
                            );

            loanId =
                    "LOAN" + number;

        } while (
                loanRepository.existsByLoanId(
                        loanId
                )
        );

        return loanId;
    }

    // =========================================================
    // STATUS NORMALIZATION
    // =========================================================

    private String normalizeStatus(
            String status) {

        if (status == null) {
            return null;
        }

        String value =
                status
                        .trim()
                        .toUpperCase();

        switch (value) {

            case "PENDING":
                return "PENDING";

            case "APPROVED":
                return "APPROVED";

            case "REJECTED":
                return "REJECTED";

            case "ACTIVE":
                return "ACTIVE";

            case "OVERDUE":
                return "OVERDUE";

            case "COMPLETED":
                return "COMPLETED";

            case "CLOSED":
                return "CLOSED";

            default:
                return null;
        }
    }

    // =========================================================
    // WORKING DAYS
    // =========================================================

    private LocalDate addWorkingDays(
            LocalDate date,
            int workingDays) {

        if (date == null) {
            date = LocalDate.now();
        }

        LocalDate result = date;

        int addedDays = 0;

        while (addedDays < workingDays) {

            result =
                    result.plusDays(1);

            DayOfWeek day =
                    result.getDayOfWeek();

            if (day != DayOfWeek.SATURDAY &&
                    day != DayOfWeek.SUNDAY) {

                addedDays++;
            }
        }

        return result;
    }

    // =========================================================
    // EMI CALCULATION
    // =========================================================

    private Double calculateEmi(
            Double principal,
            Double monthlyInterestPercent,
            Integer months) {

        if (principal == null ||
                principal <= 0 ||
                monthlyInterestPercent == null ||
                months == null ||
                months <= 0) {

            return 0.0;
        }

        double monthlyRate =
                monthlyInterestPercent / 100.0;

        double power =
                Math.pow(
                        1 + monthlyRate,
                        months
                );

        double emi =
                principal
                        * monthlyRate
                        * power
                        / (power - 1);

        return Math.round(
                emi * 100.0
        ) / 100.0;
    }
}