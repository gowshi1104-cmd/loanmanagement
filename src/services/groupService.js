import api from "../api/axios";

/* ============================================================
   GROUPS
============================================================ */

export const getGroups = () =>
  api.get("/groups");

export const getGroupById = (id) =>
  api.get(`/groups/${id}`);

export const createGroup = (group) =>
  api.post("/groups", group);

export const updateGroup = (id, group) =>
  api.put(`/groups/${id}`, group);

export const deleteGroup = (id) =>
  api.delete(`/groups/${id}`);

/* ============================================================
   GROUP MEMBERS
============================================================ */

export const getGroupMembers = (groupId) =>
  api.get(`/groups/${groupId}/members`);

/* ============================================================
   MANAGERS
============================================================ */

export const getManagers = () =>
  api.get("/users/managers");