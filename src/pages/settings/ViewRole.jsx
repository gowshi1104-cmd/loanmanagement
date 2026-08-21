import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { getRoleById } from "../../services/roleService";

const ViewRole = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRole();
  }, [id]);

  const loadRole = async () => {
    try {
      const response = await getRoleById(id);

      setRole(response.data);
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to load role details";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Permission groups
   *
   * Same permission structure used in RoleForm.
   */
  const permissionGroups = {
    Dashboard: [
      "VIEW_DASHBOARD",
    ],

    Members: [
      "VIEW_MEMBERS",
      "ADD_MEMBER",
      "EDIT_MEMBER",
      "DELETE_MEMBER",
    ],

    Groups: [
      "VIEW_GROUPS",
      "ADD_GROUP",
      "EDIT_GROUP",
      "DELETE_GROUP",
    ],

    Loans: [
      "VIEW_LOANS",
      "ADD_LOAN",
      "EDIT_LOAN",
      "DELETE_LOAN",
    ],

    Payments: [
      "VIEW_PAYMENTS",
      "ADD_PAYMENT",
      "EDIT_PAYMENT",
      "DELETE_PAYMENT",
    ],

    Reports: [
      "VIEW_REPORTS",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading role details...
        </p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">

          <p className="text-slate-600 mb-5">
            Role not found.
          </p>

          <button
            onClick={() =>
              navigate("/settings/roles")
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
          >
            <ArrowLeft size={18} />
            Back to Roles
          </button>

        </div>
      </div>
    );
  }

  /*
   * Get permissions assigned to this role.
   *
   * Expected backend response:
   *
   * {
   *   id: 1,
   *   roleName: "ADMIN",
   *   description: "...",
   *   status: "ACTIVE",
   *   permissions: [
   *     {
   *       id: 1,
   *       permissionName: "VIEW_DASHBOARD"
   *     }
   *   ]
   * }
   */
  const rolePermissions = role.permissions || [];

  /*
   * Group only the permissions actually assigned
   * to this role.
   */
  const groupedPermissions = Object.entries(
    permissionGroups
  )
    .map(([groupName, permissionNames]) => {
      const groupPermissions =
        rolePermissions.filter((permission) =>
          permissionNames.includes(
            permission.permissionName
          )
        );

      return {
        groupName,
        permissions: groupPermissions,
      };
    })
    .filter(
      (group) => group.permissions.length > 0
    );

  return (
    <div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">

        <ShieldCheck
          className="text-blue-600"
          size={30}
        />

        <div>

          <h1 className="text-3xl font-bold">
            Role Details
          </h1>

          <p className="text-slate-500">
            View complete role information.
          </p>

        </div>

      </div>

      {/* Role Details Card */}
      <div className="max-w-5xl bg-white rounded-2xl shadow border p-8">

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Role ID */}
          <div>

            <p className="text-sm text-slate-500">
              Role ID
            </p>

            <p className="font-semibold">
              {role.id}
            </p>

          </div>

          {/* Role Name */}
          <div>

            <p className="text-sm text-slate-500">
              Role Name
            </p>

            <p className="font-semibold">
              {role.roleName}
            </p>

          </div>

          {/* Description */}
          <div className="md:col-span-2">

            <p className="text-sm text-slate-500">
              Description
            </p>

            <p className="font-semibold">
              {role.description || "-"}
            </p>

          </div>

          {/* Status */}
          <div>

            <p className="text-sm text-slate-500">
              Status
            </p>

            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                role.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {role.status}
            </span>

          </div>

        </div>

        {/* Permissions */}
        <div className="mt-10 border-t pt-8">

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Permissions
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Permissions assigned to this role.
              </p>

            </div>

            <span className="text-sm font-medium text-slate-500">
              {rolePermissions.length} permission
              {rolePermissions.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {groupedPermissions.length === 0 ? (

            <div className="border border-slate-200 rounded-xl p-6 text-center">

              <p className="text-slate-500">
                No permissions assigned to this role.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {groupedPermissions.map(
                ({
                  groupName,
                  permissions,
                }) => (

                  <div key={groupName}>

                    {/* Group Name */}
                    <h3 className="font-semibold text-slate-700 mb-3">
                      {groupName}
                    </h3>

                    {/* Permission List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                      {permissions.map(
                        (permission) => (

                          <div
                            key={permission.id}
                            className="border border-slate-200 rounded-xl p-3 bg-slate-50"
                          >

                            <div className="flex items-center gap-3">

                              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />

                              <span className="text-sm font-medium text-slate-700">
                                {permission.permissionName
                                  .replaceAll(
                                    "_",
                                    " "
                                  )
                                  .toUpperCase()}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* Back Button */}
        <div className="mt-8 border-t pt-6 flex justify-end">

          <button
            onClick={() =>
              navigate("/settings/roles")
            }
            className="flex items-center gap-2 border border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-100 transition"
          >
            <ArrowLeft size={18} />
            Back
          </button>

        </div>

      </div>

    </div>
  );
};

export default ViewRole;