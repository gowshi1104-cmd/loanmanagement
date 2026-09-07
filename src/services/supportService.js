import api from "./api";

export const createSupportTicket = (ticketData) => {
  return api.post("/support/tickets", ticketData);
};

export const getMySupportTickets = () => {
  return api.get("/support/tickets/my");
};

export const getAllSupportTickets = () => {
  return api.get("/support/tickets");
};

export const updateSupportTicket = (id, data) => {
  return api.put(`/support/tickets/${id}`, data);
};