package com.loan.service;

import com.loan.dto.ManagerDashboardResponse;

public interface ManagerDashboardService {

    ManagerDashboardResponse getDashboard(
            String username
    );

}