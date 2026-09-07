import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import toast from "react-hot-toast";

import {
  getUserById,
} from "../../services/userService";

const ViewUser = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD USER
  // =========================================================

  const loadUser = async () => {

    try {

      const res = await getUserById(id);

      setUser(res.data);

    } catch (err) {

      console.error(
        "Load User Error:",
        err
      );

      if (err.response?.status === 403) {

        toast.error(
          "You don't have permission to view this user. Please contact the reporting manager."
        );

      } else if (
        err.response?.status === 401
      ) {

        toast.error("Unauthorized");

      } else {

        const message =
          err.response?.data?.message ||
          err.response?.data ||
          "Failed to load user details";

        toast.error(message);

      }

      setUser(null);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadUser();

  }, [id]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex items-center justify-center py-20">

        <p className="text-slate-500 dark:text-slate-400">
          Loading user details...
        </p>

      </div>

    );

  }

  // =========================================================
  // USER NOT FOUND / ACCESS DENIED
  // =========================================================

  if (!user) {

    return (

      <div className="py-10">

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">

          <p className="text-slate-600 dark:text-slate-400 mb-5">

            You don't have permission to view
            this user or the user was not found.

          </p>

          <button

            onClick={() =>
              navigate("/settings/users")
            }

            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"

          >

            <ArrowLeft size={18} />

            Back to Users

          </button>

        </div>

      </div>

    );

  }

  const reportingManager =
    user.reportingManager;

  // =========================================================
  // UI
  // =========================================================

  return (

    <div>

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">

          User Details

        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-1">

          View complete user information.

        </p>

      </div>

      {/* USER DETAILS */}

      <div className="max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* FULL NAME */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Full Name

            </p>

            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">

              {user.fullName || "-"}

            </p>

          </div>

          {/* USERNAME */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Username

            </p>

            <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">

              {user.username || "-"}

            </p>

          </div>

          {/* EMAIL */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Email

            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">

              {user.email || "-"}

            </p>

          </div>

          {/* ROLE */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Role

            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">

              {user.role?.roleName || "-"}

            </p>

          </div>

          {/* REPORTING MANAGER */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Reporting Manager

            </p>

            {reportingManager ? (

              <div className="mt-1">

                <p className="font-semibold text-lg text-slate-800 dark:text-slate-200">

                  {reportingManager.fullName ||
                    "-"}

                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">

                  {reportingManager.username ||
                    reportingManager.userId ||
                    reportingManager.id ||
                    "-"}

                </p>

              </div>

            ) : (

              <p className="font-semibold text-slate-800 dark:text-slate-200">

                -

              </p>

            )}

          </div>

          {/* STATUS */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              Status

            </p>

            <span

              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                user.enabled
                  ? "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              }`}

            >

              {user.enabled
                ? "Active"
                : "Inactive"}

            </span>

          </div>

          {/* USER ID */}

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">

              User ID

            </p>

            <p className="font-semibold text-slate-800 dark:text-slate-200">

              {user.id}

            </p>

          </div>

        </div>

        {/* BACK */}

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex justify-end">

          <button

            onClick={() =>
              navigate("/settings/users")
            }

            className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 px-6 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"

          >

            <ArrowLeft size={18} />

            Back

          </button>

        </div>

      </div>

    </div>

  );

};

export default ViewUser;