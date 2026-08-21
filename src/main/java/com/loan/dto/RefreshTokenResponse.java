package com.loan.dto;

public class RefreshTokenResponse {

    private String token;
    private String refreshToken;

    public RefreshTokenResponse() {
    }

    public RefreshTokenResponse(
            String token,
            String refreshToken
    ) {
        this.token = token;
        this.refreshToken = refreshToken;
    }

    public String getToken() {
        return token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}