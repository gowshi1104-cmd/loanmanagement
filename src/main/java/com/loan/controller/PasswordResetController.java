package com.loan.controller;

import com.loan.dto.ForgotPasswordRequest;
import com.loan.dto.ResetPasswordRequest;
import com.loan.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(
            PasswordResetService passwordResetService
    ) {
        this.passwordResetService =
                passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        passwordResetService.forgotPassword(
                request.getEmail()
        );

        /*
         * Always same response.
         * Prevents email/account enumeration.
         */
        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "If an account exists with this email, "
                                + "a password reset link has been sent."
                )
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        passwordResetService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Password reset successfully. "
                                + "Please login with your new password."
                )
        );
    }
}