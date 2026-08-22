import { useEffect, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Eye,
  ArrowLeft,
  Power,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getUsers,
  updateUser,
  deleteUser,
} from "../../services/userService";

import DeleteModal from "../../components/common/DeleteModal";

const Users = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const selectedUserFromUrl =
    searchParams.get("userId");

  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState(null);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {

    try {

      setLoading(true);

      const res = await getUsers();

      const data =
        Array.isArray(res.data)
          ? res.data
          : [];

      setUsers(data);

      setFilteredUsers(data);

    } catch (err) {

      console.error(
        "Load Users Error:",
        err
      );

      if (err.response?.status === 403) {

        toast.error(
          "You don't have permission to view these users. Please contact your reporting manager."
        );

      } else {

        toast.error(
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to load users"
        );
      }

      setUsers([]);

      setFilteredUsers([]);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    loadUsers();

  }, []);

  // =========================================================
  // SEARCH + URL USER FILTER
  // =========================================================

  useEffect(() => {

    const value =
      search
        .toLowerCase()
        .trim();

    let result = users;

    // -------------------------------------------------------
    // Dashboard selected specific staff
    // -------------------------------------------------------

    if (selectedUserFromUrl) {

      result =
        result.filter((u) => {

          return (
            String(u.id) ===
              String(selectedUserFromUrl) ||

            String(u.userId) ===
              String(selectedUserFromUrl) ||

            String(u.staffId) ===
              String(selectedUserFromUrl)
          );
        });
    }

    // -------------------------------------------------------
    // Search
    // -------------------------------------------------------

    if (value) {

      result =
        result.filter((u) => {

          const fullName =
            u.fullName?.toLowerCase() || "";

          const username =
            u.username?.toLowerCase() || "";

          const email =
            u.email?.toLowerCase() || "";

          const role =
            u.role?.roleName?.toLowerCase() || "";

          const managerName =
            u.reportingManager?.fullName?.toLowerCase() ||
            "";

          const managerUsername =
            u.reportingManager?.username?.toLowerCase() ||
            "";

          return (
            fullName.includes(value) ||
            username.includes(value) ||
            email.includes(value) ||
            role.includes(value) ||
            managerName.includes(value) ||
            managerUsername.includes(value)
          );
        });
    }

    setFilteredUsers(result);

  }, [
    search,
    users,
    selectedUserFromUrl,
  ]);

  // =========================================================
  // ACTIVE / INACTIVE
  //
  // IMPORTANT:
  // This now updates BACKEND also.
  // =========================================================

  const handleToggleStatus = async (user) => {

    const newStatus = !Boolean(user.enabled);

    try {

      setStatusUpdatingId(user.id);

      /*
       * PUT /users/{id}
       *
       * We send all required existing user details
       * because updateUser() expects UserRequest.
       */

      await updateUser(user.id, {

        fullName:
          user.fullName || "",

        email:
          user.email || "",

        roleId:
          user.role?.id
            ? Number(user.role.id)
            : null,

        reportingManagerId:
          user.reportingManager?.id
            ? Number(user.reportingManager.id)
            : null,

        /*
         * Password is intentionally not sent.
         * Backend will keep existing password.
         */

        password: "",

        /*
         * THIS IS THE IMPORTANT VALUE
         */

        enabled: newStatus,
      });

      // -------------------------------------------------------
      // Update local state only after backend success
      // -------------------------------------------------------

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                enabled: newStatus,
              }
            : u
        )
      );

      toast.success(
        newStatus
          ? `${user.fullName} activated`
          : `${user.fullName} deactivated`
      );

    } catch (err) {

      console.error(
        "Update User Status Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to update user status"
      );

    } finally {

      setStatusUpdatingId(null);
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDelete = async () => {

    try {

      await deleteUser(selectedUserId);

      setUsers((prev) =>
        prev.filter(
          (u) => u.id !== selectedUserId
        )
      );

      setFilteredUsers((prev) =>
        prev.filter(
          (u) => u.id !== selectedUserId
        )
      );

      toast.success(
        "User deleted successfully"
      );

      setIsDeleteOpen(false);

      setSelectedUserId(null);

    } catch (err) {

      console.error(
        "Delete User Error:",
        err
      );

      let message =
        "Delete failed";

      if (
        err.response?.status === 401
      ) {

        message =
          "Unauthorized";

      } else if (
        err.response?.status === 403
      ) {

        message =
          "You don't have permission to delete this user.";

      } else if (
        err.response?.status === 404
      ) {

        message =
          "User Not Found";

      } else if (
        err.response?.data?.message
      ) {

        message =
          err.response.data.message;

      } else if (
        typeof err.response?.data === "string"
      ) {

        message =
          err.response.data;
      }

      toast.error(message);

      setIsDeleteOpen(false);

      setSelectedUserId(null);
    }
  };

  // =========================================================
  // CLEAR STAFF FILTER
  // =========================================================

  const clearStaffFilter = () => {

    navigate("/settings/users");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex items-center justify-center py-20">

        <p className="text-slate-500">
          Loading users...
        </p>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (

    <div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">

          {selectedUserFromUrl && (

            <button
              type="button"
              onClick={clearStaffFilter}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              title="Back to all users"
            >

              <ArrowLeft size={18} />

            </button>
          )}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name, username, email, role or manager..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-96 rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        <button
          onClick={() =>
            navigate("/settings/users/add")
          }
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >

          <Plus size={18} />

          Add User

        </button>

      </div>

      {/* =====================================================
          FILTER INDICATOR
      ====================================================== */}

      {selectedUserFromUrl && (

        <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">

          <div>

            <p className="text-sm font-semibold text-indigo-800">
              Staff Details
            </p>

            <p className="text-xs text-indigo-600">
              Showing only the selected staff member.
            </p>

          </div>

          <button
            type="button"
            onClick={clearStaffFilter}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Clear filter
          </button>

        </div>
      )}

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  S.No
                </th>

                <th className="p-4 text-left">
                  Full Name
                </th>

                <th className="p-4 text-left">
                  Username
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Role
                </th>

                <th className="p-4 text-left">
                  Reporting Manager
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="py-8 text-center text-gray-500"
                  >

                    {selectedUserFromUrl
                      ? "Selected staff member not found."
                      : "No users found."}

                  </td>

                </tr>

              ) : (

                filteredUsers.map(
                  (user, index) => {

                    const manager =
                      user.reportingManager;

                    const isUpdating =
                      statusUpdatingId === user.id;

                    return (

                      <tr
                        key={user.id}
                        className="border-t hover:bg-slate-50"
                      >

                        {/* S.NO */}

                        <td className="p-4 font-semibold text-gray-700">
                          {index + 1}
                        </td>

                        {/* FULL NAME */}

                        <td className="p-4 font-medium">
                          {user.fullName}
                        </td>

                        {/* USERNAME */}

                        <td className="p-4">
                          {user.username}
                        </td>

                        {/* EMAIL */}

                        <td className="p-4">
                          {user.email}
                        </td>

                        {/* ROLE */}

                        <td className="p-4">
                          {user.role?.roleName}
                        </td>

                        {/* REPORTING MANAGER */}

                        <td className="p-4">

                          {manager ? (

                            <div>

                              <p className="font-medium text-slate-700">
                                {manager.fullName}
                              </p>

                              <p className="text-xs text-slate-500">
                                {manager.username ||
                                  manager.userId ||
                                  manager.id}
                              </p>

                            </div>

                          ) : (

                            <span className="text-slate-400">
                              -
                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-4 text-center">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.enabled
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >

                            {user.enabled
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="p-4">

                          <div className="flex justify-center gap-4">

                            {/* VIEW */}

                            <button
                              onClick={() =>
                                navigate(
                                  `/settings/users/${user.id}`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                              title="View User"
                            >

                              <Eye size={18} />

                            </button>

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                navigate(
                                  `/settings/users/${user.id}/edit`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit User"
                            >

                              <Pencil size={18} />

                            </button>

                            {/* ACTIVE / INACTIVE */}

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleToggleStatus(user)
                              }
                              className={`${
                                user.enabled
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              } ${
                                isUpdating
                                  ? "cursor-not-allowed opacity-40"
                                  : ""
                              }`}
                              title={
                                user.enabled
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >

                              <Power size={18} />

                            </button>

                            {/* DELETE */}

                            <button
                              onClick={() => {

                                setSelectedUserId(
                                  user.id
                                );

                                setIsDeleteOpen(true);

                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Delete User"
                            >

                              <Trash2 size={18} />

                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onClose={() => {

          setIsDeleteOpen(false);

          setSelectedUserId(null);

        }}
        onConfirm={handleDelete}
      />

    </div>
  );
};

export default Users;