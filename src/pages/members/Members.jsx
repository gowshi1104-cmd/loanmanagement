import { useNavigate } from "react-router-dom";

import MembersTable from "../../components/tables/MembersTable";

import { hasPermission } from "../../utils/auth";

const Members = () => {
  const navigate = useNavigate();

  const canAdd = hasPermission("ADD_MEMBER");

  return (
    <div className="w-full min-w-0">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl dark:text-white">
            Members
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base dark:text-slate-400">
            Manage all members
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => navigate("/members/add")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] sm:w-auto sm:px-5"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* =========================================================
          MEMBERS TABLE
      ========================================================= */}
      <div className="min-w-0">
        <MembersTable />
      </div>
    </div>
  );
};

export default Members;