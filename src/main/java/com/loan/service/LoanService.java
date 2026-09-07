package com.loan.service;

import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Payment;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.PaymentRepository;
import com.loan.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class LoanService {

    private static final double MONTHLY_INTEREST_RATE = 2.0;

    // Maximum 2 loans per customer
    private static final int MAX_TOTAL_LOANS = 2;

    // NOC processing period
    private static final int NOC_PROCESSING_WORKING_DAYS = 5;

    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaymentRepository paymentRepository;

    public LoanService(
            LoanRepository loanRepository,
            MemberRepository memberRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            PaymentRepository paymentRepository) {

        this.loanRepository = loanRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // CREATE LOAN
    // =========================================================

    @Transactional
    public Loan createLoan(Loan loan) {
        return createLoan(loan, null);
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

        // -----------------------------------------------------
        // INITIAL NOC / CLOSURE VALUES
        // -----------------------------------------------------

        loan.setCompletedDate(null);
        loan.setNocEligibleDate(null);
        loan.setNocGeneratedDate(null);
        loan.setNocNumber(null);
        loan.setNocStatus(null);
        loan.setClosedDate(null);

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

        String newStatus = oldStatus;

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

            // -------------------------------------------------
            // CLOSED CAN ONLY HAPPEN AFTER NOC
            // -------------------------------------------------

            if ("CLOSED".equals(newStatus)) {

                if (!"COMPLETED".equalsIgnoreCase(
                        loan.getStatus()
                )) {

                    throw new IllegalArgumentException(
                            "Only completed loans can be closed"
                    );
                }

                if (!"GENERATED".equalsIgnoreCase(
                        loan.getNocStatus()
                ) ||
                        loan.getNocNumber() == null ||
                        loan.getNocNumber()
                                .trim()
                                .isEmpty()) {

                    throw new IllegalArgumentException(
                            "NOC must be generated before closing the loan"
                    );
                }

                loan.setClosedDate(
                        LocalDate.now()
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
        // RECALCULATE EMI PROGRESS
        // =====================================================

        savedLoan =
                updateLoanEmiProgress(
                        savedLoan
                );

        // =====================================================
        // APPROVAL / REJECTION NOTIFICATION
        // =====================================================

        if (!equalsStatus(oldStatus, newStatus)) {

            if ("APPROVED".equals(newStatus)) {

                notifyOriginalStaffLoanApproved(
                        savedLoan
                );

            } else if ("REJECTED".equals(newStatus)) {

                notifyOriginalStaffLoanRejected(
                        savedLoan
                );
            }
        }

        return savedLoan;
    }

    // =========================================================
    // SYNC EMI STATUS FOR LOAN LISTS
    // =========================================================

    @Transactional
    public List<Loan> syncLoansEmiStatus(
            List<Loan> loans) {

        if (loans == null || loans.isEmpty()) {
            return loans;
        }

        for (Loan loan : loans) {
            updateLoanEmiProgress(loan);
        }

        return loans;
    }

    // =========================================================
    // SYNC SINGLE LOAN EMI STATUS
    // =========================================================

    @Transactional
    public Loan syncLoanEmiStatus(
            Loan loan) {

        return updateLoanEmiProgress(
                loan
        );
    }

    // =========================================================
    // UPDATE EMI PROGRESS
    // =========================================================

    @Transactional
    private Loan updateLoanEmiProgress(
            Loan loan) {

        if (loan == null ||
                loan.getLoanId() == null ||
                loan.getLoanId().trim().isEmpty() ||
                loan.getTenureMonths() == null ||
                loan.getTenureMonths() <= 0 ||
                loan.getLoanDate() == null) {

            return loan;
        }

        // -----------------------------------------------------
        // CLOSED LOAN SHOULD NOT BE REOPENED
        // -----------------------------------------------------

        if ("CLOSED".equalsIgnoreCase(
                loan.getStatus()
        )) {
            return loan;
        }

        List<Payment> payments =
                paymentRepository.findByLoanId(
                        loan.getLoanId()
                );

        if (payments == null) {
            payments = List.of();
        }

        // -----------------------------------------------------
        // COLLECT SUCCESSFUL PAYMENT DATES
        // -----------------------------------------------------

        Set<LocalDate> successfulPaymentDates =
                new HashSet<>();

        for (Payment payment : payments) {

            if (payment == null ||
                    !"SUCCESS".equalsIgnoreCase(
                            payment.getStatus()
                    ) ||
                    payment.getPaymentDate() == null ||
                    payment.getPaymentDate()
                            .trim()
                            .isEmpty()) {

                continue;
            }

            try {

                LocalDate paymentDate =
                        LocalDate.parse(
                                payment.getPaymentDate()
                                        .trim(),
                                DateTimeFormatter.ISO_LOCAL_DATE
                        );

                successfulPaymentDates.add(
                        paymentDate
                );

            } catch (DateTimeParseException ignored) {
                // Ignore invalid payment dates.
            }
        }

        // -----------------------------------------------------
        // FIRST EMI DATE
        // -----------------------------------------------------

        LocalDate firstEmiDate =
                loan.getLoanDate()
                        .plusMonths(2);

        int paidEmis = 0;
        LocalDate nextUnpaidEmiDate = null;

        // -----------------------------------------------------
        // CHECK EVERY EMI
        // -----------------------------------------------------

        for (int i = 0;
             i < loan.getTenureMonths();
             i++) {

            LocalDate emiDueDate =
                    firstEmiDate.plusMonths(i);

            if (successfulPaymentDates.contains(
                    emiDueDate
            )) {

                paidEmis++;

            } else if (nextUnpaidEmiDate == null) {

                nextUnpaidEmiDate =
                        emiDueDate;
            }
        }

        // -----------------------------------------------------
        // STORE OLD VALUES
        // -----------------------------------------------------

        String oldStatus =
                normalizeStatus(
                        loan.getStatus()
                );

        LocalDate oldNextEmiDate =
                loan.getNextEmiDate();

        LocalDate oldCompletedDate =
                loan.getCompletedDate();

        LocalDate oldNocEligibleDate =
                loan.getNocEligibleDate();

        String oldNocStatus =
                loan.getNocStatus();

        // -----------------------------------------------------
        // ALL EMIs PAID
        // -----------------------------------------------------

        if (paidEmis >= loan.getTenureMonths()) {

            loan.setStatus(
                    "COMPLETED"
            );

            loan.setNextEmiDate(
                    null
            );

            // -------------------------------------------------
            // SET COMPLETION DATE ONLY ONCE
            // -------------------------------------------------

            if (loan.getCompletedDate() == null) {

                LocalDate completionDate =
                        LocalDate.now();

                loan.setCompletedDate(
                        completionDate
                );

                // ---------------------------------------------
                // NOC ELIGIBILITY
                // ---------------------------------------------

                loan.setNocEligibleDate(
                        addWorkingDays(
                                completionDate,
                                NOC_PROCESSING_WORKING_DAYS
                        )
                );

                loan.setNocStatus(
                        "PENDING"
                );
            }

            // -------------------------------------------------
            // UPDATE NOC AVAILABILITY AFTER PERIOD
            // -------------------------------------------------

            if (loan.getNocGeneratedDate() == null &&
                    loan.getNocEligibleDate() != null) {

                LocalDate today =
                        LocalDate.now();

                if (!today.isBefore(
                        loan.getNocEligibleDate()
                )) {

                    loan.setNocStatus(
                            "AVAILABLE"
                    );

                } else {

                    loan.setNocStatus(
                            "PENDING"
                    );
                }
            }

        } else {

            // -------------------------------------------------
            // NOT ALL PAID
            // -------------------------------------------------

            loan.setNextEmiDate(
                    nextUnpaidEmiDate
            );
        }

        // -----------------------------------------------------
        // CHECK CHANGES
        // -----------------------------------------------------

        boolean statusChanged =
                !equalsStatus(
                        oldStatus,
                        loan.getStatus()
                );

        boolean nextEmiChanged =
                !Objects.equals(
                        oldNextEmiDate,
                        loan.getNextEmiDate()
                );

        boolean completedDateChanged =
                !Objects.equals(
                        oldCompletedDate,
                        loan.getCompletedDate()
                );

        boolean nocEligibleDateChanged =
                !Objects.equals(
                        oldNocEligibleDate,
                        loan.getNocEligibleDate()
                );

        boolean nocStatusChanged =
                !Objects.equals(
                        oldNocStatus,
                        loan.getNocStatus()
                );

        // -----------------------------------------------------
        // SAVE ONLY WHEN REQUIRED
        // -----------------------------------------------------

        if (statusChanged ||
                nextEmiChanged ||
                completedDateChanged ||
                nocEligibleDateChanged ||
                nocStatusChanged) {

            return loanRepository.save(
                    loan
            );
        }

        return loan;
    }

    // =========================================================
    // GET NOC / CLOSURE DETAILS
    // =========================================================

    @Transactional
    public Loan getLoanClosureDetails(
            Long id) {

        Loan loan =
                loanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Loan not found"
                                )
                        );

        // Make sure stale COMPLETED loans are synchronized.
        loan =
                updateLoanEmiProgress(
                        loan
                );

        // -----------------------------------------------------
        // UPDATE NOC AVAILABILITY
        // -----------------------------------------------------

        updateNocAvailability(loan);

        return loan;
    }

    // =========================================================
    // UPDATE NOC AVAILABILITY
    // =========================================================

    @Transactional
    public Loan updateNocAvailability(
            Loan loan) {

        if (loan == null) {
            throw new IllegalArgumentException(
                    "Loan is required"
            );
        }

        if (!"COMPLETED".equalsIgnoreCase(
                normalizeStatus(loan.getStatus())
        )) {
            return loan;
        }

        if (loan.getCompletedDate() == null) {
            return loan;
        }

        // -----------------------------------------------------
        // CREATE NOC ELIGIBLE DATE IF MISSING
        // -----------------------------------------------------

        if (loan.getNocEligibleDate() == null) {

            loan.setNocEligibleDate(
                    addWorkingDays(
                            loan.getCompletedDate(),
                            NOC_PROCESSING_WORKING_DAYS
                    )
            );
        }

        // -----------------------------------------------------
        // DON'T CHANGE GENERATED NOC
        // -----------------------------------------------------

        if ("GENERATED".equalsIgnoreCase(
                loan.getNocStatus()
        )) {
            return loan;
        }

        // -----------------------------------------------------
        // CHECK ELIGIBILITY DATE
        // -----------------------------------------------------

        LocalDate today =
                LocalDate.now();

        if (!today.isBefore(
                loan.getNocEligibleDate()
        )) {

            loan.setNocStatus(
                    "AVAILABLE"
            );

        } else {

            loan.setNocStatus(
                    "PENDING"
            );
        }

        return loanRepository.save(loan);
    }

    // =========================================================
    // GENERATE NOC
    // =========================================================

    @Transactional
    public Loan generateNoc(
            Long id) {

        Loan loan =
                loanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Loan not found"
                                )
                        );

        // -----------------------------------------------------
        // SYNC EMI STATUS
        // -----------------------------------------------------

        loan =
                updateLoanEmiProgress(
                        loan
                );

        // -----------------------------------------------------
        // MUST BE COMPLETED
        // -----------------------------------------------------

        if (!"COMPLETED".equalsIgnoreCase(
                normalizeStatus(loan.getStatus())
        )) {

            throw new IllegalStateException(
                    "NOC can be generated only for completed loans"
            );
        }

        // -----------------------------------------------------
        // COMPLETION DATE
        // -----------------------------------------------------

        if (loan.getCompletedDate() == null) {

            throw new IllegalStateException(
                    "Loan completion date is not available"
            );
        }

        // -----------------------------------------------------
        // SET NOC ELIGIBLE DATE IF MISSING
        // -----------------------------------------------------

        if (loan.getNocEligibleDate() == null) {

            loan.setNocEligibleDate(
                    addWorkingDays(
                            loan.getCompletedDate(),
                            NOC_PROCESSING_WORKING_DAYS
                    )
            );
        }

        // -----------------------------------------------------
        // CHECK PROCESSING PERIOD
        // -----------------------------------------------------

        if (LocalDate.now().isBefore(
                loan.getNocEligibleDate()
        )) {

            throw new IllegalStateException(
                    "NOC is not yet eligible. NOC will be available on "
                            + loan.getNocEligibleDate()
            );
        }

        // -----------------------------------------------------
        // ALREADY GENERATED
        // -----------------------------------------------------

        if ("GENERATED".equalsIgnoreCase(
                loan.getNocStatus()
        ) &&
                loan.getNocNumber() != null &&
                !loan.getNocNumber()
                        .trim()
                        .isEmpty()) {

            return loan;
        }

        // -----------------------------------------------------
        // GENERATE NOC NUMBER
        // -----------------------------------------------------

        loan.setNocNumber(
                generateUniqueNocNumber()
        );

        loan.setNocGeneratedDate(
                LocalDate.now()
        );

        loan.setNocStatus(
                "GENERATED"
        );

        return loanRepository.save(loan);
    }

    // =========================================================
    // CLOSE LOAN
    // =========================================================

    @Transactional
    public Loan closeLoan(
            Long id) {

        Loan loan =
                loanRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Loan not found"
                                )
                        );

        // -----------------------------------------------------
        // ALREADY CLOSED
        // -----------------------------------------------------

        if ("CLOSED".equalsIgnoreCase(
                loan.getStatus()
        )) {
            return loan;
        }

        // -----------------------------------------------------
        // SYNC EMI STATUS
        // -----------------------------------------------------

        loan =
                updateLoanEmiProgress(
                        loan
                );

        // -----------------------------------------------------
        // MUST BE COMPLETED
        // -----------------------------------------------------

        if (!"COMPLETED".equalsIgnoreCase(
                normalizeStatus(loan.getStatus())
        )) {

            throw new IllegalStateException(
                    "Only completed loans can be closed"
            );
        }

        // -----------------------------------------------------
        // NOC MUST BE GENERATED
        // -----------------------------------------------------

        if (!"GENERATED".equalsIgnoreCase(
                loan.getNocStatus()
        ) ||
                loan.getNocNumber() == null ||
                loan.getNocNumber()
                        .trim()
                        .isEmpty()) {

            throw new IllegalStateException(
                    "NOC must be generated before closing the loan"
            );
        }

        // -----------------------------------------------------
        // CLOSE LOAN
        // -----------------------------------------------------

        loan.setStatus(
                "CLOSED"
        );

        loan.setClosedDate(
                LocalDate.now()
        );

        return loanRepository.save(loan);
    }

    // =========================================================
    // NOC NUMBER GENERATOR
    // =========================================================

    private String generateUniqueNocNumber() {

        while (true) {

            int number =
                    ThreadLocalRandom
                            .current()
                            .nextInt(
                                    10000,
                                    100000
                            );

            String nocNumber =
                    "NOC-" +
                            LocalDate.now().getYear() +
                            "-" +
                            number;

            /*
             * IMPORTANT:
             * nocNumber is copied into a final variable before
             * being used inside the lambda.
             * This fixes the Java compile error.
             */
            final String generatedNocNumber =
                    nocNumber;

            boolean exists =
                    loanRepository
                            .findAll()
                            .stream()
                            .anyMatch(loan ->
                                    generatedNocNumber.equals(
                                            loan.getNocNumber()
                                    )
                            );

            if (!exists) {
                return nocNumber;
            }
        }
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

        if (existingLoans.size() >=
                MAX_TOTAL_LOANS) {

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

                if (!hasSecondLoanRequirements(
                        newLoan
                )) {

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