import { Save, AlertTriangle } from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { getPermissions } from "../../services/permissionService";

import useAuth from "../../hooks/useAuth";

const RoleForm = ({ initialData, onSubmit, buttonText, successMessage }) => {
  const navigate = useNavigate();

  const { user, hasRole } = useAuth();

  const [loading, setLoading] = useState(false);

  const [permissions, setPermissions] = useState([]);

  const [role, setRole] = useState({
    roleName: "",
    description: "",
    status: "ACTIVE",
    permissionIds: [],
  });

  const [originalRole, setOriginalRole] = useState({
    roleName: "",
    description: "",
    status: "ACTIVE",
    permissionIds: [],
  });

  const [isDirty, setIsDirty] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // =========================================================
  // CURRENT LOGGED-IN USER IS ADMIN
  // =========================================================

  const currentUserIsAdmin = hasRole("ADMIN");

  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  useEffect(() => {
    loadPermissions();
  }, []);

  // =========================================================
  // LOAD INITIAL ROLE DATA
  // =========================================================

  useEffect(() => {
    if (!initialData) {
      return;
    }

    const roleData = {
      roleName: initialData.roleName || "",

      description: initialData.description || "",

      status: initialData.status || "ACTIVE",

      permissionIds: initialData.permissions?.map((p) => p.id) || [],
    };

    setRole(roleData);

    setOriginalRole({
      ...roleData,
      permissionIds: [...roleData.permissionIds],
    });

    setIsDirty(false);
  }, [initialData]);

  // =========================================================
  // LOAD AVAILABLE PERMISSIONS
  // =========================================================

  const loadPermissions = async () => {
    try {
      const res = await getPermissions();

      console.log("AVAILABLE PERMISSIONS:", res.data);

      setPermissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);

      toast.error("Unable to load permissions");
    }
  };

  // =========================================================
  // ADMIN ROLE
  // =========================================================

  /*
   *
   * IMPORTANT:
   *
   * We check CURRENT LOGGED-IN USER,
   * NOT the role name typed in the form.
   *
   * So Manager cannot type ADMIN and get
   * frontend admin behavior.
   *
   */

  const editingAdminRole =
    initialData &&
    initialData.roleName &&
    initialData.roleName.trim().toUpperCase() === "ADMIN";

  const isAdminRole =
    currentUserIsAdmin &&
    (role.roleName.trim().toUpperCase() === "ADMIN" || editingAdminRole);

  // =========================================================
  // ADMIN GETS ALL PERMISSIONS
  // =========================================================

  useEffect(() => {
    if (isAdminRole && permissions.length > 0) {
      setRole((prev) => {
        const allPermissionIds = permissions.map((permission) => permission.id);

        const samePermissions =
          prev.permissionIds.length === allPermissionIds.length &&
          prev.permissionIds.every((id) => allPermissionIds.includes(id));

        if (samePermissions) {
          return prev;
        }

        return {
          ...prev,
          permissionIds: allPermissionIds,
        };
      });
    }
  }, [isAdminRole, permissions]);

  // =========================================================
  // DIRTY CHECK
  // =========================================================

  const checkDirty = (updatedRole) => {
    const currentPermissions = [...updatedRole.permissionIds].sort();

    const originalPermissions = [...originalRole.permissionIds].sort();

    const permissionsChanged =
      currentPermissions.length !== originalPermissions.length ||
      currentPermissions.some(
        (value, index) => value !== originalPermissions[index],
      );

    return (
      updatedRole.roleName !== originalRole.roleName ||
      updatedRole.description !== originalRole.description ||
      updatedRole.status !== originalRole.status ||
      permissionsChanged
    );
  };

  // =========================================================
  // BASIC FIELD CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // =====================================================
    // NON ADMIN CANNOT CHANGE TO ADMIN
    // =====================================================

    if (
      name === "roleName" &&
      !currentUserIsAdmin &&
      value.trim().toUpperCase() === "ADMIN"
    ) {
      toast.error("Only ADMIN can create ADMIN role");

      return;
    }

    const updatedRole = {
      ...role,
      [name]: value,
    };

    setRole(updatedRole);

    setIsDirty(checkDirty(updatedRole));
  };

  // =========================================================
  // PERMISSION CHANGE
  // =========================================================

  const handlePermissionChange = (id) => {
    // =====================================================
    // ADMIN CANNOT CHANGE PERMISSIONS
    // =====================================================

    if (isAdminRole) {
      return;
    }

    let updated = [...role.permissionIds];

    if (updated.includes(id)) {
      updated = updated.filter((x) => x !== id);
    } else {
      updated.push(id);
    }

    const updatedRole = {
      ...role,
      permissionIds: updated,
    };

    setRole(updatedRole);

    setIsDirty(checkDirty(updatedRole));
  };

  // =========================================================
  // BROWSER BACK
  // =========================================================

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isDirty) {
        setShowLeaveModal(true);

        window.history.pushState(null, "", window.location.href);
      } else {
        navigate("/settings/roles");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, navigate]);

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    if (!isDirty) {
      navigate("/settings/roles");

      return;
    }

    setShowLeaveModal(true);
  };

  // =========================================================
  // CONFIRM LEAVE
  // =========================================================

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);

    navigate("/settings/roles");
  };

  // =========================================================
  // PERMISSION GROUPS
  // =========================================================

  const permissionGroups = {
    Dashboard: ["VIEW_DASHBOARD"],

    Members: ["VIEW_MEMBERS", "ADD_MEMBER", "EDIT_MEMBER", "DELETE_MEMBER"],

    Groups: ["VIEW_GROUPS", "ADD_GROUP", "EDIT_GROUP", "DELETE_GROUP"],

    Loans: ["VIEW_LOANS", "ADD_LOAN", "EDIT_LOAN", "DELETE_LOAN"],

    Payments: [
      "VIEW_PAYMENTS",
      "ADD_PAYMENT",
      "EDIT_PAYMENT",
      "DELETE_PAYMENT",
    ],

    Reports: ["VIEW_REPORTS"],

    "Customer Portal": [
      "VIEW_CUSTOMER_DASHBOARD",
      "VIEW_MY_LOANS",
      "VIEW_EMI_SCHEDULE",
      "VIEW_MY_PAYMENT_HISTORY",
    ],

    Support: [
      "VIEW_SUPPORT_TICKETS", 
      "UPDATE_SUPPORT_TICKET"
    ],

    Settings: [
      "VIEW_SETTINGS",
      "VIEW_PROFILE",
      "EDIT_PROFILE",
      "CHANGE_PASSWORD",
      "VIEW_USERS",
      "ADD_USER",
      "EDIT_USER",
      "DELETE_USER",
      "VIEW_ROLES",
      "ADD_ROLE",
      "EDIT_ROLE",
      "DELETE_ROLE",
      "VIEW_PERMISSIONS",
      "EDIT_PERMISSIONS",
    ],
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    if (!role.roleName.trim()) {
      toast.error("Role Name is required");

      return false;
    }

    if (role.roleName.trim().toUpperCase() === "ADMIN" && !currentUserIsAdmin) {
      toast.error("Only ADMIN can create ADMIN role");

      return false;
    }

    if (!role.description.trim()) {
      toast.error("Description is required");

      return false;
    }

    if (!isAdminRole && role.permissionIds.length === 0) {
      toast.error("Select at least one permission");

      return false;
    }

    return true;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isDirty) {
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...role,
        permissionIds: isAdminRole
          ? permissions.map((permission) => permission.id)
          : role.permissionIds,
      };

      await onSubmit(submitData);

      toast.success(successMessage);

      setIsDirty(false);

      navigate("/settings/roles");
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Role Information
          </h2>

          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Enter the role details below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ROLE NAME */}
          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              Role Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="roleName"
              value={role.roleName}
              onChange={handleChange}
              placeholder="Enter role name"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>

            <select
              name="status"
              value={role.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="ACTIVE">ACTIVE</option>

              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-200">
              Description
            </label>

            <textarea
              rows={4}
              name="description"
              value={role.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* PERMISSIONS */}
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-medium text-slate-700 dark:text-slate-200">
                Permissions
              </label>

              {isAdminRole && (
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  ADMIN has full access
                </span>
              )}
            </div>

            <div className="space-y-6">
              {Object.entries(permissionGroups).map(
                ([groupName, permissionNames]) => {
                  const groupPermissions = permissions.filter((permission) =>
                    permissionNames.includes(permission.permissionName),
                  );

                  if (groupPermissions.length === 0) {
                    return null;
                  }

                  return (
                    <div key={groupName}>
                      <h3 className="mb-3 font-semibold text-slate-700 dark:text-slate-200">
                        {groupName}
                      </h3>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {groupPermissions.map((permission) => {
                          const checked = isAdminRole
                            ? true
                            : role.permissionIds.includes(permission.id);

                          return (
                            <label
                              key={permission.id}
                              className={`flex items-center gap-3 rounded-xl border p-3 ${
                                isAdminRole
                                  ? "cursor-not-allowed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                                  : "cursor-pointer border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={isAdminRole}
                                onChange={() =>
                                  handlePermissionChange(permission.id)
                                }
                              />

                              <span className="text-slate-700 dark:text-slate-300">
                                {permission.permissionName
                                  .replaceAll("_", " ")
                                  .toUpperCase()}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !isDirty}
            className={`flex items-center gap-2 rounded-xl px-8 py-3 ${
              loading || !isDirty
                ? "cursor-not-allowed bg-slate-300 text-white dark:bg-slate-700 dark:text-slate-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Save size={18} />

            {loading ? "Saving..." : buttonText}
          </button>
        </div>
      </form>

      {/* =====================================================
          LEAVE MODAL
      ===================================================== */}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-6 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                  <AlertTriangle
                    size={22}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Leave without saving?
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You have unsaved changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                If you go back now, all the changes you made will be discarded.
              </p>
            </div>

            <div className="flex justify-end gap-3 rounded-b-2xl bg-slate-50 px-6 py-4 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Stay & Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmLeave}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleForm;
