export const getUserPermissions = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.permissions) {
    return [];
  }

  return user.permissions;
};

export const hasPermission = (permission) => {
  return getUserPermissions().includes(permission);
};