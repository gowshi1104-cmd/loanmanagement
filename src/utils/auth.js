import { jwtDecode } from "jwt-decode";

// =========================================================
// GET TOKEN
// =========================================================

export const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

// =========================================================
// GET ACTIVE STORAGE
// =========================================================

const getActiveStorage = () => {
  if (localStorage.getItem("rememberMe") === "true") {
    return localStorage;
  }

  return sessionStorage;
};

// =========================================================
// GET USER FROM JWT
// =========================================================

export const getUser = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

// =========================================================
// GET USER PERMISSIONS
// =========================================================

export const getUserPermissions = () => {
  try {
    const storage = getActiveStorage();

    return JSON.parse(
      storage.getItem("permissions") || "[]"
    );
  } catch (e) {
    console.error(
      "Invalid permissions in storage",
      e
    );

    return [];
  }
};

// =========================================================
// HAS PERMISSION
// =========================================================

export const hasPermission = (permission) => {
  if (!permission) {
    return true;
  }

  const user = getUser();

  console.log(
    "========== PERMISSION CHECK =========="
  );

  console.log(
    "Required Permission:",
    permission
  );

  console.log(
    "Decoded User:",
    user
  );

  if (!user) {
    console.log("❌ No user");
    return false;
  }

  // =======================================================
  // ADMIN FULL ACCESS
  // =======================================================

  const normalizedRole = String(
    user.role || ""
  )
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  if (normalizedRole === "ADMIN") {
    console.log(
      "✅ ADMIN - FULL ACCESS"
    );

    return true;
  }

  // =======================================================
  // OTHER ROLE PERMISSIONS
  // =======================================================

  const permissions =
    getUserPermissions();

  console.log(
    "User Permissions:",
    permissions
  );

  const hasAccess =
    permissions.includes(permission);

  console.log(
    hasAccess
      ? "✅ Permission Granted"
      : "❌ Permission Denied"
  );

  return hasAccess;
};

// =========================================================
// HAS ROLE
// =========================================================

export const hasRole = (role) => {
  const user = getUser();

  if (!user) {
    return false;
  }

  const userRole = String(
    user.role || ""
  )
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  const requiredRole = String(
    role || ""
  )
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  return userRole === requiredRole;
};