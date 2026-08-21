import { useParams } from "react-router-dom";
import GroupForm from "../../components/forms/GroupForm";

const EditGroup = () => {
  const { id } = useParams();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Edit Group
        </h1>

        <p className="text-slate-500 mt-1">
          Update group information.
        </p>
      </div>

      <div className="max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <GroupForm
            buttonText="Update Group"
            groupId={id}
          />
        </div>
      </div>
    </div>
  );
};

export default EditGroup;