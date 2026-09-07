import GroupForm from "../../components/forms/GroupForm";

const AddGroup = () => {
  return (
    <div className="w-full min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
        Add Group
      </h1>

      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 mb-4 sm:mb-6">
        Create a new group.
      </p>

      <div className="w-full max-w-5xl min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow p-4 sm:p-6">
        <GroupForm buttonText="Save Group" />
      </div>
    </div>
  );
};

export default AddGroup;