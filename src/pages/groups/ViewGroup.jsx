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
      <div className="text-center py-10 text-slate-500">
        Loading Group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-10 text-slate-500">
        Group not found
      </div>
    );
  }

  const memberCount =
    group.totalMembers ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Group Details
        </h1>

        <p className="text-slate-500 mt-1">
          View complete group information.
        </p>
      </div>

      <div className="max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-500">
              Group Name
            </p>

            <p className="font-semibold text-lg text-slate-800 mt-1">
              {group.groupName || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Manager
            </p>

            <p className="font-semibold text-lg text-slate-800 mt-1">
              {getManagerDisplay()}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
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
                hover:text-blue-800
                font-semibold
                text-lg
              "
            >
              <Users size={20} />

              {memberCount} Members
            </Link>
          </div>

          <div>
            <p className="text-sm text-slate-500">
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
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {group.status || "-"}
            </span>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/groups")}
            className="
              flex
              items-center
              gap-2
              border
              border-slate-300
              px-6
              py-3
              rounded-xl
              hover:bg-slate-100
              transition
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