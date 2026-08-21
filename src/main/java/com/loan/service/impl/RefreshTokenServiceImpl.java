package com.loan.service.impl;

import com.loan.dto.RefreshTokenResponse;
import com.loan.entity.RefreshToken;
import com.loan.entity.User;
import com.loan.repository.RefreshTokenRepository;
import com.loan.repository.UserRepository;
import com.loan.security.JwtService;
import com.loan.service.RefreshTokenService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Value("${remember-me.expiration-days:30}")
    private long rememberMeExpirationDays;

    @Value("${session.expiration-hours:24}")
    private long sessionExpirationHours;

    public RefreshTokenServiceImpl(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.refreshTokenRepository =
                refreshTokenRepository;

        this.userRepository =
                userRepository;

        this.jwtService =
                jwtService;
    }

    @Override
    @Transactional
    public String createRefreshToken(
            User user,
            boolean rememberMe
    ) {

        /*
         * Only one active refresh token per user.
         */
        refreshTokenRepository
                .deleteByUserAndRevokedFalse(user);

        byte[] randomBytes =
                new byte[64];

        secureRandom.nextBytes(randomBytes);

        String rawToken =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                randomBytes
                        );

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);

        refreshToken.setTokenHash(
                sha256(rawToken)
        );

        if (rememberMe) {

            refreshToken.setExpiresAt(
                    LocalDateTime.now()
                            .plusDays(
                                    rememberMeExpirationDays
                            )
            );

        } else {

            refreshToken.setExpiresAt(
                    LocalDateTime.now()
                            .plusHours(
                                    sessionExpirationHours
                            )
            );
        }

        refreshToken.setRevoked(false);

        refreshTokenRepository.save(
                refreshToken
        );

        return rawToken;
    }

    @Override
    @Transactional
    public RefreshTokenResponse refreshAccessToken(
            String rawRefreshToken
    ) {

        if (
                rawRefreshToken == null
                        || rawRefreshToken.isBlank()
        ) {
            throw new RuntimeException(
                    "Refresh token is required"
            );
        }

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHashAndRevokedFalse(
                                sha256(rawRefreshToken)
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid refresh token"
                                )
                        );

        if (
                refreshToken.getExpiresAt()
                        .isBefore(
                                LocalDateTime.now()
                        )
        ) {

            refreshToken.setRevoked(true);

            refreshTokenRepository.save(
                    refreshToken
            );

            throw new RuntimeException(
                    "Refresh token expired"
            );
        }

        User user =
                refreshToken.getUser();

        /*
         * Reload user from database.
         */
        user =
                userRepository
                        .findById(user.getId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        /*
         * Disabled account cannot refresh.
         */
        if (!user.isEnabled()) {

            refreshToken.setRevoked(true);

            refreshTokenRepository.save(
                    refreshToken
            );

            throw new RuntimeException(
                    "User account is disabled"
            );
        }

        /*
         * Existing refresh token is one-time-use.
         */
        refreshToken.setRevoked(true);

        refreshTokenRepository.save(
                refreshToken
        );

        /*
         * Create new refresh token.
         *
         * Since this endpoint is reached using an existing
         * refresh token, keep the persistent session.
         */
        String newRefreshToken =
                createRefreshToken(
                        user,
                        true
                );

        String newAccessToken =
                jwtService.generateToken(user);

        return new RefreshTokenResponse(
                newAccessToken,
                newRefreshToken
        );
    }

    @Override
    @Transactional
    public void revokeRefreshToken(
            String rawRefreshToken
    ) {

        if (
                rawRefreshToken == null
                        || rawRefreshToken.isBlank()
        ) {
            return;
        }

        refreshTokenRepository
                .findByTokenHashAndRevokedFalse(
                        sha256(rawRefreshToken)
                )
                .ifPresent(token -> {

                    token.setRevoked(true);

                    refreshTokenRepository.save(
                            token
                    );
                });
    }

    private String sha256(String value) {

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
                    "Unable to hash refresh token",
                    e
            );
        }
    }
}