import { Link } from "react-router-dom";
import GroupsTable from "../../components/tables/GroupsTable";
import { hasPermission } from "../../utils/auth";

const Groups = () => {
  const canAdd = hasPermission("ADD_GROUP");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Groups
          </h1>

          <p className="text-slate-500">
            Manage all groups.
          </p>
        </div>

        {canAdd && (
          <Link
            to="/groups/add"
            className="
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

      <GroupsTable />
    </div>
  );
};

export default Groups;