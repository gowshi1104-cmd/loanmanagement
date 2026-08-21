import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import RoleForm from "../../components/forms/RoleForm";

import {
  getRoleById,
  updateRole,
} from "../../services/roleService";

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);

  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    const response = await getRoleById(id);
    setRole(response.data);
  };

  const handleUpdate = async (updatedRole) => {
    await updateRole(id, updatedRole);
    navigate("/settings/roles"); // optional redirect after update
  };

  if (!role) {
    return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 text-center">
        <Pencil className="text-blue-600" size={30} />
        <div>
          <h1 className="text-3xl font-bold">Edit Role</h1>
          <p className="text-slate-500">Update role information.</p>
        </div>
      </div>

      {/* Center aligned form */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow border p-6">
        <RoleForm
          initialData={role}
          onSubmit={handleUpdate}
          buttonText="Update Role"
          successMessage="Role Updated Successfully"
        />
      </div>
    </div>
  );
};

export default EditRole;
