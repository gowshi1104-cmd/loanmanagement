import MemberForm from "../../components/forms/MemberForm";

const AddMember = () => {
  return (
    <div>
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <h1 className="text-3xl font-bold text-slate-800">
        Add Member
      </h1>

      <p className="text-slate-500 mt-1 mb-6">
        Create a new member and assign them to a group.
      </p>

      {/* =========================================================
          FORM
      ========================================================= */}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <MemberForm buttonText="Save Member" />
        </div>
      </div>
    </div>
  );
};

export default AddMember;