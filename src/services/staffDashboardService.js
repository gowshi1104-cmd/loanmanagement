import api from "../api/axios";

// =========================================================
// GET STAFF DASHBOARD
// =========================================================

export const getStaffDashboardStats = async () => {
    try {
        const response = await api.get("/staff/dashboard");

        console.log(
            "Staff Dashboard API Success:",
            response.data
        );

        return response.data;

    } catch (error) {

        console.error(
            "Staff Dashboard API Error:",
            error
        );

        // Backend response message இருந்தால் preserve பண்ணும்
        if (error.response) {
            console.error(
                "Staff Dashboard Status:",
                error.response.status
            );

            console.error(
                "Staff Dashboard Response:",
                error.response.data
            );
        }

        throw error;
    }
};