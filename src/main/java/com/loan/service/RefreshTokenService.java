package com.loan.service;

import com.loan.dto.RefreshTokenResponse;
import com.loan.entity.User;

public interface RefreshTokenService {

    String createRefreshToken(
            User user,
            boolean rememberMe
    );

    RefreshTokenResponse refreshAccessToken(
            String refreshToken
    );

    void revokeRefreshToken(
            String refreshToken
    );
}