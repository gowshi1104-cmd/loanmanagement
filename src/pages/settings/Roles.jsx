import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import RolesTable from "../../components/tables/RolesTable";

const Roles = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold dark:text-slate-100">
            Roles & Permissions
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage application roles.
          </p>
        </div>

        <Link
          to="/settings/roles/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow"
        >
          <Plus size={18} />
          Add Role
        </Link>

      </div>

      <RolesTable />
    </div>
  );
};

export default Roles;