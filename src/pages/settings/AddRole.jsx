import RoleForm from "../../components/forms/RoleForm";

import { createRole } from "../../services/roleService";

const AddRole = () => {
  const handleCreate = async (role) => {
    await createRole(role);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Add Role
      </h1>

      <p className="mb-6 text-slate-500 dark:text-slate-400">
        Create a new role.
      </p>

      {/* Center aligned form */}
      <div className="w-full max-w-3xl rounded-2xl border border-transparent bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-900">
        <RoleForm
          onSubmit={handleCreate}
          buttonText="Save Role"
          successMessage="Role Added Successfully"
        />
      </div>
    </div>
  );
};

export default AddRole;