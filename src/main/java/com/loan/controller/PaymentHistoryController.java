package com.loan.controller;

import com.loan.dto.PaymentHistoryResponse;
import com.loan.service.PaymentHistoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment-history")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentHistoryController(
            PaymentHistoryService paymentHistoryService) {

        this.paymentHistoryService =
                paymentHistoryService;
    }

    // =========================================================
    // GET PAYMENT HISTORY BY LOAN ID
    //
    // Example:
    //
    // GET /api/payment-history/LOAN1234
    //
    // =========================================================

    @GetMapping("/{loanId}")
    public ResponseEntity<PaymentHistoryResponse>
    getPaymentHistory(
            @PathVariable String loanId) {

        PaymentHistoryResponse response =
                paymentHistoryService
                        .getPaymentHistory(loanId);

        return ResponseEntity.ok(response);
    }
}