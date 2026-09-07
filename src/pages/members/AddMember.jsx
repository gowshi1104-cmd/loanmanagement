import MemberForm from "../../components/forms/MemberForm";

const AddMember = () => {

  return (

    <div className="w-full min-w-0">

      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">

        Add Member

      </h1>

      <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 mb-4 sm:mb-6">

        Create a new member and assign them to a group.

      </p>

      {/* =========================================================
          FORM
      ========================================================= */}

      <div className="w-full max-w-6xl mx-auto min-w-0">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">

          <MemberForm buttonText="Save Member" />

        </div>

      </div>

    </div>

  );

};

export default AddMember;