import GroupForm from "../../components/forms/GroupForm";

const AddGroup = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        Add Group
      </h1>

      <p className="text-slate-500 mt-1 mb-6">
        Create a new group.
      </p>

      <div className="max-w-5xl bg-white rounded-2xl shadow p-6">
        <GroupForm buttonText="Save Group" />
      </div>
    </div>
  );
};

export default AddGroup;