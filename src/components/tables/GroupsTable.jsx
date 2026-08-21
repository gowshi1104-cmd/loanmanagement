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
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="text-center py-10 text-slate-500">
          Loading Groups...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* SEARCH */}

      <div className="flex justify-between items-center mb-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
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
              border
              border-slate-300
              rounded-lg
              pl-10
              pr-4
              py-2
              w-80
              outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
            "
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-slate-50">
            <tr className="text-left">
              <th className="py-3 px-2">
                S.no
              </th>

              <th className="px-2">
                Group Name
              </th>

              <th className="px-2">
                Manager
              </th>

              <th className="px-2">
                Members
              </th>

              <th className="px-2">
                Status
              </th>

              <th className="px-2">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentGroups.map((group, index) => (
              <tr
                key={group.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="py-4 px-2">
                  {firstIndex + index + 1}
                </td>

                <td className="px-2 font-medium text-slate-800">
                  {group.groupName || "-"}
                </td>

                <td className="px-2">
                  {getManagerDisplay(group)}
                </td>

                <td className="px-2">
                  <Link
                    to={`/groups/${group.id}/members`}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-blue-600
                      hover:text-blue-800
                      font-semibold
                    "
                    title="View Group Members"
                  >
                    <Users size={16} />

                    {group.totalMembers ?? 0}
                  </Link>
                </td>

                <td className="px-2">
                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-medium
                      ${
                        group.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    `}
                  >
                    {group.status || "-"}
                  </span>
                </td>

                <td className="px-2">
                  <div className="flex items-center gap-3">
                    {canView && (
                      <Link
                        to={`/groups/${group.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye size={18} />
                      </Link>
                    )}

                    {canEdit && (
                      <Link
                        to={`/groups/${group.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-700"
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
                        className="text-red-600 hover:text-red-700"
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
          <p className="text-center py-8 text-slate-500">
            No groups found
          </p>
        )}
      </div>

      {/* PAGINATION */}

      {filteredGroups.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">
            Showing {firstIndex + 1} -{" "}
            {Math.min(
              lastIndex,
              filteredGroups.length
            )}{" "}
            of {filteredGroups.length}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => page - 1)
              }
              className="
                px-4
                py-2
                border
                rounded-lg
                disabled:opacity-40
                hover:bg-gray-100
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
                      w-10
                      h-10
                      rounded-lg
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-100"
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
                px-4
                py-2
                border
                rounded-lg
                disabled:opacity-40
                hover:bg-gray-100
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