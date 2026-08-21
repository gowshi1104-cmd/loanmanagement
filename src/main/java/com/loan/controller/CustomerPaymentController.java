package com.loan.controller;

import com.loan.dto.CustomerPaymentRequest;
import com.loan.dto.CustomerPaymentResponse;
import com.loan.dto.PaymentErrorResponse;
import com.loan.service.CustomerPaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/payments")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class CustomerPaymentController {

    private final CustomerPaymentService
            customerPaymentService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerPaymentController(
            CustomerPaymentService
                    customerPaymentService) {

        this.customerPaymentService =
                customerPaymentService;
    }

    // =========================================================
    // GET MY LOANS / EMI DETAILS
    //
    // GET /api/customer/payments/my-loans
    // =========================================================

    @GetMapping("/my-loans")
    public ResponseEntity<?> getMyLoans(
            Authentication authentication) {

        try {

            String customerId =
                    getAuthenticatedCustomerId(
                            authentication
                    );

            List<CustomerPaymentResponse> response =
                    customerPaymentService
                            .getMyLoanDetails(
                                    customerId
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new PaymentErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // CREATE EMI PAYMENT
    //
    // POST /api/customer/payments
    //
    // BODY:
    // {
    //     "loanId": "LOAN3919"
    // }
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createPayment(
            Authentication authentication,
            @RequestBody
            CustomerPaymentRequest request) {

        try {

            String customerId =
                    getAuthenticatedCustomerId(
                            authentication
                    );

            CustomerPaymentResponse response =
                    customerPaymentService
                            .createCustomerPayment(
                                    customerId,
                                    request
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new PaymentErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // CHECK PAYMENT STATUS
    //
    // GET
    // /api/customer/payments/{id}/status
    // =========================================================

    @GetMapping("/{id}/status")
    public ResponseEntity<?> checkPaymentStatus(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            String customerId =
                    getAuthenticatedCustomerId(
                            authentication
                    );

            CustomerPaymentResponse response =
                    customerPaymentService
                            .checkPaymentStatus(
                                    customerId,
                                    id
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new PaymentErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // MY PAYMENT HISTORY
    //
    // GET /api/customer/payments/history
    // =========================================================

    @GetMapping("/history")
    public ResponseEntity<?> getMyPaymentHistory(
            Authentication authentication) {

        try {

            String customerId =
                    getAuthenticatedCustomerId(
                            authentication
                    );

            List<CustomerPaymentResponse> response =
                    customerPaymentService
                            .getMyPaymentHistory(
                                    customerId
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new PaymentErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // GET SINGLE PAYMENT
    //
    // GET /api/customer/payments/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            String customerId =
                    getAuthenticatedCustomerId(
                            authentication
                    );

            CustomerPaymentResponse response =
                    customerPaymentService
                            .getMyPaymentById(
                                    customerId,
                                    id
                            );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new PaymentErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =========================================================
    // GET AUTHENTICATED CUSTOMER
    // =========================================================

    private String getAuthenticatedCustomerId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        return authentication.getName();
    }
}