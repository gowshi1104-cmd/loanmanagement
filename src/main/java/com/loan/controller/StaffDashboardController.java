package com.loan.controller;

import com.loan.dto.StaffDashboardResponse;
import com.loan.service.StaffDashboardService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffDashboardController {

    private final StaffDashboardService staffDashboardService;

    public StaffDashboardController(
            StaffDashboardService staffDashboardService
    ) {
        this.staffDashboardService =
                staffDashboardService;
    }

    // =========================================================
    // STAFF DASHBOARD
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getDashboard(
            Authentication authentication
    ) {

        // =====================================================
        // AUTHENTICATION CHECK
        // =====================================================

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authentication required"
                    );
        }

        // =====================================================
        // STAFF ROLE CHECK
        // =====================================================

        boolean isStaff =
                authentication
                        .getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(
                                authority ->
                                        "ROLE_STAFF"
                                                .equalsIgnoreCase(
                                                        authority
                                                )
                        );

        // =====================================================
        // DEBUG
        // =====================================================

        System.out.println(
                "========================================"
        );

        System.out.println(
                "STAFF DASHBOARD CONTROLLER"
        );

        System.out.println(
                "Username: "
                        + authentication.getName()
        );

        System.out.println(
                "Authorities: "
                        + authentication.getAuthorities()
        );

        System.out.println(
                "Is Staff: "
                        + isStaff
        );

        System.out.println(
                "========================================"
        );

        // =====================================================
        // NOT STAFF
        // =====================================================

        if (!isStaff) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only STAFF users can access Staff Dashboard"
                    );
        }

        // =====================================================
        // GET DASHBOARD DATA
        // =====================================================

        StaffDashboardResponse response =
                staffDashboardService.getDashboard(
                        authentication
                );

        return ResponseEntity.ok(
                response
        );
    }
}