import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Eye,
  Phone,
  MapPin,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getGroupById,
  getGroupMembers,
} from "../../services/groupService";

const GroupMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        groupResponse,
        membersResponse,
      ] = await Promise.all([
        getGroupById(id),
        getGroupMembers(id),
      ]);

      setGroup(groupResponse?.data || null);

      const memberData = Array.isArray(
        membersResponse?.data
      )
        ? membersResponse.data
        : membersResponse?.data?.content || [];

      setMembers(memberData);
    } catch (error) {
      console.error(
        "Failed to load group members:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load group members"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(
    (member) => {
      const value =
        search.toLowerCase().trim();

      if (!value) {
        return true;
      }

      const customerId =
        member.customerId
          ?.toString()
          .toLowerCase() || "";

      const fullName =
        (
          member.fullName ||
          member.name ||
          ""
        ).toLowerCase();

      const phone =
        member.phone
          ?.toString()
          .toLowerCase() || "";

      const address =
        member.address
          ?.toString()
          .toLowerCase() || "";

      return (
        customerId.includes(value) ||
        fullName.includes(value) ||
        phone.includes(value) ||
        address.includes(value)
      );
    }
  );

  const getManagerDisplay = () => {
    const managerId =
      group?.managerUserId ??
      group?.managerId ??
      group?.leaderUserId;

    const managerName =
      group?.managerName ??
      group?.leaderName;

    if (managerId && managerName) {
      return `${managerId} - ${managerName}`;
    }

    return managerName || managerId || "-";
  };

  if (loading) {
    return (
      <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400">
        Loading Group Members...
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

  return (
    <div className="w-full min-w-0">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={() => navigate("/groups")}
          className="
            shrink-0
            p-2
            rounded-lg
            border
            border-slate-300
            dark:border-slate-600
            hover:bg-slate-100
            dark:hover:bg-slate-800
            dark:text-slate-200
          "
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 break-words">
            {group.groupName}
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 break-words">
            Managed by {getManagerDisplay()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <UserRound
                size={22}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Members
              </p>

              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
                {members.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5 min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manager
          </p>

          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mt-1 break-words">
            {getManagerDisplay()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Group Status
          </p>

          <span
            className={`
              inline-block
              mt-2
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
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

      <div className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:justify-between sm:items-center">
          <div className="relative w-full sm:w-auto">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400 dark:text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search member..."
              className="
                border
                border-slate-300
                dark:border-slate-600
                bg-white
                dark:bg-slate-800
                text-slate-800
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-lg
                pl-10
                pr-4
                py-2
                w-full
                sm:w-80
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filteredMembers.length} member
            {filteredMembers.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <tr className="text-left text-slate-700 dark:text-slate-200">
                <th className="py-3 px-3">
                  S.no
                </th>

                <th className="px-3">
                  Customer ID
                </th>

                <th className="px-3">
                  Name
                </th>

                <th className="px-3">
                  Phone
                </th>

                <th className="px-3">
                  Address
                </th>

                <th className="px-3">
                  Status
                </th>

                <th className="px-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map(
                (member, index) => {
                  const name =
                    member.fullName ||
                    member.name ||
                    "-";

                  return (
                    <tr
                      key={
                        member.id ||
                        member.customerId ||
                        index
                      }
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                    >
                      <td className="py-4 px-3">
                        {index + 1}
                      </td>

                      <td className="px-3 font-medium">
                        {member.customerId || "-"}
                      </td>

                      <td className="px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <UserRound
                              size={16}
                              className="text-slate-500 dark:text-slate-400"
                            />
                          </div>

                          <span className="font-medium">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="px-3">
                        <div className="flex items-center gap-2">
                          <Phone
                            size={15}
                            className="text-slate-400 dark:text-slate-500"
                          />

                          {member.phone || "-"}
                        </div>
                      </td>

                      <td className="px-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="text-slate-400 dark:text-slate-500 flex-shrink-0"
                          />

                          <span className="truncate">
                            {member.address || "-"}
                          </span>
                        </div>
                      </td>

                      <td className="px-3">
                        <span
                          className={`
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-medium
                            ${
                              member.status ===
                              "ACTIVE"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }
                          `}
                        >
                          {member.status ||
                            "ACTIVE"}
                        </span>
                      </td>

                      <td className="px-3">
                        {member.id && (
                          <Link
                            to={`/members/${member.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="View Member"
                          >
                            <Eye size={18} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="text-center py-10 px-4 text-slate-500 dark:text-slate-400">
              No members found in this group.
            </div>
          )}
        </div>

        <div className="mt-5 sm:mt-6 border-t border-slate-200 dark:border-slate-700 pt-4 sm:pt-5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/groups/${id}`)
            }
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
              px-5
              py-2.5
              rounded-xl
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition
              dark:text-slate-200
            "
          >
            <ArrowLeft size={18} />
            Back to Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;