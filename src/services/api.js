import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
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