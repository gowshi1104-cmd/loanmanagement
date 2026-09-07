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
    <div className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow p-4 sm:p-6">

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5">

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
            border-slate-300
            dark:border-slate-700
            bg-white
            dark:bg-slate-800
            text-slate-800
            dark:text-slate-200
            placeholder:text-slate-400
            dark:placeholder:text-slate-500
            rounded-lg
            px-4
            py-2
            w-full
            sm:w-72
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="w-full min-w-0 overflow-x-auto">

        <table className="w-full min-w-[850px]">

          <thead className="border-b border-slate-200 dark:border-slate-700">

            <tr className="text-left text-slate-700 dark:text-slate-300">

              <th className="py-3 px-2 whitespace-nowrap">
                S.no
              </th>

              <th className="px-2 whitespace-nowrap">
                Customer ID
              </th>

              <th className="px-2 whitespace-nowrap">
                Name
              </th>

              <th className="px-2 whitespace-nowrap">
                Phone
              </th>

              <th className="px-2 whitespace-nowrap">
                Group
              </th>

              <th className="px-2 whitespace-nowrap">
                Status
              </th>

              <th className="px-2 whitespace-nowrap">
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
                    border-slate-200
                    dark:border-slate-800
                    hover:bg-slate-50
                    dark:hover:bg-slate-800/60
                  "
                >

                  {/* S.NO */}

                  <td className="py-4 px-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {firstIndex + index + 1}
                  </td>

                  {/* CUSTOMER ID */}

                  <td className="
                    px-2
                    font-medium
                    text-blue-600
                    dark:text-blue-400
                    whitespace-nowrap
                  ">
                    {member.customerId}
                  </td>

                  {/* NAME */}

                  <td className="px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {member.name}
                  </td>

                  {/* PHONE */}

                  <td className="px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {member.phone}
                  </td>

                  {/* GROUP */}

                  <td className="px-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {member.groupName}
                  </td>

                  {/* STATUS */}

                  <td className="px-2 whitespace-nowrap">

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        inline-block
                        ${
                          member.status ===
                          "ACTIVE"
                            ? `
                              bg-green-100
                              text-green-700
                              dark:bg-green-950/50
                              dark:text-green-400
                            `
                            : `
                              bg-red-100
                              text-red-700
                              dark:bg-red-950/50
                              dark:text-red-400
                            `
                        }
                      `}
                    >
                      {member.status}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-2 whitespace-nowrap">

                    <div className="
                      flex
                      items-center
                      gap-3
                      whitespace-nowrap
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
                            dark:text-blue-400
                            hover:text-blue-800
                            dark:hover:text-blue-300
                            p-1
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
                            dark:text-purple-400
                            hover:text-purple-800
                            dark:hover:text-purple-300
                            p-1
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
                            dark:text-yellow-400
                            hover:text-yellow-700
                            dark:hover:text-yellow-300
                            p-1
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
                            dark:text-red-400
                            hover:text-red-700
                            dark:hover:text-red-300
                            p-1
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
            dark:text-slate-400
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
          flex-col
          sm:flex-row
          justify-between
          items-start
          sm:items-center
          gap-4
          mt-6
        ">

          <p className="
            text-sm
            text-gray-500
            dark:text-slate-400
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
            flex-wrap
            items-center
            gap-2
            w-full
            sm:w-auto
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
                px-3
                sm:px-4
                py-2
                border
                border-slate-300
                dark:border-slate-700
                rounded-lg
                text-slate-700
                dark:text-slate-300
                disabled:opacity-40
                hover:bg-gray-100
                dark:hover:bg-slate-800
                text-sm
                sm:text-base
              "
            >
              Previous
            </button>

            {/* PAGE NUMBERS */}

            <div className="flex flex-wrap items-center gap-2">

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
                      w-9
                      h-9
                      sm:w-10
                      sm:h-10
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
                            border-slate-300
                            dark:border-slate-700
                            text-slate-700
                            dark:text-slate-300
                            hover:bg-gray-100
                            dark:hover:bg-slate-800
                          `
                      }
                    `}
                  >
                    {i + 1}
                  </button>

                )
              )}

            </div>

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
                px-3
                sm:px-4
                py-2
                border
                border-slate-300
                dark:border-slate-700
                rounded-lg
                text-slate-700
                dark:text-slate-300
                disabled:opacity-40
                hover:bg-gray-100
                dark:hover:bg-slate-800
                text-sm
                sm:text-base
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