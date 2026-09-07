import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import { Eye, Pencil, Trash2 } from "lucide-react";

import DeleteModal from "../common/DeleteModal";

import { getRoles, deleteRole } from "../../services/roleService";

import { hasPermission } from "../../utils/auth";

const RolesTable = () => {
  const [roles, setRoles] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  const canView = hasPermission("VIEW_ROLE");

  const canEdit = hasPermission("EDIT_ROLE");

  const canDelete = hasPermission("DELETE_ROLE");

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await getRoles();

      setRoles(response.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load roles");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole(selectedRoleId);

      toast.success("Role Deleted Successfully");

      setIsDeleteOpen(false);

      setSelectedRoleId(null);

      loadRoles();
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Delete Failed";

      toast.error(message);

      setIsDeleteOpen(false);

      setSelectedRoleId(null);
    }
  };

  const filteredRoles = roles.filter((role) => {
    const value = searchTerm.toLowerCase();

    return (
      role.id?.toString().includes(value) ||
      role.roleName?.toLowerCase().includes(value) ||
      role.description?.toLowerCase().includes(value) ||
      role.status?.toLowerCase().includes(value)
    );
  });

  const lastIndex = currentPage * recordsPerPage;

  const firstIndex = lastIndex - recordsPerPage;

  const currentRoles = filteredRoles.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(
    filteredRoles.length / recordsPerPage
  );

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search role..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-72 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr className="text-left">
              <th className="px-2 py-3 text-left text-slate-700 dark:text-slate-200">
                S.No
              </th>

              <th className="px-2 py-3 text-slate-700 dark:text-slate-200">
                Role Name
              </th>

              <th className="px-2 py-3 text-slate-700 dark:text-slate-200">
                Description
              </th>

              <th className="px-2 py-3 text-slate-700 dark:text-slate-200">
                Status
              </th>

              <th className="px-2 py-3 text-slate-700 dark:text-slate-200">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRoles.map((role, index) => (
              <tr
                key={role.id}
                className="border-b border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {/* Serial Number */}
                <td className="px-2 py-4 text-left">
                  {(firstIndex + index + 1).toLocaleString("en-IN")}
                </td>

                {/* Role Name */}
                <td className="px-2 font-medium text-slate-800 dark:text-slate-100">
                  {role.roleName}
                </td>

                {/* Description */}
                <td className="px-2 text-slate-600 dark:text-slate-400">
                  {role.description}
                </td>

                {/* Status */}
                <td className="px-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      role.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    }`}
                  >
                    {role.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-2">
                  <div className="flex items-center gap-3">
                    {canView && (
                      <Link
                        to={`/settings/roles/${role.id}`}
                        className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                    )}

                    {canEdit && (
                      <Link
                        to={`/settings/roles/${role.id}/edit`}
                        className="text-yellow-600 transition-colors hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => {
                          setSelectedRoleId(role.id);
                          setIsDeleteOpen(true);
                        }}
                        className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRoles.length === 0 && (
          <p className="py-6 text-center text-slate-500 dark:text-slate-400">
            No roles found
          </p>
        )}
      </div>

      {/* Pagination */}
      {filteredRoles.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Showing {firstIndex + 1} -{" "}
            {Math.min(lastIndex, filteredRoles.length)} of{" "}
            {filteredRoles.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-10 w-10 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Role"
        message="Are you sure you want to delete this role?"
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedRoleId(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default RolesTable;