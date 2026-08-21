package com.loan.security;

import com.loan.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // =========================================================
    // JWT CONFIGURATION
    // =========================================================

    private final String secret;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT secret must contain at least 32 characters"
            );
        }

        this.secret = secret;
        this.expiration = expiration;
    }

    // =========================================================
    // SIGNING KEY
    // =========================================================

    private Key getSignKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    // =========================================================
    // GENERATE TOKEN
    // =========================================================

    public String generateToken(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User cannot be null"
            );
        }

        if (user.getUsername() == null ||
                user.getUsername().isBlank()) {

            throw new IllegalArgumentException(
                    "Username cannot be empty"
            );
        }

        if (user.getRole() == null ||
                user.getRole().getRoleName() == null) {

            throw new IllegalStateException(
                    "User role is required for JWT generation"
            );
        }

        Map<String, Object> claims =
                new HashMap<>();

        // =====================================================
        // ROLE
        // =====================================================

        claims.put(
                "role",
                user.getRole().getRoleName()
        );

        // =====================================================
        // PERMISSIONS
        //
        // Kept in JWT because frontend uses them
        // for menu/page visibility.
        //
        // JwtFilter will NOT trust these for backend security.
        // Backend permissions are loaded from DB.
        // =====================================================

        List<String> permissions =
                user.getRole()
                        .getPermissions()
                        .stream()
                        .map(permission ->
                                permission.getPermissionName()
                        )
                        .toList();

        claims.put(
                "permissions",
                permissions
        );

        // =====================================================
        // TOKEN
        // =====================================================

        Date issuedAt =
                new Date();

        Date expirationDate =
                new Date(
                        issuedAt.getTime()
                                + expiration
                );

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(
                        user.getUsername()
                )
                .setIssuedAt(
                        issuedAt
                )
                .setExpiration(
                        expirationDate
                )
                .signWith(
                        getSignKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // =========================================================
    // EXTRACT USERNAME
    // =========================================================

    public String extractUsername(
            String token
    ) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // =========================================================
    // EXTRACT CLAIM
    // =========================================================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        Claims claims =
                extractAllClaims(token);

        return claimsResolver.apply(
                claims
        );
    }

    // =========================================================
    // EXTRACT ALL CLAIMS
    // =========================================================

    private Claims extractAllClaims(
            String token
    ) {

        return Jwts.parserBuilder()
                .setSigningKey(
                        getSignKey()
                )
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =========================================================
    // VALIDATE TOKEN
    // =========================================================

    public boolean isTokenValid(
            String token,
            org.springframework.security.core.userdetails.UserDetails userDetails
    ) {

        if (token == null ||
                token.isBlank() ||
                userDetails == null) {

            return false;
        }

        try {

            String username =
                    extractUsername(token);

            return username != null
                    && username.equals(
                            userDetails.getUsername()
                    )
                    && userDetails.isEnabled()
                    && !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    // =========================================================
    // TOKEN EXPIRATION
    // =========================================================

    private boolean isTokenExpired(
            String token
    ) {

        return extractClaim(
                token,
                Claims::getExpiration
        ).before(
                new Date()
        );
    }

    // =========================================================
    // FILTER CLAIMS
    // =========================================================

    public Claims extractAllClaimsForFilter(
            String token
    ) {

        return Jwts.parserBuilder()
                .setSigningKey(
                        getSignKey()
                )
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}