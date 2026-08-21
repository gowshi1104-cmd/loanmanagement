import { useNavigate } from "react-router-dom";
import MembersTable from "../../components/tables/MembersTable";
import { hasPermission } from "../../utils/auth";

const Members = () => {
  const navigate = useNavigate();

  const canAdd = hasPermission("ADD_MEMBER");

  return (
    <div>
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Members
          </h1>

          <p className="text-slate-500">
            Manage all members
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => navigate("/members/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            + Add Member
          </button>
        )}
      </div>

      {/* =========================================================
          MEMBERS TABLE
      ========================================================= */}

      <MembersTable />
    </div>
  );
};

export default Members;