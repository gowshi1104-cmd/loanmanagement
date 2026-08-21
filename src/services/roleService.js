import api from "../api/axios";

// Get All Roles
export const getRoles = () => {
  return api.get("/roles");
};

// Get Role By Id
export const getRoleById = (id) => {
  return api.get(`/roles/${id}`);
};

// Create Role
export const createRole = (role) => {
  return api.post("/roles", role);
};

// Update Role
export const updateRole = (id, role) => {
  return api.put(`/roles/${id}`, role);
};

// Delete Role
export const deleteRole = (id) => {
  return api.delete(`/roles/${id}`);
};