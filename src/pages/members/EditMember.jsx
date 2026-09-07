import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import MemberForm from "../../components/forms/MemberForm";

import { getMemberById } from "../../services/memberService";

const EditMember = () => {

  const { id } = useParams();

  const [member, setMember] = useState(null);

  // =========================================================
  // LOAD MEMBER BY DATABASE ID
  // =========================================================

  useEffect(() => {

    loadMember();

  }, [id]);

  const loadMember = async () => {

    try {

      const response = await getMemberById(id);

      setMember(response.data);

    } catch (error) {

      console.error(
        "Failed to load member:",
        error
      );

      alert("Failed to load member");

    }

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!member) {

    return (

      <div className="flex items-center justify-center min-h-[300px] w-full min-w-0">

        <p className="text-slate-500 dark:text-slate-400">

          Loading...

        </p>

      </div>

    );

  }

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="w-full min-w-0">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-4 sm:mb-6">

        <h1 className="text-2xl sm:text-2xl font-bold text-slate-800 dark:text-white">

          Edit Member

        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">

          Update member information.

        </p>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="w-full max-w-6xl min-w-0">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">

          <MemberForm

            buttonText="Update Member"

            memberData={member}

            isEdit={true}

          />

        </div>

      </div>

    </div>

  );

};

export default EditMember;