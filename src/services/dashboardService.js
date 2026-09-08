import axios from "axios";

// const API_URL = "http://localhost:8080/api";
const API_URL = "https://loanmanagement-production-6225.up.railway.app/api";

const dashboardApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// GET TOKEN
// ============================================================

const getToken = () => {

  const possibleKeys = [
    "token",
    "accessToken",
    "jwtToken",
    "authToken",
    "jwt",
  ];

  for (const key of possibleKeys) {

    const token =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (token && token.trim()) {
      return token.trim();
    }
  }

  return null;
};


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

dashboardApi.interceptors.request.use(
  (config) => {

    const token = getToken();

    console.log(
      "========================================"
    );

    console.log(
      "DASHBOARD REQUEST"
    );

    console.log(
      "URL:",
      config.url
    );

    console.log(
      "TOKEN EXISTS:",
      !!token
    );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    console.log(
      "AUTHORIZATION HEADER:",
      config.headers.Authorization
        ? "Bearer ********"
        : "NOT SET"
    );

    console.log(
      "========================================"
    );

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// GET DASHBOARD
// ============================================================

export const getDashboardStats = async () => {

  try {

    const response =
      await dashboardApi.get(
        "/dashboard"
      );

    return response.data;

  } catch (error) {

    console.error(
      "Dashboard API Error:",
      error
    );

    if (error.response) {

      console.error(
        "Status:",
        error.response.status
      );

      console.error(
        "Response:",
        error.response.data
      );
    }

    throw error;
  }
};

export default dashboardApi;