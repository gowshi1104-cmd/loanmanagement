package com.loan.security;

import com.loan.entity.User;
import com.loan.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // =========================================================
        // NO JWT
        // =========================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =========================================================
        // EXTRACT TOKEN
        // =========================================================

        String token =
                authHeader.substring(7).trim();

        if (token.isEmpty()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            // =====================================================
            // EXTRACT USERNAME FROM VERIFIED JWT
            // =====================================================

            String username =
                    jwtService.extractUsername(token);

            if (username == null ||
                    username.isBlank()) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =====================================================
            // DON'T RE-AUTHENTICATE
            // =====================================================

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() != null) {

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =====================================================
            // LOAD CURRENT USER FROM DATABASE
            // =====================================================

            User user =
                    userRepository
                            .findByUsername(username)
                            .orElse(null);

            if (user == null) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =====================================================
            // ACCOUNT STATUS
            // =====================================================

            if (!user.isEnabled()) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =====================================================
            // TOKEN VALIDATION
            // =====================================================

            boolean validToken =
                    jwtService.isTokenValid(
                            token,
                            user
                    );

            if (!validToken) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =====================================================
            // AUTHORITIES
            //
            // IMPORTANT:
            // ONLY DATABASE ROLE + DATABASE PERMISSIONS
            //
            // JWT permissions are intentionally NOT trusted.
            // =====================================================

            List<SimpleGrantedAuthority> authorities =
                    new ArrayList<>();

            // =====================================================
            // DATABASE AUTHORITIES
            // =====================================================

            if (user.getAuthorities() != null) {

                user.getAuthorities()
                        .forEach(authority -> {

                            if (authority == null) {
                                return;
                            }

                            String authorityName =
                                    authority.getAuthority();

                            if (authorityName == null) {
                                return;
                            }

                            authorityName =
                                    authorityName.trim();

                            if (authorityName.isEmpty()) {
                                return;
                            }

                            addAuthorityIfMissing(
                                    authorities,
                                    authorityName
                            );
                        });
            }

            // =====================================================
            // CREATE AUTHENTICATION
            // =====================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authorities
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            // =====================================================
            // SET SECURITY CONTEXT
            // =====================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );

        } catch (Exception e) {

            // =====================================================
            // INVALID / EXPIRED / MALFORMED JWT
            //
            // Don't expose internal JWT exception details.
            // =====================================================

            SecurityContextHolder.clearContext();
        }

        // =========================================================
        // CONTINUE FILTER CHAIN
        // =========================================================

        filterChain.doFilter(
                request,
                response
        );
    }

    // =============================================================
    // ADD AUTHORITY ONLY ONCE
    // =============================================================

    private void addAuthorityIfMissing(
            List<SimpleGrantedAuthority> authorities,
            String authorityName
    ) {

        boolean exists =
                authorities.stream()
                        .anyMatch(
                                authority ->
                                        authority
                                                .getAuthority()
                                                .equals(
                                                        authorityName
                                                )
                        );

        if (!exists) {

            authorities.add(
                    new SimpleGrantedAuthority(
                            authorityName
                    )
            );
        }
    }
}