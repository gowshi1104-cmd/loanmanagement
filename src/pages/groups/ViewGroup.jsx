import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";
import {
  ArrowLeft,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { getGroupById } from "../../services/groupService";

const ViewGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      setLoading(true);

      const response = await getGroupById(id);

      setGroup(response?.data || null);
    } catch (error) {
      console.error(
        "Failed to load group:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load group"
      );
    } finally {
      setLoading(false);
    }
  };

  const getManagerDisplay = () => {
    if (!group) {
      return "-";
    }

    const managerId =
      group.managerUserId ??
      group.managerId ??
      group.leaderUserId;

    const managerName =
      group.managerName ??
      group.leaderName;

    if (managerId && managerName) {
      return `${managerId} - ${managerName}`;
    }

    return managerName || managerId || "-";
  };

  if (loading) {
    return (
      <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400">
        Loading Group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400">
        Group not found
      </div>
    );
  }

  const memberCount =
    group.totalMembers ?? 0;

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          Group Details
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          View complete group information.
        </p>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Group Name
            </p>

            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100 mt-1 break-words">
              {group.groupName || "-"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manager
            </p>

            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100 mt-1 break-words">
              {getManagerDisplay()}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Members
            </p>

            <Link
              to={`/groups/${group.id}/members`}
              className="
                inline-flex
                items-center
                gap-2
                mt-1
                text-blue-600
                dark:text-blue-400
                hover:text-blue-800
                dark:hover:text-blue-300
                font-semibold
                text-lg
              "
            >
              <Users size={20} />

              {memberCount} Members
            </Link>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>

            <span
              className={`
                inline-block
                mt-1
                px-3
                py-1
                rounded-full
                text-sm
                ${
                  group.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }
              `}
            >
              {group.status || "-"}
            </span>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-slate-200 dark:border-slate-700 pt-5 sm:pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/groups")}
            className="
              w-full
              sm:w-auto
              flex
              justify-center
              items-center
              gap-2
              border
              border-slate-300
              dark:border-slate-600
              px-6
              py-3
              rounded-xl
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
              dark:text-slate-200
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

export default ViewGroup;