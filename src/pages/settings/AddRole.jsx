import RoleForm from "../../components/forms/RoleForm";
import { createRole } from "../../services/roleService";

const AddRole = () => {
  const handleCreate = async (role) => {
    await createRole(role);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-1">
        Add Role
      </h1>

      <p className="text-slate-500 mb-6">
        Create a new role.
      </p>

      {/* 🔥 Center aligned form */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
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
