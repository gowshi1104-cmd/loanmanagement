import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import DeleteModal from "../common/DeleteModal";

import {
  getMembers,
  deleteMember,
} from "../../services/memberService";

import toast from "react-hot-toast";

import { hasPermission } from "../../utils/auth";

import {
  Eye,
  Pencil,
  Trash2,
  History,
} from "lucide-react";

export default function MembersTable() {
  const [members, setMembers] = useState([]);

  const [search, setSearch] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedMemberId, setSelectedMemberId] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  // =========================================================
  // LOAD MEMBERS
  // =========================================================

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await getMembers();

      setMembers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load members:",
        error
      );

      toast.error(
        "Failed to load members"
      );
    }
  };

  // =========================================================
  // DELETE MEMBER
  // =========================================================

  const handleDelete = async () => {
    if (!selectedMemberId) {
      return;
    }

    try {
      await deleteMember(selectedMemberId);

      toast.success(
        "Member Deleted"
      );

      setIsDeleteOpen(false);

      setSelectedMemberId(null);

      await loadMembers();

    } catch (error) {
      console.error(
        "Delete member error:",
        error
      );

      toast.error(
        "Delete Failed"
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredMembers = members.filter(
    (member) => {
      const value =
        search
          .toLowerCase()
          .trim();

      return (
        member.id
          ?.toString()
          .includes(value) ||

        member.customerId
          ?.toLowerCase()
          .includes(value) ||

        member.name
          ?.toLowerCase()
          .includes(value) ||

        member.phone
          ?.toLowerCase()
          .includes(value) ||

        member.groupName
          ?.toLowerCase()
          .includes(value) ||

        member.status
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.ceil(
      filteredMembers.length /
        recordsPerPage
    );

  const lastIndex =
    currentPage *
    recordsPerPage;

  const firstIndex =
    lastIndex -
    recordsPerPage;

  const currentMembers =
    filteredMembers.slice(
      firstIndex,
      lastIndex
    );

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const canView =
    hasPermission(
      "VIEW_MEMBERS"
    );

  const canEdit =
    hasPermission(
      "EDIT_MEMBER"
    );

  const canDelete =
    hasPermission(
      "DELETE_MEMBER"
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="bg-white rounded-2xl shadow p-6">

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="flex justify-between items-center mb-5">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);

            setCurrentPage(1);
          }}
          className="
            border
            rounded-lg
            px-4
            py-2
            w-72
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="border-b">

            <tr className="text-left">

              <th className="py-3">
                S.no
              </th>

              <th>
                Customer ID
              </th>

              <th>
                Name
              </th>

              <th>
                Phone
              </th>

              <th>
                Group
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {currentMembers.map(
              (member, index) => (

                <tr
                  key={member.id}
                  className="
                    border-b
                    hover:bg-slate-50
                  "
                >

                  {/* S.NO */}

                  <td className="py-4">
                    {firstIndex + index + 1}
                  </td>

                  {/* CUSTOMER ID */}

                  <td className="
                    font-medium
                    text-blue-600
                  ">
                    {member.customerId}
                  </td>

                  {/* NAME */}

                  <td>
                    {member.name}
                  </td>

                  {/* PHONE */}

                  <td>
                    {member.phone}
                  </td>

                  {/* GROUP */}

                  <td>
                    {member.groupName}
                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm

                        ${
                          member.status ===
                          "ACTIVE"
                            ? `
                              bg-green-100
                              text-green-700
                            `
                            : `
                              bg-red-100
                              text-red-700
                            `
                        }
                      `}
                    >
                      {member.status}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-2">

                    <div className="
                      flex
                      items-center
                      gap-3
                    ">

                      {/* =================================================
                          VIEW
                          DATABASE ID BASED
                      ================================================= */}

                      {canView && (
                        <Link
                          to={`/members/${member.id}`}
                          className="
                            text-blue-600
                            hover:text-blue-800
                          "
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                      )}

                      {/* =================================================
                          MEMBER HISTORY
                          CUSTOMER ID BASED

                          Example:
                          /members/LN001/history
                      ================================================= */}

                      {canView && (
                        <Link
                          to={`/members/${encodeURIComponent(
                            member.customerId
                          )}/history`}
                          className="
                            text-purple-600
                            hover:text-purple-800
                          "
                          title="History"
                        >
                          <History size={18} />
                        </Link>
                      )}

                      {/* =================================================
                          EDIT
                          DATABASE ID BASED
                      ================================================= */}

                      {canEdit && (
                        <Link
                          to={`/members/${member.id}/edit`}
                          className="
                            text-yellow-600
                            hover:text-yellow-700
                          "
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </Link>
                      )}

                      {/* =================================================
                          DELETE
                          DATABASE ID BASED
                      ================================================= */}

                      {canDelete && (
                        <button
                          onClick={() => {
                            setSelectedMemberId(
                              member.id
                            );

                            setIsDeleteOpen(
                              true
                            );
                          }}
                          className="
                            text-red-600
                            hover:text-red-700
                          "
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        {/* =====================================================
            NO MEMBERS
        ===================================================== */}

        {filteredMembers.length === 0 && (
          <p className="
            text-center
            text-slate-500
            py-6
          ">
            No members found
          </p>
        )}

      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {filteredMembers.length > 0 && (

        <div className="
          flex
          justify-between
          items-center
          mt-6
        ">

          <p className="
            text-sm
            text-gray-500
          ">
            Showing {firstIndex + 1}
            {" - "}
            {Math.min(
              lastIndex,
              filteredMembers.length
            )}
            {" of "}
            {filteredMembers.length}
          </p>

          <div className="
            flex
            items-center
            gap-2
          ">

            {/* PREVIOUS */}

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p - 1
                )
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

            {/* PAGE NUMBERS */}

            {Array.from(
              {
                length: totalPages,
              },
              (_, i) => (

                <button
                  key={i}
                  onClick={() =>
                    setCurrentPage(
                      i + 1
                    )
                  }
                  className={`
                    w-10
                    h-10
                    rounded-lg

                    ${
                      currentPage ===
                      i + 1
                        ? `
                          bg-blue-600
                          text-white
                        `
                        : `
                          border
                          hover:bg-gray-100
                        `
                    }
                  `}
                >
                  {i + 1}
                </button>

              )
            )}

            {/* NEXT */}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p + 1
                )
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

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Member"
        message="Are you sure you want to delete this member?"
        onClose={() => {
          setIsDeleteOpen(false);

          setSelectedMemberId(null);
        }}
        onConfirm={handleDelete}
      />

    </div>
  );
}