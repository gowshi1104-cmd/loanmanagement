package com.loan.controller;

import com.loan.entity.Loan;
import com.loan.repository.LoanRepository;
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
    private final LoanService loanService;

    public LoanController(
            LoanRepository loanRepository,
            LoanService loanService) {

        this.loanRepository = loanRepository;
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
    //
    // STAFF   -> PENDING only
    // ADMIN   -> PENDING / APPROVED / REJECTED
    // MANAGER -> PENDING / APPROVED / REJECTED
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllLoans(
            Authentication authentication) {

        if (isAdminOrManager(authentication)) {

            List<Loan> loans =
                    loanRepository.findAll()
                            .stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(loans);
        }

        if (isStaff(authentication)) {

            List<Loan> loans =
                    loanRepository.findByStatus("PENDING");

            return ResponseEntity.ok(loans);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to view loans");
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
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required");
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
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create loan");
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
                    .body("Loan not found with ID: " + id);
        }

        Loan loan = optionalLoan.get();

        // STAFF
        if (isStaff(authentication)) {

            if (!"PENDING".equalsIgnoreCase(
                    loan.getStatus()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Staff can view only PENDING loans"
                        );
            }

            return ResponseEntity.ok(loan);
        }

        // ADMIN / MANAGER
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
                .body("You are not authorized to view this loan");
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

        Loan loan = optionalLoan.get();

        if (isStaff(authentication)) {

            if (!"PENDING".equalsIgnoreCase(
                    loan.getStatus()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Staff can view only PENDING loans"
                        );
            }

            return ResponseEntity.ok(loan);
        }

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
                .body("You are not authorized to view loans");
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

        if (isStaff(authentication)) {

            List<Loan> pendingLoans =
                    loans.stream()
                            .filter(loan ->
                                    "PENDING".equalsIgnoreCase(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(pendingLoans);
        }

        if (isAdminOrManager(authentication)) {

            List<Loan> visibleLoans =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(visibleLoans);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to view loans");
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

        // STAFF
        if (isStaff(authentication)) {

            if (!"PENDING".equals(normalizedStatus)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "Staff can view only PENDING loans"
                        );
            }

            return ResponseEntity.ok(
                    loanRepository.findByStatus("PENDING")
            );
        }

        // ADMIN / MANAGER
        if (isAdminOrManager(authentication)) {

            if (!isAdminManagerVisibleStatus(
                    normalizedStatus
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Only PENDING, APPROVED and REJECTED " +
                                "statuses are available"
                        );
            }

            return ResponseEntity.ok(
                    loanRepository.findByStatus(
                            normalizedStatus
                    )
            );
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to view loans");
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
                        .body("Loan not found");
            }

            Loan existingLoan =
                    optionalLoan.get();

            // -------------------------------------------------
            // STAFF
            // -------------------------------------------------

            if (isStaff(authentication)) {

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

            else if (isAdminOrManager(authentication)) {

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
                                        "Only PENDING, APPROVED and " +
                                        "REJECTED statuses are allowed"
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

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update loan");
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

            // STAFF
            if (isStaff(authentication)) {

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

            // ADMIN / MANAGER
            else if (isAdminOrManager(authentication)) {

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
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete loan");
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

        return ResponseEntity.ok(exists);
    }

    // =========================================================
    // GET CUSTOMER ACTIVE/BLOCKING LOANS
    // =========================================================

    @GetMapping("/customer/{customerId}/active")
    public ResponseEntity<?> getCustomerActiveLoans(
            @PathVariable String customerId,
            Authentication authentication) {

        String normalizedCustomerId =
                customerId
                        .trim()
                        .toUpperCase();

        List<String> blockingStatuses =
                List.of(
                        "PENDING",
                        "APPROVED",
                        "ACTIVE",
                        "OVERDUE"
                );

        List<Loan> loans =
                loanRepository
                        .findByCustomerIdAndStatusIn(
                                normalizedCustomerId,
                                blockingStatuses
                        );

        if (isStaff(authentication)) {

            List<Loan> pendingLoans =
                    loans.stream()
                            .filter(loan ->
                                    "PENDING".equalsIgnoreCase(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(pendingLoans);
        }

        if (isAdminOrManager(authentication)) {

            List<Loan> visibleLoans =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(visibleLoans);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to view loans");
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

        if (isStaff(authentication)) {

            long count =
                    loans.stream()
                            .filter(loan ->
                                    "PENDING".equalsIgnoreCase(
                                            loan.getStatus()
                                    )
                            )
                            .count();

            return ResponseEntity.ok(count);
        }

        if (isAdminOrManager(authentication)) {

            long count =
                    loans.stream()
                            .filter(loan ->
                                    isAdminManagerVisibleStatus(
                                            loan.getStatus()
                                    )
                            )
                            .count();

            return ResponseEntity.ok(count);
        }

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to view loans");
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
                .anyMatch(this::isStaffAuthority);
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
                .anyMatch(this::isAdminOrManagerAuthority);
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
                normalizedStatus.equals("REJECTED");
    }
}