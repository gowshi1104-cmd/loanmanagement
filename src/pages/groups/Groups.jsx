import { Link } from "react-router-dom";
import GroupsTable from "../../components/tables/GroupsTable";
import { hasPermission } from "../../utils/auth";

const Groups = () => {
  const canAdd = hasPermission("ADD_GROUP");

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Groups
          </h1>

          <p className="text-sm sm:text-base text-slate-500">
            Manage all groups.
          </p>
        </div>

        {canAdd && (
          <Link
            to="/groups/add"
            className="
              w-full
              sm:w-auto
              text-center
              bg-blue-600
              text-white
              px-5
              py-2
              rounded-lg
              hover:bg-blue-700
              transition
            "
          >
            + Add Group
          </Link>
        )}
      </div>

      <div className="w-full min-w-0">
        <GroupsTable />
      </div>
    </div>
  );
};

export default Groups;