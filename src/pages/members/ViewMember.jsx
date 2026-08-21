import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Users,
  CreditCard,
  FileText,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import {
  getMemberById,
} from "../../services/memberService";

const ViewMember = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [member, setMember] =
    useState(null);

  // =========================================================
  // LOAD MEMBER
  // =========================================================

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const response =
        await getMemberById(id);

      setMember(response.data);

    } catch (error) {

      console.error(
        "Failed to load member:",
        error
      );

      alert(
        "Failed to load member details"
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!member) {
    return (
      <div className="
        flex
        items-center
        justify-center
        min-h-[300px]
      ">
        <p className="text-slate-500">
          Loading member details...
        </p>
      </div>
    );
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const isActive =
    member.status === "ACTIVE";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        mb-6
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-slate-800
          ">
            Member Details
          </h1>

          <p className="
            text-slate-500
            mt-1
          ">
            View complete member information.
          </p>

        </div>

        {/* STATUS */}

        <span
          className={`
            inline-flex
            w-fit
            px-4
            py-2
            rounded-full
            text-sm
            font-semibold

            ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }
          `}
        >
          {member.status || "-"}
        </span>

      </div>

      {/* =====================================================
          MEMBER DETAILS CARD
      ===================================================== */}

      <div className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        overflow-hidden
      ">

        {/* ===================================================
            CARD HEADER
        =================================================== */}

        <div className="
          px-8
          py-6
          border-b
          border-slate-200
          bg-slate-50
        ">

          <div className="
            flex
            items-center
            gap-4
          ">

            <div className="
              w-14
              h-14
              rounded-full
              bg-blue-100
              text-blue-600
              flex
              items-center
              justify-center
            ">

              <User size={28} />

            </div>

            <div>

              <h2 className="
                text-xl
                font-bold
                text-slate-800
              ">
                {member.name || "-"}
              </h2>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Customer ID:
                {" "}
                <span className="
                  font-semibold
                  text-blue-600
                ">
                  {member.customerId || "-"}
                </span>
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            DETAILS
        =================================================== */}

        <div className="
          p-8
          grid
          grid-cols-1
          md:grid-cols-2
          gap-x-12
          gap-y-8
        ">

          {/* CUSTOMER ID */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <CreditCard size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Customer ID
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.customerId || "-"}
              </p>

            </div>

          </div>

          {/* FULL NAME */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <User size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Full Name
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.name || "-"}
              </p>

            </div>

          </div>

          {/* PHONE */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <Phone size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Phone Number
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.phone || "-"}
              </p>

            </div>

          </div>

          {/* GROUP */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <Users size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Group
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.groupName || "-"}
              </p>

            </div>

          </div>

          {/* ADDRESS */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <MapPin size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Address
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
                break-words
              ">
                {member.address || "-"}
              </p>

            </div>

          </div>

          {/* PAN NUMBER */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <FileText size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                PAN Number
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.panNumber || "-"}
              </p>

            </div>

          </div>

          {/* AADHAR NUMBER */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <ShieldCheck size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Aadhaar Number
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.aadharNumber || "-"}
              </p>

            </div>

          </div>

          {/* CREATED BY */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <UserCog size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Created By
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
              ">
                {member.createdByName ||
                  member.createdByUsername ||
                  "-"}
              </p>

            </div>

          </div>

          {/* DOCUMENT */}

          <div className="
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              text-blue-600
            ">
              <FileText size={20} />
            </div>

            <div>

              <p className="
                text-sm
                text-slate-500
              ">
                Document
              </p>

              <p className="
                font-semibold
                text-slate-800
                mt-1
                break-all
              ">
                {member.documentFileName || "-"}
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            BACK BUTTON
        =================================================== */}

        <div className="
          px-8
          py-6
          border-t
          border-slate-200
          bg-slate-50
          flex
          justify-end
        ">

          <button
            onClick={() =>
              navigate("/members")
            }
            className="
              flex
              items-center
              gap-2
              border
              border-slate-300
              bg-white
              px-6
              py-3
              rounded-xl
              hover:bg-slate-100
              transition
              font-medium
              text-slate-700
            "
          >

            <ArrowLeft size={18} />

            Back

          </button>

        </div>

      </div>

    </div>
  );
};

export default ViewMember;