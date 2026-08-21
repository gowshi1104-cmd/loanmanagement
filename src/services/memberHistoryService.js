import api from "./api";

export const getMemberHistory = async (customerId) => {
    const response = await api.get(
        `/member-history/${customerId}`
    );

    return response.data;
};