package com.loan.controller;

import com.loan.entity.Loan;
import com.loan.entity.User;
import com.loan.repository.LoanRepository;
import com.loan.repository.UserRepository;
import com.loan.service.LoanService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanController {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final LoanService loanService;

    public LoanController(
            LoanRepository loanRepository,
            UserRepository userRepository,
            LoanService loanService) {

        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
        this.loanService = loanService;
    }

    // =========================================================
    // TEST
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "Loan Controller Working"
        );
    }

    // =========================================================
    // GET ALL LOANS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllLoans(
            Authentication authentication) {

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            List<Loan> loans =
                    loanRepository.findAll();

            loans =
                    loanService.syncLoansEmiStatus(
                            loans
                    );

            List<Loan> visibleLoans =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    visibleLoans
            );
        }

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            Optional<User> optionalUser =
                    getAuthenticatedUser(authentication);

            if (optionalUser.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                "Authenticated staff user not found"
                        );
            }

            User staffUser =
                    optionalUser.get();

            /*
             * IMPORTANT:
             *
             * Staff must see ALL loans created by themselves.
             *
             * Status does NOT matter.
             *
             * PENDING
             * APPROVED
             * REJECTED
             * ACTIVE
             * OVERDUE
             * COMPLETED
             * CLOSED
             *
             * The loan must remain visible to the
             * original creator.
             */

            List<Loan> loans =
                    loanRepository.findByCreatedBy(
                            staffUser
                    );

            loans =
                    loanService.syncLoansEmiStatus(
                            loans
                    );

            return ResponseEntity.ok(
                    loans
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // CREATE LOAN
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createLoan(
            @RequestBody Loan loan,
            Authentication authentication) {

        try {

            if (authentication == null) {

                return ResponseEntity
                        .status(
                                HttpStatus.UNAUTHORIZED
                        )
                        .body(
                                "Authentication required"
                        );
            }

            Loan savedLoan =
                    loanService.createLoan(
                            loan,
                            authentication.getName()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedLoan);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Failed to create loan"
                    );
        }
    }

    // =========================================================
    // GET LOAN BY DATABASE ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getLoanById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Loan> optionalLoan =
                loanRepository.findById(id);

        if (optionalLoan.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Loan not found with ID: " + id
                    );
        }

        Loan loan =
                optionalLoan.get();

        // IMPORTANT:
        // Sync EMI progress before checking status.

        loan =
                loanService.syncLoanEmiStatus(
                        loan
                );

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            if (!isLoanCreatedByAuthenticatedUser(
                    loan,
                    authentication
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You don't have permission to view this loan"
                        );
            }

            /*
             * Staff can view their own loan regardless
             * of its current status.
             */

            return ResponseEntity.ok(loan);
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            if (!isAdminManagerVisibleStatus(
                    loan.getStatus()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "This loan status cannot be viewed"
                        );
            }

            return ResponseEntity.ok(loan);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view this loan"
                );
    }

    // =========================================================
    // GET LOAN BY BUSINESS LOAN ID
    // =========================================================

    @GetMapping("/loan-id/{loanId}")
    public ResponseEntity<?> getLoanByLoanId(
            @PathVariable String loanId,
            Authentication authentication) {

        String normalizedLoanId =
                loanId
                        .trim()
                        .toUpperCase();

        Optional<Loan> optionalLoan =
                loanRepository.findByLoanId(
                        normalizedLoanId
                );

        if (optionalLoan.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Loan ID not found: " +
                                    normalizedLoanId
                    );
        }

        Loan loan =
                optionalLoan.get();

        // IMPORTANT:
        // Sync EMI progress before returning loan.

        loan =
                loanService.syncLoanEmiStatus(
                        loan
                );

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            if (!isLoanCreatedByAuthenticatedUser(
                    loan,
                    authentication
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You don't have permission to view this loan"
                        );
            }

            return ResponseEntity.ok(loan);
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            if (!isAdminManagerVisibleStatus(
                    loan.getStatus()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "This loan status cannot be viewed"
                        );
            }

            return ResponseEntity.ok(loan);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // GET CUSTOMER LOAN HISTORY
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerLoans(
            @PathVariable String customerId,
            Authentication authentication) {

        String normalizedCustomerId =
                customerId
                        .trim()
                        .toUpperCase();

        List<Loan> loans =
                loanRepository
                        .findByCustomerIdOrderByLoanDateDesc(
                                normalizedCustomerId
                        );

        // Sync EMI progress before filtering.

        loans =
                loanService.syncLoansEmiStatus(
                        loans
                );

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            /*
             * Staff can see only loans for this customer
             * that were created by the logged-in staff.
             *
             * Status does NOT matter.
             */

            List<Loan> ownLoans =
                    loans.stream()
                            .filter(loan ->
                                    isLoanCreatedByAuthenticatedUser(
                                            loan,
                                            authentication
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    ownLoans
            );
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            List<Loan> visibleLoans =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    visibleLoans
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // GET LOANS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getLoansByStatus(
            @PathVariable String status,
            Authentication authentication) {

        String normalizedStatus =
                status
                        .trim()
                        .toUpperCase();

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            /*
             * Staff can request any status, but only their
             * own-created loans are returned.
             *
             * Example:
             *
             * /status/PENDING
             * /status/APPROVED
             * /status/ACTIVE
             * /status/OVERDUE
             * /status/COMPLETED
             * /status/CLOSED
             */

            if (!isStaffVisibleStatus(
                    normalizedStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Invalid loan status"
                        );
            }

            Optional<User> optionalUser =
                    getAuthenticatedUser(authentication);

            if (optionalUser.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                "Authenticated staff user not found"
                        );
            }

            User staffUser =
                    optionalUser.get();

            List<Loan> loans =
                    loanRepository.findByCreatedBy(
                            staffUser
                    );

            loans =
                    loanService.syncLoansEmiStatus(
                            loans
                    );

            return ResponseEntity.ok(
                    loans.stream()
                            .filter(loan ->
                                    normalizedStatus.equalsIgnoreCase(
                                            loan.getStatus()
                                    )
                            )
                            .toList()
            );
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            if (!isAdminManagerVisibleStatus(
                    normalizedStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Only PENDING, APPROVED, REJECTED, " +
                                        "ACTIVE, OVERDUE, COMPLETED and CLOSED " +
                                        "statuses are available"
                        );
            }

            /*
             * IMPORTANT:
             *
             * Do NOT call findByStatus(normalizedStatus) first.
             *
             * Fetch all loans.
             * Synchronize EMI progress.
             * Then filter by status.
             */

            List<Loan> loans =
                    loanRepository.findAll();

            loans =
                    loanService.syncLoansEmiStatus(
                            loans
                    );

            List<Loan> filteredLoans =
                    loans.stream()
                            .filter(loan ->
                                    normalizedStatus.equalsIgnoreCase(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    filteredLoans
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // UPDATE LOAN
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLoan(
            @PathVariable Long id,
            @RequestBody Loan updatedLoan,
            Authentication authentication) {

        try {

            Optional<Loan> optionalLoan =
                    loanRepository.findById(id);

            if (optionalLoan.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Loan not found"
                        );
            }

            Loan existingLoan =
                    optionalLoan.get();

            // -------------------------------------------------
            // STAFF
            // -------------------------------------------------

            if (isStaff(authentication)) {

                if (!isLoanCreatedByAuthenticatedUser(
                        existingLoan,
                        authentication
                )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "You don't have permission to update this loan"
                            );
                }

                /*
                 * Staff can update only PENDING loans.
                 *
                 * This rule remains unchanged.
                 */

                if (!"PENDING".equalsIgnoreCase(
                        existingLoan.getStatus()
                )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "Staff can update only PENDING loans"
                            );
                }

                if (updatedLoan.getStatus() != null &&
                        !"PENDING".equalsIgnoreCase(
                                updatedLoan.getStatus()
                        )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "Staff cannot change loan status"
                            );
                }
            }

            // -------------------------------------------------
            // ADMIN / MANAGER
            // -------------------------------------------------

            else if (isAdminOrManager(
                    authentication
            )) {

                if (updatedLoan.getStatus() != null) {

                    String requestedStatus =
                            updatedLoan
                                    .getStatus()
                                    .trim()
                                    .toUpperCase();

                    if (!isAdminManagerVisibleStatus(
                            requestedStatus
                    )) {

                        return ResponseEntity
                                .badRequest()
                                .body(
                                        "Only PENDING, APPROVED, " +
                                                "REJECTED, ACTIVE, " +
                                                "OVERDUE, COMPLETED " +
                                                "and CLOSED statuses are allowed"
                                );
                    }
                }
            }

            // -------------------------------------------------
            // UNKNOWN ROLE
            // -------------------------------------------------

            else {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You are not authorized to update loans"
                        );
            }

            Loan updated =
                    loanService.updateLoan(
                            id,
                            updatedLoan
                    );

            return ResponseEntity.ok(
                    updated
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Failed to update loan"
                    );
        }
    }

    // =========================================================
    // GENERATE NOC
    // =========================================================

    @PostMapping("/{id}/generate-noc")
    public ResponseEntity<?> generateNoc(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            if (!isAdminOrManager(authentication)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Only Admin or Manager can generate NOC"
                        );
            }

            Loan loan =
                    loanService.generateNoc(id);

            return ResponseEntity.ok(
                    loan
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Failed to generate NOC"
                    );
        }
    }

    // =========================================================
    // CLOSE LOAN
    // =========================================================

    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeLoan(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            if (!isAdminOrManager(authentication)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Only Admin or Manager can close loan"
                        );
            }

            Loan loan =
                    loanService.closeLoan(id);

            return ResponseEntity.ok(
                    loan
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Failed to close loan"
                    );
        }
    }

    // =========================================================
    // DELETE LOAN
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLoan(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            Optional<Loan> optionalLoan =
                    loanRepository.findById(id);

            if (optionalLoan.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Loan not found with ID: " + id
                        );
            }

            Loan loan =
                    optionalLoan.get();

            // -------------------------------------------------
            // STAFF
            // -------------------------------------------------

            if (isStaff(authentication)) {

                if (!isLoanCreatedByAuthenticatedUser(
                        loan,
                        authentication
                )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "You don't have permission to delete this loan"
                            );
                }

                if (!"PENDING".equalsIgnoreCase(
                        loan.getStatus()
                )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "Staff can delete only PENDING loans"
                            );
                }
            }

            // -------------------------------------------------
            // ADMIN / MANAGER
            // -------------------------------------------------

            else if (isAdminOrManager(
                    authentication
            )) {

                if (!isAdminManagerVisibleStatus(
                        loan.getStatus()
                )) {

                    return ResponseEntity
                            .status(HttpStatus.FORBIDDEN)
                            .body(
                                    "This loan cannot be deleted"
                            );
                }
            }

            // -------------------------------------------------
            // UNKNOWN ROLE
            // -------------------------------------------------

            else {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You are not authorized to delete loans"
                        );
            }

            loanRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Loan deleted successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Failed to delete loan"
                    );
        }
    }

    // =========================================================
    // CHECK LOAN ID
    // =========================================================

    @GetMapping("/check-loan-id/{loanId}")
    public ResponseEntity<Boolean> checkLoanId(
            @PathVariable String loanId) {

        String normalizedLoanId =
                loanId
                        .trim()
                        .toUpperCase();

        boolean exists =
                loanRepository.existsByLoanId(
                        normalizedLoanId
                );

        return ResponseEntity.ok(
                exists
        );
    }

    // =========================================================
    // GET CUSTOMER ACTIVE / BLOCKING LOANS
    // =========================================================

    @GetMapping("/customer/{customerId}/active")
    public ResponseEntity<?> getCustomerActiveLoans(
            @PathVariable String customerId,
            Authentication authentication) {

        String normalizedCustomerId =
                customerId
                        .trim()
                        .toUpperCase();

        /*
         * Fetch all customer loans first.
         *
         * If a stale ACTIVE loan has all EMIs paid,
         * synchronization changes it to COMPLETED
         * before active-loan filtering.
         */

        List<Loan> allCustomerLoans =
                loanRepository.findByCustomerId(
                        normalizedCustomerId
                );

        allCustomerLoans =
                loanService.syncLoansEmiStatus(
                        allCustomerLoans
                );

        List<String> blockingStatuses =
                List.of(
                        "PENDING",
                        "APPROVED",
                        "ACTIVE",
                        "OVERDUE"
                );

        List<Loan> loans =
                allCustomerLoans.stream()
                        .filter(loan ->
                                loan != null &&
                                        blockingStatuses.contains(
                                                loan.getStatus() == null
                                                        ? ""
                                                        : loan.getStatus()
                                                        .trim()
                                                        .toUpperCase()
                                        )
                        )
                        .toList();

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            /*
             * Keep existing active-loan business behavior.
             *
             * Staff sees only their own-created blocking loans.
             */

            List<Loan> ownLoans =
                    loans.stream()
                            .filter(loan ->
                                    isLoanCreatedByAuthenticatedUser(
                                            loan,
                                            authentication
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    ownLoans
            );
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            List<Loan> visibleLoans =
                    loans.stream()
                            .filter(loan -> {

                                String loanStatus =
                                        loan.getStatus() == null
                                                ? ""
                                                : loan.getStatus()
                                                .trim()
                                                .toUpperCase();

                                return loanStatus.equals("PENDING") ||
                                        loanStatus.equals("APPROVED") ||
                                        loanStatus.equals("ACTIVE") ||
                                        loanStatus.equals("OVERDUE");
                            })
                            .toList();

            return ResponseEntity.ok(
                    visibleLoans
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // GET CUSTOMER LOAN COUNT
    // =========================================================

    @GetMapping("/customer/{customerId}/count")
    public ResponseEntity<?> getCustomerLoanCount(
            @PathVariable String customerId,
            Authentication authentication) {

        String normalizedCustomerId =
                customerId
                        .trim()
                        .toUpperCase();

        List<Loan> loans =
                loanRepository.findByCustomerId(
                        normalizedCustomerId
                );

        loans =
                loanService.syncLoansEmiStatus(
                        loans
                );

        // -----------------------------------------------------
        // STAFF
        // -----------------------------------------------------

        if (isStaff(authentication)) {

            long count =
                    loans.stream()
                            .filter(loan ->
                                    isLoanCreatedByAuthenticatedUser(
                                            loan,
                                            authentication
                                    )
                            )
                            .count();

            return ResponseEntity.ok(
                    count
            );
        }

        // -----------------------------------------------------
        // ADMIN / MANAGER
        // -----------------------------------------------------

        if (isAdminOrManager(authentication)) {

            long count =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .count();

            return ResponseEntity.ok(
                    count
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        "You are not authorized to view loans"
                );
    }

    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private Optional<User> getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return Optional.empty();
        }

        return userRepository.findByUsername(
                authentication.getName()
        );
    }

    // =========================================================
    // CHECK LOAN OWNER
    // =========================================================

    private boolean isLoanCreatedByAuthenticatedUser(
            Loan loan,
            Authentication authentication) {

        if (loan == null ||
                loan.getCreatedBy() == null ||
                authentication == null ||
                authentication.getName() == null) {

            return false;
        }

        User createdBy =
                loan.getCreatedBy();

        if (createdBy.getUsername() == null) {
            return false;
        }

        return createdBy
                .getUsername()
                .equalsIgnoreCase(
                        authentication.getName()
                );
    }

    // =========================================================
    // ROLE CHECK
    // =========================================================

    private boolean isStaff(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getAuthorities() == null) {

            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(
                        this::isStaffAuthority
                );
    }

    // =========================================================
    // ADMIN / MANAGER CHECK
    // =========================================================

    private boolean isAdminOrManager(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getAuthorities() == null) {

            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(
                        this::isAdminOrManagerAuthority
                );
    }

    // =========================================================
    // STAFF AUTHORITY
    // =========================================================

    private boolean isStaffAuthority(
            String authority) {

        if (authority == null) {
            return false;
        }

        String value =
                authority
                        .trim()
                        .toUpperCase();

        return value.equals("STAFF") ||
                value.equals("ROLE_STAFF");
    }

    // =========================================================
    // ADMIN / MANAGER AUTHORITY
    // =========================================================

    private boolean isAdminOrManagerAuthority(
            String authority) {

        if (authority == null) {
            return false;
        }

        String value =
                authority
                        .trim()
                        .toUpperCase();

        return value.equals("ADMIN") ||
                value.equals("ROLE_ADMIN") ||
                value.equals("MANAGER") ||
                value.equals("ROLE_MANAGER");
    }

    // =========================================================
    // ADMIN / MANAGER VISIBLE STATUS
    // =========================================================

    private boolean isAdminManagerVisibleStatus(
            String status) {

        if (status == null) {
            return false;
        }

        String normalizedStatus =
                status
                        .trim()
                        .toUpperCase();

        return normalizedStatus.equals("PENDING") ||
                normalizedStatus.equals("APPROVED") ||
                normalizedStatus.equals("REJECTED") ||
                normalizedStatus.equals("ACTIVE") ||
                normalizedStatus.equals("OVERDUE") ||
                normalizedStatus.equals("COMPLETED") ||
                normalizedStatus.equals("CLOSED");
    }

    // =========================================================
    // STAFF VISIBLE STATUS
    // =========================================================

    private boolean isStaffVisibleStatus(
            String status) {

        if (status == null) {
            return false;
        }

        String normalizedStatus =
                status
                        .trim()
                        .toUpperCase();

        return normalizedStatus.equals("PENDING") ||
                normalizedStatus.equals("APPROVED") ||
                normalizedStatus.equals("REJECTED") ||
                normalizedStatus.equals("ACTIVE") ||
                normalizedStatus.equals("OVERDUE") ||
                normalizedStatus.equals("COMPLETED") ||
                normalizedStatus.equals("CLOSED");
    }
}