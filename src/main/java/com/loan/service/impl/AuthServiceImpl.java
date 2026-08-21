package com.loan.service.impl;

import com.loan.dto.AuthRequest;
import com.loan.dto.AuthResponse;
import com.loan.entity.Permission;
import com.loan.entity.User;
import com.loan.repository.UserRepository;
import com.loan.security.JwtService;
import com.loan.service.AuthService;
import com.loan.service.RefreshTokenService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.authenticationManager =
                authenticationManager;

        this.userRepository =
                userRepository;

        this.jwtService =
                jwtService;

        this.refreshTokenService =
                refreshTokenService;
    }

    @Override
    public AuthResponse login(
            AuthRequest request
    ) {

        /*
         * =====================================================
         * AUTHENTICATE USER
         * =====================================================
         */

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        /*
         * =====================================================
         * LOAD CURRENT USER
         * =====================================================
         */

        User user =
                userRepository
                        .findByUsername(
                                request.getUsername()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        /*
         * =====================================================
         * ACCOUNT STATUS
         * =====================================================
         */

        if (!user.isEnabled()) {

            throw new RuntimeException(
                    "User account is disabled"
            );
        }

        /*
         * =====================================================
         * ROLE VALIDATION
         * =====================================================
         */

        if (user.getRole() == null) {

            throw new RuntimeException(
                    "User role is not configured"
            );
        }

        /*
         * =====================================================
         * GENERATE ACCESS JWT
         * =====================================================
         */

        String token =
                jwtService.generateToken(user);

        /*
         * =====================================================
         * GENERATE REFRESH TOKEN
         * =====================================================
         */

        String refreshToken =
                refreshTokenService.createRefreshToken(
                        user,
                        request.isRememberMe()
                );

        /*
         * =====================================================
         * CURRENT DATABASE PERMISSIONS
         * =====================================================
         */

        List<String> permissions =
                user.getRole()
                        .getPermissions()
                        .stream()
                        .map(
                                Permission::getPermissionName
                        )
                        .collect(
                                Collectors.toList()
                        );

        /*
         * =====================================================
         * AUTH RESPONSE
         * =====================================================
         */

        return new AuthResponse(
                token,
                refreshToken,
                user.getUsername(),
                user.getFullName(),
                user.getRole().getRoleName(),
                permissions
        );
    }
}