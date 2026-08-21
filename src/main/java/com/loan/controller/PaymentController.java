package com.loan.controller;

import com.loan.dto.PaymentErrorResponse;
import com.loan.dto.PaymentResponse;
import com.loan.entity.Payment;
import com.loan.service.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {

        List<Payment> payments =
                paymentService.getAllPayments();

        return ResponseEntity.ok(payments);
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id) {

        try {

            Payment payment =
                    paymentService.getPaymentById(id);

            if (payment == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(payment);

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
    // GET PAYMENTS BY LOAN ID
    //
    // Example:
    // GET /api/payments/loan/LOAN3919
    // =========================================================

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<?> getPaymentsByLoanId(
            @PathVariable String loanId) {

        try {

            return ResponseEntity.ok(
                    paymentService.getPaymentsByLoanId(
                            loanId
                    )
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
    // MEMBER / LOAN PAYMENT DETAILS
    //
    // Existing frontend sends LOAN ID.
    // =========================================================

    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberPaymentDetails(
            @PathVariable String memberId) {

        try {

            return ResponseEntity.ok(
                    paymentService.getMemberPaymentDetails(
                            memberId
                    )
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
    // SECURITY TEST - GET
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<String> testPaymentSecurity() {

        return ResponseEntity.ok(
                "Payment API GET is working"
        );
    }

    // =========================================================
    // SECURITY TEST - POST
    // =========================================================

    @PostMapping("/test")
    public ResponseEntity<String> testPaymentPost() {

        return ResponseEntity.ok(
                "Payment API POST is working"
        );
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestBody Payment payment) {

        try {

            Payment createdPayment =
                    paymentService.createPayment(payment);

            return ResponseEntity.ok(createdPayment);

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
    // CREATE CASHFREE ORDER
    // =========================================================

    @PostMapping("/{id}/cashfree/order")
    public ResponseEntity<?> createCashfreeOrder(
            @PathVariable Long id) {

        try {

            Map<String, Object> response =
                    paymentService.createCashfreeOrder(id);

            return ResponseEntity.ok(response);

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
    // CHECK CASHFREE PAYMENT STATUS
    // =========================================================

    @GetMapping("/{id}/cashfree/status")
    public ResponseEntity<?> checkCashfreePaymentStatus(
            @PathVariable Long id) {

        try {

            PaymentResponse response =
                    paymentService.checkCashfreePaymentStatus(id);

            return ResponseEntity.ok(response);

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
    // UPDATE PAYMENT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(
            @PathVariable Long id,
            @RequestBody Payment payment) {

        try {

            Payment updatedPayment =
                    paymentService.updatePayment(
                            id,
                            payment
                    );

            if (updatedPayment == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(updatedPayment);

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
    // DELETE PAYMENT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePayment(
            @PathVariable Long id) {

        try {

            paymentService.deletePayment(id);

            return ResponseEntity.ok(
                    "Payment deleted successfully"
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
}