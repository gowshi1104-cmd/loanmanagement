package com.loan.controller;

import com.loan.dto.ManagerDashboardResponse;
import com.loan.service.ManagerDashboardService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class ManagerDashboardController {

    private final ManagerDashboardService managerDashboardService;


    public ManagerDashboardController(
            ManagerDashboardService managerDashboardService
    ) {
        this.managerDashboardService = managerDashboardService;
    }


    // =========================================================
    // MANAGER DASHBOARD
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ManagerDashboardResponse getDashboard(
            Authentication authentication
    ) {

        return managerDashboardService.getDashboard(
                authentication.getName()
        );
    }

}