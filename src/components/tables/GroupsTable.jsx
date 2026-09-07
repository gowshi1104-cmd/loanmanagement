import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import DeleteModal from "../common/DeleteModal";

import {
  getGroups,
  deleteGroup,
} from "../../services/groupService";

import toast from "react-hot-toast";

import { hasPermission } from "../../utils/auth";

export default function GroupsTable() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  const canView = hasPermission("VIEW_GROUPS");
  const canEdit = hasPermission("EDIT_GROUP");
  const canDelete = hasPermission("DELETE_GROUP");

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      const response = await getGroups();

      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.content || [];

      setGroups(data);
    } catch (error) {
      console.error("Failed to load groups:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load groups"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGroupId) {
      return;
    }

    try {
      await deleteGroup(selectedGroupId);

      toast.success("Group deleted successfully");

      setIsDeleteOpen(false);
      setSelectedGroupId(null);

      await loadGroups();
    } catch (error) {
      console.error("Delete group error:", error);

      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  const getManagerDisplay = (group) => {
    const managerId =
      group.managerUserId ??
      group.managerId ??
      group.leaderUserId;

    const managerName =
      group.managerName ??
      group.leaderName;

    if (managerId && managerName) {
      return `${managerId} - ${managerName}`;
    }

    return managerName || managerId || "-";
  };

  const filteredGroups = groups.filter((group) => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return true;
    }

    const managerDisplay =
      getManagerDisplay(group).toLowerCase();

    return (
      group.id?.toString().includes(value) ||
      group.groupName
        ?.toLowerCase()
        .includes(value) ||
      managerDisplay.includes(value) ||
      group.totalMembers
        ?.toString()
        .includes(value) ||
      group.status
        ?.toLowerCase()
        .includes(value)
    );
  });

  const totalPages = Math.ceil(
    filteredGroups.length / recordsPerPage
  );

  const firstIndex =
    (currentPage - 1) * recordsPerPage;

  const lastIndex =
    firstIndex + recordsPerPage;

  const currentGroups = filteredGroups.slice(
    firstIndex,
    lastIndex
  );

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="w-full min-w-0 rounded-2xl bg-white p-4 shadow dark:bg-slate-900 sm:p-6">
        <div className="py-10 text-center text-slate-500 dark:text-slate-400">
          Loading Groups...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 rounded-2xl bg-white p-4 shadow dark:bg-slate-900 sm:p-6">

      {/* SEARCH */}
      <div className="mb-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400 dark:text-slate-500"
          />

          <input
            type="text"
            placeholder="Search group..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="
              w-full
              rounded-lg
              border
              border-slate-300
              bg-white
              py-2
              pl-10
              pr-4
              outline-none
              text-slate-800
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-100
              dark:placeholder:text-slate-500
              sm:w-80
            "
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <tr className="text-left text-slate-700 dark:text-slate-200">
              <th className="whitespace-nowrap px-2 py-3">
                S.no
              </th>

              <th className="whitespace-nowrap px-2">
                Group Name
              </th>

              <th className="whitespace-nowrap px-2">
                Manager
              </th>

              <th className="whitespace-nowrap px-2">
                Members
              </th>

              <th className="whitespace-nowrap px-2">
                Status
              </th>

              <th className="whitespace-nowrap px-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentGroups.map((group, index) => (
              <tr
                key={group.id}
                className="
                  border-b
                  border-slate-200
                  text-slate-700
                  hover:bg-slate-50
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <td className="whitespace-nowrap px-2 py-4">
                  {firstIndex + index + 1}
                </td>

                <td className="whitespace-nowrap px-2 font-medium text-slate-800 dark:text-slate-100">
                  {group.groupName || "-"}
                </td>

                <td className="whitespace-nowrap px-2">
                  {getManagerDisplay(group)}
                </td>

                <td className="whitespace-nowrap px-2">
                  <Link
                    to={`/groups/${group.id}/members`}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      font-semibold
                      text-blue-600
                      hover:text-blue-800
                      dark:text-blue-400
                      dark:hover:text-blue-300
                    "
                    title="View Group Members"
                  >
                    <Users size={16} />
                    {group.totalMembers ?? 0}
                  </Link>
                </td>

                <td className="whitespace-nowrap px-2">
                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-medium
                      ${
                        group.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }
                    `}
                  >
                    {group.status || "-"}
                  </span>
                </td>

                <td className="whitespace-nowrap px-2">
                  <div className="flex items-center gap-3">
                    {canView && (
                      <Link
                        to={`/groups/${group.id}`}
                        className="
                          text-blue-600
                          hover:text-blue-800
                          dark:text-blue-400
                          dark:hover:text-blue-300
                        "
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                    )}

                    {canEdit && (
                      <Link
                        to={`/groups/${group.id}/edit`}
                        className="
                          text-yellow-600
                          hover:text-yellow-700
                          dark:text-yellow-400
                          dark:hover:text-yellow-300
                        "
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGroupId(group.id);
                          setIsDeleteOpen(true);
                        }}
                        className="
                          text-red-600
                          hover:text-red-700
                          dark:text-red-400
                          dark:hover:text-red-300
                        "
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

        {filteredGroups.length === 0 && (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">
            No groups found
          </p>
        )}
      </div>

      {/* PAGINATION */}
      {filteredGroups.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400 sm:text-left">
            Showing {firstIndex + 1} -{" "}
            {Math.min(
              lastIndex,
              filteredGroups.length
            )}{" "}
            of {filteredGroups.length}
          </p>

          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
              className="
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-700
                hover:bg-gray-100
                disabled:opacity-40
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:hover:bg-slate-700
                sm:px-4
              "
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => {
                const page = index + 1;

                return (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`
                      h-9
                      w-9
                      rounded-lg
                      text-sm
                      sm:h-10
                      sm:w-10
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              }
            )}

            <button
              type="button"
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage((page) => page + 1)
              }
              className="
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2
                text-sm
                text-slate-700
                hover:bg-gray-100
                disabled:opacity-40
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-slate-200
                dark:hover:bg-slate-700
                sm:px-4
              "
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Group"
        message="Are you sure you want to delete this group?"
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedGroupId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}