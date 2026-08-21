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
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Edit Member
        </h1>

        <p className="text-slate-500 mt-1">
          Update member information.
        </p>
      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      <div className="max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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