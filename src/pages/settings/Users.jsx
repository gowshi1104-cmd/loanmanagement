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
  ChevronLeft,
  ChevronRight,
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

  // =========================================================
  // STATE
  // =========================================================

  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState("ADMIN");

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [selectedUserId, setSelectedUserId] =
    useState(null);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  // =========================================================
  // PAGINATION STATE
  // =========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage] = useState(10);

  // =========================================================
  // ROLE TABS
  // =========================================================

  const roleTabs = [
    {
      key: "ADMIN",
      label: "Admin",
    },
    {
      key: "MANAGER",
      label: "Manager",
    },
    {
      key: "STAFF",
      label: "Staff",
    },
    {
      key: "CUSTOMER",
      label: "Customer",
    },
  ];

  // =========================================================
  // GET NORMALIZED ROLE
  // =========================================================

  const getUserRole = (user) => {

    const role =
      user?.role?.roleName ||
      user?.roleName ||
      "";

    return role
      .toString()
      .trim()
      .toUpperCase()
      .replace(/^ROLE_/, "");
  };

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
  // AUTO SELECT STAFF TAB
  // =========================================================

  useEffect(() => {

    if (selectedUserFromUrl) {

      setActiveTab("STAFF");

      setCurrentPage(1);

    }

  }, [selectedUserFromUrl]);

  // =========================================================
  // SEARCH + ROLE FILTER + URL USER FILTER
  // =========================================================

  useEffect(() => {

    const value =
      search
        .toLowerCase()
        .trim();

    let result = [...users];

    // -------------------------------------------------------
    // ROLE FILTER
    // -------------------------------------------------------

    result = result.filter(
      (user) =>
        getUserRole(user) === activeTab
    );

    // -------------------------------------------------------
    // DASHBOARD SELECTED SPECIFIC USER
    // -------------------------------------------------------

    if (selectedUserFromUrl) {

      result = result.filter((u) => {

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
    // SEARCH
    // -------------------------------------------------------

    if (value) {

      result = result.filter((u) => {

        const fullName =
          u.fullName?.toLowerCase() ||
          "";

        const username =
          u.username?.toLowerCase() ||
          "";

        const email =
          u.email?.toLowerCase() ||
          "";

        const role =
          getUserRole(u).toLowerCase();

        const managerName =
          u.reportingManager?.fullName?.toLowerCase() ||
          "";

        const managerUsername =
          u.reportingManager?.username?.toLowerCase() ||
          "";

        const managerId =
          String(
            u.reportingManager?.id ||
              u.reportingManager?.userId ||
              ""
          ).toLowerCase();

        return (

          fullName.includes(value) ||

          username.includes(value) ||

          email.includes(value) ||

          role.includes(value) ||

          managerName.includes(value) ||

          managerUsername.includes(value) ||

          managerId.includes(value)

        );

      });

    }

    setFilteredUsers(result);

    // -------------------------------------------------------
    // RESET TO PAGE 1 WHEN FILTER CHANGES
    // -------------------------------------------------------

    setCurrentPage(1);

  }, [
    search,
    users,
    activeTab,
    selectedUserFromUrl,
  ]);

  // =========================================================
  // TAB CHANGE
  // =========================================================

  const handleTabChange = (tab) => {

    setActiveTab(tab);

    // Clear search when changing role
    setSearch("");

    // Reset pagination
    setCurrentPage(1);

  };

  // =========================================================
  // PAGINATION CALCULATIONS
  // =========================================================

  const totalUsers =
    filteredUsers.length;

  const totalPages =
    Math.ceil(
      totalUsers / itemsPerPage
    );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedUsers =
    filteredUsers.slice(
      startIndex,
      endIndex
    );

  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const handlePageChange = (page) => {

    if (
      page < 1 ||
      page > totalPages
    ) {

      return;

    }

    setCurrentPage(page);

  };

  // =========================================================
  // ACTIVE / INACTIVE
  // =========================================================

  const handleToggleStatus = async (user) => {

    const newStatus =
      !Boolean(user.enabled);

    try {

      setStatusUpdatingId(user.id);

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
            ? Number(
                user.reportingManager.id
              )
            : null,

        // Password intentionally not sent.
        password: "",

        enabled: newStatus,

      });

      // -----------------------------------------------------
      // UPDATE LOCAL STATE
      // -----------------------------------------------------

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

      await deleteUser(
        selectedUserId
      );

      const updatedUsers =
        users.filter(
          (u) =>
            u.id !== selectedUserId
        );

      setUsers(updatedUsers);

      setFilteredUsers((prev) =>
        prev.filter(
          (u) =>
            u.id !== selectedUserId
        )
      );

      toast.success(
        "User deleted successfully"
      );

      setIsDeleteOpen(false);

      setSelectedUserId(null);

      // -----------------------------------------------------
      // KEEP CURRENT PAGE VALID AFTER DELETE
      // -----------------------------------------------------

      const newTotalPages =
        Math.ceil(
          (filteredUsers.length - 1) /
            itemsPerPage
        );

      if (
        currentPage > newTotalPages &&
        newTotalPages > 0
      ) {

        setCurrentPage(
          newTotalPages
        );

      }

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
        typeof err.response?.data ===
        "string"
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

    setCurrentPage(1);

  };

  // =========================================================
  // GET TAB COUNT
  // =========================================================

  const getTabCount = (role) => {

    return users.filter(
      (user) =>
        getUserRole(user) === role
    ).length;

  };

  // =========================================================
  // PAGINATION PAGE NUMBERS
  // =========================================================

  const getPageNumbers = () => {

    if (totalPages <= 5) {

      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );

    }

    if (currentPage <= 3) {

      return [1, 2, 3, 4, 5];

    }

    if (
      currentPage >=
      totalPages - 2
    ) {

      return [

        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,

      ];

    }

    return [

      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,

    ];

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex items-center justify-center py-20">

        <p className="text-slate-500 dark:text-slate-400">

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
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Back to all users"
            >

              <ArrowLeft size={18} />

            </button>

          )}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400 dark:text-slate-500"
            />

            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} users...`}
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-96 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
            />

          </div>

        </div>

        <button
          onClick={() =>
            navigate(
              "/settings/users/add"
            )
          }
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >

          <Plus size={18} />

          Add User

        </button>

      </div>

      {/* =====================================================
          ROLE TABS
      ====================================================== */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="flex flex-wrap gap-2">

          {roleTabs.map((tab) => {

            const isActive =
              activeTab === tab.key;

            const count =
              getTabCount(tab.key);

            return (

              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  handleTabChange(
                    tab.key
                  )
                }
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >

                <span>
                  {tab.label}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >

                  {count}

                </span>

              </button>

            );

          })}

        </div>

      </div>

      {/* =====================================================
          FILTER INDICATOR
      ====================================================== */}

      {selectedUserFromUrl && (

        <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950/40">

          <div>

            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">

              Staff Details

            </p>

            <p className="text-xs text-indigo-600 dark:text-indigo-400">

              Showing only the selected staff member.

            </p>

          </div>

          <button
            type="button"
            onClick={clearStaffFilter}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >

            Clear filter

          </button>

        </div>

      )}

      {/* =====================================================
          CURRENT SECTION TITLE
      ====================================================== */}

      <div className="mt-6 flex items-center justify-between">

        <div>

          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">

            {activeTab === "ADMIN" &&
              "Admin Users"}

            {activeTab === "MANAGER" &&
              "Manager Users"}

            {activeTab === "STAFF" &&
              "Staff Users"}

            {activeTab === "CUSTOMER" &&
              "Customer Users"}

          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">

            {filteredUsers.length}{" "}

            {activeTab.toLowerCase()} user

            {filteredUsers.length !== 1
              ? "s"
              : ""}{" "}

            found

          </p>

        </div>

      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow dark:bg-slate-900">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100 dark:bg-slate-800">

              <tr>

                <th className="p-4 text-left dark:text-slate-200">

                  S.No

                </th>

                <th className="p-4 text-left dark:text-slate-200">

                  Full Name

                </th>

                <th className="p-4 text-left dark:text-slate-200">

                  Username

                </th>

                <th className="p-4 text-left dark:text-slate-200">

                  Email

                </th>

                <th className="p-4 text-left dark:text-slate-200">

                  Role

                </th>

                <th className="p-4 text-left dark:text-slate-200">

                  Reporting Manager

                </th>

                <th className="p-4 text-center dark:text-slate-200">

                  Status

                </th>

                <th className="p-4 text-center dark:text-slate-200">

                  Actions

                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedUsers.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="py-10 text-center text-gray-500 dark:text-slate-400"
                  >

                    {selectedUserFromUrl
                      ? "Selected staff member not found."
                      : `No ${activeTab.toLowerCase()} users found.`}

                  </td>

                </tr>

              ) : (

                paginatedUsers.map(
                  (user, index) => {

                    const manager =
                      user.reportingManager;

                    const isUpdating =
                      statusUpdatingId ===
                      user.id;

                    const role =
                      getUserRole(user);

                    // Global S.No
                    const serialNumber =
                      startIndex +
                      index +
                      1;

                    return (

                      <tr
                        key={user.id}
                        className="border-t border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                      >

                        {/* S.NO */}

                        <td className="p-4 font-semibold text-gray-700 dark:text-slate-300">

                          {serialNumber}

                        </td>

                        {/* FULL NAME */}

                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">

                          {user.fullName ||
                            "-"}

                        </td>

                        {/* USERNAME */}

                        <td className="p-4 text-slate-700 dark:text-slate-300">

                          {user.username ||
                            "-"}

                        </td>

                        {/* EMAIL */}

                        <td className="p-4 text-slate-700 dark:text-slate-300">

                          {user.email ||
                            "-"}

                        </td>

                        {/* ROLE */}

                        <td className="p-4">

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">

                            {role}

                          </span>

                        </td>

                        {/* REPORTING MANAGER */}

                        <td className="p-4">

                          {role === "STAFF" &&
                          manager ? (

                            <div>

                              <p className="font-medium text-slate-700 dark:text-slate-200">

                                {manager.fullName ||
                                  "-"}

                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">

                                {manager.username ||
                                  manager.userId ||
                                  manager.id ||
                                  "-"}

                              </p>

                            </div>

                          ) : (

                            <span className="text-slate-400 dark:text-slate-500">

                              -

                            </span>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="p-4 text-center">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              user.enabled
                                ? "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
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
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View User"
                            >

                              <Eye
                                size={18}
                              />

                            </button>

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                navigate(
                                  `/settings/users/${user.id}/edit`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit User"
                            >

                              <Pencil
                                size={18}
                              />

                            </button>

                            {/* ACTIVE / INACTIVE */}

                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  user
                                )
                              }
                              className={`${
                                user.enabled
                                  ? "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  : "text-green-600 hover:text-green-800 dark:text-emerald-400 dark:hover:text-emerald-300"
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

                              <Power
                                size={18}
                              />

                            </button>

                            {/* DELETE */}

                            <button
                              onClick={() => {

                                setSelectedUserId(
                                  user.id
                                );

                                setIsDeleteOpen(
                                  true
                                );

                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete User"
                            >

                              <Trash2
                                size={18}
                              />

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

        {/* ===================================================
            PAGINATION
        ==================================================== */}

        {totalPages > 0 && (

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">

            {/* RESULT INFO */}

            <div className="text-sm text-slate-500 dark:text-slate-400">

              Showing{" "}

              <span className="font-semibold text-slate-700 dark:text-slate-200">

                {startIndex + 1}

              </span>

              {" "}to{" "}

              <span className="font-semibold text-slate-700 dark:text-slate-200">

                {Math.min(
                  endIndex,
                  totalUsers
                )}

              </span>

              {" "}of{" "}

              <span className="font-semibold text-slate-700 dark:text-slate-200">

                {totalUsers}

              </span>

              {" "}

              {activeTab.toLowerCase()} users

            </div>

            {/* PAGINATION CONTROLS */}

            <div className="flex items-center gap-1">

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  handlePageChange(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 1
                }
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  currentPage === 1
                    ? "cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                title="Previous page"
              >

                <ChevronLeft
                  size={18}
                />

              </button>

              {/* PAGE NUMBERS */}

              {getPageNumbers().map(
                (page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        page
                      )
                    }
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >

                    {page}

                  </button>

                )

              )}

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  handlePageChange(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                  currentPage ===
                  totalPages
                    ? "cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                title="Next page"
              >

                <ChevronRight
                  size={18}
                />

              </button>

            </div>

          </div>

        )}

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