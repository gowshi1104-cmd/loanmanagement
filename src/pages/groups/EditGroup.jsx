import { useParams } from "react-router-dom";
import GroupForm from "../../components/forms/GroupForm";

const EditGroup = () => {
  const { id } = useParams();

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Edit Group
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Update group information.
        </p>
      </div>

      <div className="w-full max-w-5xl min-w-0">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
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