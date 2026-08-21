import api from "../api/axios";

// =========================================================
// GET ALL PERMISSIONS
// =========================================================
// Used by Admin / Permission Management if required.

export const getPermissions = () => {
  return api.get("/permissions");
};

// =========================================================
// GET AVAILABLE ROLE PERMISSIONS
// =========================================================
// ADMIN    -> ALL permissions
// MANAGER  -> Manager's own permissions
// STAFF    -> Staff's own permissions
//
// This API should be used by RoleForm.

export const getAvailableRolePermissions = () => {
  return api.get("/roles/available-permissions");
};