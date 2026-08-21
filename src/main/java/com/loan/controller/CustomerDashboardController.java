package com.loan.controller;

import com.loan.dto.CustomerDashboardResponse;
import com.loan.dto.CustomerEmiScheduleResponse;
import com.loan.dto.PaymentHistoryResponse;
import com.loan.entity.Loan;
import com.loan.entity.User;
import com.loan.service.CustomerDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerDashboardController {

    private final CustomerDashboardService customerDashboardService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerDashboardController(
            CustomerDashboardService customerDashboardService) {

        this.customerDashboardService =
                customerDashboardService;
    }

    // =========================================================
    // CUSTOMER DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<CustomerDashboardResponse> getDashboard(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        CustomerDashboardResponse response =
                customerDashboardService.getDashboard(user);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // MY LOANS
    // =========================================================

    @GetMapping("/loans")
    public ResponseEntity<List<Loan>> getMyLoans(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        List<Loan> loans =
                customerDashboardService.getMyLoans(user);

        return ResponseEntity.ok(loans);
    }

    // =========================================================
    // MY EMI SCHEDULE
    // =========================================================

    @GetMapping("/emi-schedule")
    public ResponseEntity<List<CustomerEmiScheduleResponse>>
    getMyEmiSchedule(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        List<CustomerEmiScheduleResponse> schedule =
                customerDashboardService.getMyEmiSchedule(user);

        return ResponseEntity.ok(schedule);
    }

    // =========================================================
    // MY PAYMENT HISTORY
    // =========================================================

    @GetMapping("/payment-history")
    public ResponseEntity<List<PaymentHistoryResponse>>
    getMyPaymentHistory(
            Authentication authentication) {

        User user =
                (User) authentication.getPrincipal();

        List<PaymentHistoryResponse> paymentHistory =
                customerDashboardService.getMyPaymentHistory(user);

        return ResponseEntity.ok(paymentHistory);
    }
}