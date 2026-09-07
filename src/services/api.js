import axios from "axios";

const api = axios.create({
  baseURL: "https://loanmanagement-production-6225.up.railway.app/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    console.log("================================");
    console.log("API REQUEST:", config.method?.toUpperCase());
    console.log(
      "URL:",
      `${config.baseURL}${config.url}`
    );
    console.log("TOKEN EXISTS:", !!token);

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;

      console.log(
        "AUTH HEADER ATTACHED:",
        config.headers.Authorization
      );
    } else {
      console.log("❌ NO TOKEN FOUND");
    }

    console.log("================================");

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;