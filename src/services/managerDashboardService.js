import axios from "axios";

// const API_URL = "http://localhost:8080/api/manager/dashboard";
const API_URL = "https://gonna-craig-albums-oclc.trycloudflare.com/api/manager/dashboard";

// =========================================================
// GET MANAGER DASHBOARD
// =========================================================

export const getManagerDashboard = async () => {
  const token = sessionStorage.getItem("token");

  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};