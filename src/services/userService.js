import api from "../api/axios";

export const getUsers = () =>
  api.get("/users");

export const getUserById = (id) =>
  api.get(`/users/${id}`);

export const createUser = (user) =>
  api.post("/users", user);

export const updateUser = (id, user) =>
  api.put(`/users/${id}`, user);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`);

export const changePassword = (data) =>
  api.put("/users/change-password", data);

export const getProfile = () =>
  api.get("/users/me");

export const updateProfile = (data) =>
  api.put("/users/me", data);