import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  const hasPermission = (permission) => {
    // No permission restriction
    if (!permission) {
      return true;
    }

    const user = context.user;

    if (!user) {
      return false;
    }

    // ADMIN has full access
    if (
      user.role === "ADMIN" ||
      user.role === "ROLE_ADMIN"
    ) {
      return true;
    }

    // Other roles use assigned permissions
    const permissions = user.permissions || [];

    return (
      Array.isArray(permissions) &&
      permissions.includes(permission)
    );
  };

  const hasRole = (role) => {
    const user = context.user;

    if (!user) {
      return false;
    }

    return (
      user.role === role ||
      user.role === `ROLE_${role}`
    );
  };

  return {
    ...context,
    hasPermission,
    hasRole,
  };
};

export default useAuth;