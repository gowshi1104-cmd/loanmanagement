package com.loan.service;

import com.loan.dto.AuthRequest;
import com.loan.dto.AuthResponse;

public interface AuthService {

    AuthResponse login(AuthRequest request);
    

}