import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getUserById } from "../../services/userService";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await getUserById(id);
      setUser(res.data);
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to load user details";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">
          Loading user details...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-600 mb-5">
            User not found.
          </p>

          <button
            onClick={() => navigate("/settings/users")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
          >
            <ArrowLeft size={18} />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          User Details
        </h1>

        <p className="text-slate-500 mt-1">
          View complete user information.
        </p>
      </div>

      {/* User Details Card */}
      <div className="max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Full Name */}
          <div>
            <p className="text-sm text-slate-500">
              Full Name
            </p>

            <p className="font-semibold text-lg">
              {user.fullName || "-"}
            </p>
          </div>

          {/* Username */}
          <div>
            <p className="text-sm text-slate-500">
              Username
            </p>

            <p className="font-semibold text-lg">
              {user.username || "-"}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="font-semibold">
              {user.email || "-"}
            </p>
          </div>

          {/* Role */}
          <div>
            <p className="text-sm text-slate-500">
              Role
            </p>

            <p className="font-semibold">
              {user.role?.roleName || "-"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-slate-500">
              Status
            </p>

            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                user.enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.enabled ? "Active" : "Inactive"}
            </span>
          </div>

          {/* User ID */}
          <div>
            <p className="text-sm text-slate-500">
              User ID
            </p>

            <p className="font-semibold">
              {user.id}
            </p>
          </div>

        </div>

        {/* Back Button */}
        <div className="mt-8 border-t border-slate-200 pt-6 flex justify-end">
          <button
            onClick={() => navigate("/settings/users")}
            className="flex items-center gap-2 border border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-100 transition"
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