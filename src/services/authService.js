import api from "./api";

export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const refreshToken = (refreshTokenValue) => {
  return api.post("/auth/refresh", {
    refreshToken: refreshTokenValue,
  });
};

export const logout = (refreshTokenValue) => {
  return api.post("/auth/logout", {
    refreshToken: refreshTokenValue,
  });
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = (
  token,
  newPassword
) => {
  return api.post("/auth/reset-password", {
    token,
    newPassword,
  });
};