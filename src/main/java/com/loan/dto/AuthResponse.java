package com.loan.dto;

import java.util.List;

public class AuthResponse {

    private String token;
    private String refreshToken;
    private String username;
    private String fullName;
    private String role;
    private List<String> permissions;
    private boolean mustChangePassword;

    public AuthResponse(
            String token,
            String refreshToken,
            String username,
            String fullName,
            String role,
            List<String> permissions,
            boolean mustChangePassword
    ) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.permissions = permissions;
        this.mustChangePassword = mustChangePassword;
    }

    public String getToken() {
        return token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public boolean isMustChangePassword() {
        return mustChangePassword;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public void setMustChangePassword(boolean mustChangePassword) {
        this.mustChangePassword = mustChangePassword;
    }
}