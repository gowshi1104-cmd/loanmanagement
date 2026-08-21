package com.loan.controller;

import com.loan.dto.AuthRequest;
import com.loan.dto.AuthResponse;
import com.loan.dto.RefreshTokenResponse;
import com.loan.service.AuthService;
import com.loan.service.RefreshTokenService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(
            AuthService authService,
            RefreshTokenService refreshTokenService
    ) {
        this.authService = authService;
        this.refreshTokenService =
                refreshTokenService;
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    /*
     * =========================================================
     * REFRESH ACCESS TOKEN
     * =========================================================
     */

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @RequestBody Map<String, String> request
    ) {

        String refreshToken =
                request.get("refreshToken");

        return ResponseEntity.ok(
                refreshTokenService
                        .refreshAccessToken(
                                refreshToken
                        )
        );
    }

    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody Map<String, String> request
    ) {

        refreshTokenService.revokeRefreshToken(
                request.get("refreshToken")
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logged out successfully"
                )
        );
    }
}