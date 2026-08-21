package com.loan.service.impl;

import com.loan.entity.PasswordResetToken;
import com.loan.entity.User;
import com.loan.repository.PasswordResetTokenRepository;
import com.loan.repository.RefreshTokenRepository;
import com.loan.repository.UserRepository;
import com.loan.service.PasswordResetService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class PasswordResetServiceImpl
        implements PasswordResetService {

    private final UserRepository userRepository;

    private final PasswordResetTokenRepository
            passwordResetTokenRepository;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final PasswordEncoder passwordEncoder;

    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${password-reset.expiration-minutes:15}")
    private long expirationMinutes;

    public PasswordResetServiceImpl(
            UserRepository userRepository,
            PasswordResetTokenRepository
                    passwordResetTokenRepository,
            RefreshTokenRepository
                    refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.userRepository =
                userRepository;

        this.passwordResetTokenRepository =
                passwordResetTokenRepository;

        this.refreshTokenRepository =
                refreshTokenRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.mailSender =
                mailSender;
    }

    @Override
    @Transactional
    public void forgotPassword(
            String email
    ) {

        String normalizedEmail =
                email == null
                        ? ""
                        : email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElse(null);

        /*
         * Never reveal whether account exists.
         */
        if (user == null) {
            return;
        }

        /*
         * Remove old reset token.
         */
        passwordResetTokenRepository
                .deleteByUser(user);

        /*
         * IMPORTANT:
         *
         * Force Hibernate to execute the DELETE
         * before inserting the new token.
         *
         * Without this, the INSERT may happen before
         * the DELETE and cause:
         *
         * Duplicate entry 'user_id'
         */
        passwordResetTokenRepository.flush();

        /*
         * Generate secure random token.
         */
        byte[] randomBytes =
                new byte[48];

        secureRandom.nextBytes(
                randomBytes
        );

        String rawToken =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                randomBytes
                        );

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setUser(user);

        resetToken.setTokenHash(
                sha256(rawToken)
        );

        resetToken.setExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(
                                expirationMinutes
                        )
        );

        resetToken.setUsed(false);

        passwordResetTokenRepository.save(
                resetToken
        );

        String resetUrl =
                frontendUrl
                        + "/reset-password?token="
                        + rawToken;

        sendResetEmail(
                user.getEmail(),
                user.getFullName(),
                resetUrl
        );
    }

    @Override
    @Transactional
    public void resetPassword(
            String token,
            String newPassword
    ) {

        if (
                token == null
                        || token.trim().isEmpty()
        ) {
            throw new RuntimeException(
                    "Invalid or expired reset link"
            );
        }

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByTokenHashAndUsedFalse(
                                sha256(token)
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid or expired reset link"
                                )
                        );

        if (
                resetToken
                        .getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {
            throw new RuntimeException(
                    "Invalid or expired reset link"
            );
        }

        User user =
                resetToken.getUser();

        /*
         * Update password using BCrypt encoder.
         */
        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        userRepository.save(user);

        /*
         * Token can never be used again.
         */
        resetToken.setUsed(true);

        passwordResetTokenRepository.save(
                resetToken
        );

        /*
         * Password reset invalidates all
         * Remember Me sessions.
         */
        refreshTokenRepository.deleteByUser(
                user
        );
    }

    private void sendResetEmail(
            String email,
            String fullName,
            String resetUrl
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "Loan Management System - Password Reset"
        );

        String name =
                fullName == null
                        || fullName.isBlank()
                        ? "User"
                        : fullName;

        message.setText(
                "Hello " + name + ",\n\n"

                        + "We received a request to reset your "
                        + "Loan Management System password.\n\n"

                        + "Reset your password using the link below:\n\n"

                        + resetUrl

                        + "\n\n"

                        + "This link will expire in "
                        + expirationMinutes
                        + " minutes and can be used only once.\n\n"

                        + "If you did not request this password reset, "
                        + "you can safely ignore this email.\n\n"

                        + "Regards,\n"
                        + "Loan Management System"
        );

        mailSender.send(message);
    }

    private String sha256(
            String value
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder hex =
                    new StringBuilder();

            for (byte b : hash) {

                hex.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }

            return hex.toString();

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to hash reset token",
                    e
            );
        }
    }
}