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
        min-h-[300px]
        items-center
        justify-center
        px-4
      ">
        <p className="
          text-sm
          text-slate-500
          dark:text-slate-400
          sm:text-base
        ">
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
    <div className="
      mx-auto
      w-full
      min-w-0
      max-w-6xl
    ">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="
        mb-4
        flex
        flex-col
        gap-3
        sm:mb-6
        sm:gap-4
        md:flex-row
        md:items-center
        md:justify-between
      ">
        <div className="min-w-0">
          <h1 className="
            text-2xl
            font-bold
            text-slate-800
            dark:text-white
            sm:text-3xl
          ">
            Member Details
          </h1>

          <p className="
            mt-1
            text-sm
            text-slate-500
            dark:text-slate-400
            sm:text-base
          ">
            View complete member information.
          </p>
        </div>

        {/* STATUS */}
        <span
          className={`
            inline-flex
            w-fit
            shrink-0
            rounded-full
            px-3
            py-2
            text-xs
            font-semibold
            sm:px-4
            sm:text-sm
            ${
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
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
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-900
      ">
        {/* ===================================================
            CARD HEADER
        =================================================== */}
        <div className="
          border-b
          border-slate-200
          bg-slate-50
          px-4
          py-5
          dark:border-slate-700
          dark:bg-slate-800
          sm:px-8
          sm:py-6
        ">
          <div className="
            flex
            min-w-0
            items-center
            gap-3
            sm:gap-4
          ">
            <div className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-blue-600
              dark:bg-blue-950/50
              dark:text-blue-400
              sm:h-14
              sm:w-14
            ">
              <User
                size={24}
                className="sm:h-7 sm:w-7"
              />
            </div>

            <div className="min-w-0">
              <h2 className="
                truncate
                text-lg
                font-bold
                text-slate-800
                dark:text-white
                sm:text-xl
              ">
                {member.name || "-"}
              </h2>

              <p className="
                mt-1
                text-xs
                text-slate-500
                dark:text-slate-400
                sm:text-sm
              ">
                Customer ID:{" "}
                <span className="
                  font-semibold
                  text-blue-600
                  dark:text-blue-400
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
          grid
          grid-cols-1
          gap-x-6
          gap-y-6
          p-4
          sm:gap-x-12
          sm:gap-y-8
          sm:p-8
          md:grid-cols-2
        ">
          {/* CUSTOMER ID */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <CreditCard size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Customer ID
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.customerId || "-"}
              </p>
            </div>
          </div>

          {/* FULL NAME */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <User size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Full Name
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.name || "-"}
              </p>
            </div>
          </div>

          {/* PHONE */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <Phone size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Phone Number
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.phone || "-"}
              </p>
            </div>
          </div>

          {/* GROUP */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <Users size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Group
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.groupName || "-"}
              </p>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <MapPin size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Address
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.address || "-"}
              </p>
            </div>
          </div>

          {/* PAN NUMBER */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                PAN Number
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.panNumber || "-"}
              </p>
            </div>
          </div>

          {/* AADHAR NUMBER */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <ShieldCheck size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Aadhaar Number
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
              ">
                {member.aadharNumber || "-"}
              </p>
            </div>
          </div>

          {/* CREATED BY */}
          <div className="
            flex
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <UserCog size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Created By
              </p>

              <p className="
                mt-1
                break-words
                font-semibold
                text-slate-800
                dark:text-slate-200
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
            min-w-0
            items-start
            gap-3
            sm:gap-4
          ">
            <div className="
              mt-1
              shrink-0
              text-blue-600
              dark:text-blue-400
            ">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <p className="
                text-sm
                text-slate-500
                dark:text-slate-400
              ">
                Document
              </p>

              <p className="
                mt-1
                break-all
                font-semibold
                text-slate-800
                dark:text-slate-200
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
          flex
          justify-end
          border-t
          border-slate-200
          bg-slate-50
          px-4
          py-4
          dark:border-slate-700
          dark:bg-slate-800
          sm:px-8
          sm:py-6
        ">
          <button
            onClick={() =>
              navigate("/members")
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-300
              bg-white
              px-5
              py-3
              font-medium
              text-slate-700
              transition
              hover:bg-slate-100
              dark:border-slate-600
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-700
              sm:w-auto
              sm:px-6
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