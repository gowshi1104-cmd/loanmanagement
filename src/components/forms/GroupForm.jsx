import { Save, AlertTriangle, ChevronDown } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  createGroup,
  getGroupById,
  updateGroup,
} from "../../services/groupService";

import api from "../../api/axios";

const GroupForm = ({
  buttonText = "Save Group",
  groupId,
}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [managers, setManagers] = useState([]);

  const allowBrowserBack = useRef(false);
  const historyGuardAdded = useRef(false);

  const [group, setGroup] = useState({
    groupName: "",
    managerUserId: "",
    totalMembers: 0,
    status: "ACTIVE",
  });

  // ============================================================
  // LOAD MANAGERS
  // ============================================================

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoadingManagers(true);

      /**
       * Only Manager users should be returned by this endpoint.
       *
       * Expected response:
       * [
       *   {
       *     id: 1,
       *     username: "MAN001",
       *     fullName: "Manager Name"
       *   }
       * ]
       */

      const response = await api.get("/users/managers");

      const data = Array.isArray(response?.data)
        ? response.data
        : response?.data?.content || [];

      setManagers(data);
    } catch (error) {
      console.error("Failed to load managers:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load managers"
      );

      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  // ============================================================
  // LOAD GROUP FOR EDIT
  // ============================================================

  useEffect(() => {
    if (!groupId) {
      return;
    }

    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoadingGroup(true);

      const response = await getGroupById(groupId);

      const data = response?.data;

      setGroup({
        groupName: data?.groupName || "",

        /**
         * Backend should return managerUserId.
         *
         * Old leaderName / managerName values are intentionally
         * NOT used for saving.
         */

        managerUserId:
          data?.managerUserId != null
            ? String(data.managerUserId)
            : data?.manager?.id != null
            ? String(data.manager.id)
            : "",

        totalMembers: data?.totalMembers ?? 0,
        status: data?.status || "ACTIVE",
      });

      setIsDirty(false);
    } catch (error) {
      console.error("Failed to load group:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load group"
      );
    } finally {
      setLoadingGroup(false);
    }
  };

  // ============================================================
  // BROWSER BACK PROTECTION
  // ============================================================

  useEffect(() => {
    if (historyGuardAdded.current) {
      return;
    }

    historyGuardAdded.current = true;

    window.history.pushState(
      {
        groupFormPage: true,
      },
      "",
      window.location.href
    );

    const handlePopState = () => {
      if (allowBrowserBack.current) {
        return;
      }

      if (isDirty) {
        window.history.pushState(
          {
            groupFormPage: true,
          },
          "",
          window.location.href
        );

        setShowLeaveModal(true);
        return;
      }

      allowBrowserBack.current = true;

      navigate("/groups", {
        replace: true,
      });
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );

      historyGuardAdded.current = false;
    };
  }, [isDirty, navigate]);

  // ============================================================
  // FIELD CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setGroup((previous) => ({
      ...previous,
      [name]: value,
    }));

    setIsDirty(true);
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    if (!group.groupName.trim()) {
      toast.error("Group Name is required");
      return false;
    }

    if (!group.managerUserId) {
      toast.error("Manager is required");
      return false;
    }

    if (!group.status) {
      toast.error("Group Status is required");
      return false;
    }

    return true;
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    if (!isDirty) {
      allowBrowserBack.current = true;

      navigate("/groups", {
        replace: true,
      });

      return;
    }

    setShowLeaveModal(true);
  };

  // ============================================================
  // STAY
  // ============================================================

  const handleStay = () => {
    setShowLeaveModal(false);
  };

  // ============================================================
  // CONFIRM LEAVE
  // ============================================================

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setIsDirty(false);
    allowBrowserBack.current = true;

    navigate("/groups", {
      replace: true,
    });
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      /**
       * IMPORTANT
       *
       * managerUserId is sent to backend.
       *
       * We DO NOT send:
       * - leaderName
       * - managerName
       * - totalMembers
       *
       * totalMembers is calculated by backend from members
       * assigned to this group.
       */

      const groupData = {
        groupName: group.groupName.trim(),
        managerUserId: Number(group.managerUserId),
        status: group.status,
      };

      if (groupId) {
        await updateGroup(groupId, groupData);

        toast.success(
          "Group Updated Successfully"
        );
      } else {
        await createGroup(groupData);

        toast.success(
          "Group Added Successfully"
        );
      }

      setIsDirty(false);
      allowBrowserBack.current = true;

      navigate("/groups", {
        replace: true,
      });
    } catch (error) {
      console.error("Group save error:", error);

      console.error(
        "Backend response:",
        error?.response?.data
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to save group";

      toast.error(
        typeof message === "string"
          ? message
          : "Failed to save group"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (
    (groupId && loadingGroup) ||
    loadingManagers
  ) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-16 px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {groupId
              ? "Loading Group..."
              : "Loading Managers..."}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div className="w-full min-w-0">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
            Group Information
          </h2>

          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Enter the group details and assign a manager.
          </p>
        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {/* ====================================================
              GROUP NAME
          ==================================================== */}

          <div className="min-w-0">
            <label className="mb-2 block text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
              Group Name{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="groupName"
              value={group.groupName}
              onChange={handleChange}
              placeholder="Enter group name"
              disabled={loading}
              className="
                w-full
                rounded-xl
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                px-3
                py-2.5
                sm:px-4
                sm:py-3
                text-slate-800
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                outline-none
                transition
                hover:border-slate-400
                dark:hover:border-slate-600
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                disabled:cursor-not-allowed
                disabled:bg-slate-100
                dark:disabled:bg-slate-700
              "
            />
          </div>

          {/* ====================================================
              MANAGER DROPDOWN
          ==================================================== */}

          <div className="min-w-0">
            <label className="mb-2 block text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
              Manager{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                name="managerUserId"
                value={group.managerUserId}
                onChange={handleChange}
                disabled={
                  loading ||
                  loadingManagers ||
                  managers.length === 0
                }
                className="
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  px-3
                  py-2.5
                  sm:px-4
                  sm:py-3
                  pr-11
                  text-sm
                  sm:text-base
                  text-slate-800
                  dark:text-slate-100
                  outline-none
                  transition
                  hover:border-slate-400
                  dark:hover:border-slate-600
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-200
                  disabled:cursor-not-allowed
                  disabled:bg-slate-100
                  dark:disabled:bg-slate-700
                "
              >
                <option value="">
                  {managers.length === 0
                    ? "No managers available"
                    : "Select Manager"}
                </option>

                {managers.map((manager) => {
                  const managerId =
                    manager?.id ??
                    manager?.userId;

                  const managerName =
                    manager?.fullName ||
                    manager?.name ||
                    manager?.username ||
                    "Unknown Manager";

                  const username =
                    manager?.username || "";

                  return (
                    <option
                      key={managerId}
                      value={managerId}
                    >
                      {managerName}
                      {username
                        ? ` (${username} - ID: ${managerId})`
                        : ` (ID: ${managerId})`}
                    </option>
                  );
                })}
              </select>

              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  dark:text-slate-500
                "
              />
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Select the manager responsible for this group.
            </p>
          </div>

          {/* ====================================================
              TOTAL MEMBERS
          ==================================================== */}

          <div className="min-w-0">
            <label className="mb-2 block text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
              Total Members
            </label>

            <input
              type="number"
              value={group.totalMembers}
              disabled
              readOnly
              className="
                w-full
                cursor-not-allowed
                rounded-xl
                border
                border-slate-300
                dark:border-slate-700
                bg-slate-100
                dark:bg-slate-700
                px-3
                py-2.5
                sm:px-4
                sm:py-3
                text-slate-500
                dark:text-slate-400
                outline-none
              "
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Automatically calculated from members assigned
              to this group.
            </p>
          </div>

          {/* ====================================================
              STATUS
          ==================================================== */}

          <div className="min-w-0">
            <label className="mb-2 block text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>

            <div className="relative">
              <select
                name="status"
                value={group.status}
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  px-3
                  py-2.5
                  sm:px-4
                  sm:py-3
                  pr-11
                  text-sm
                  sm:text-base
                  text-slate-800
                  dark:text-slate-100
                  outline-none
                  transition
                  hover:border-slate-400
                  dark:hover:border-slate-600
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-200
                  disabled:cursor-not-allowed
                  disabled:bg-slate-100
                  dark:disabled:bg-slate-700
                "
              >
                <option value="ACTIVE">
                  ACTIVE
                </option>

                <option value="INACTIVE">
                  INACTIVE
                </option>
              </select>

              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  dark:text-slate-500
                "
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            BUTTONS
        ====================================================== */}

        <div className="mt-6 sm:mt-8 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-700 pt-5 sm:pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="
              w-full
              sm:w-auto
              rounded-xl
              border
              border-slate-300
              dark:border-slate-700
              bg-white
              dark:bg-slate-800
              px-8
              py-3
              font-semibold
              text-slate-700
              dark:text-slate-200
              transition
              hover:bg-slate-100
              dark:hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isDirty}
            className={`
              w-full
              sm:w-auto
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-8
              py-3
              font-semibold
              text-white
              shadow-md
              transition
              ${
                loading || !isDirty
                  ? "cursor-not-allowed bg-slate-300 dark:bg-slate-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            <Save size={18} />

            {loading
              ? groupId
                ? "Updating..."
                : "Saving..."
              : buttonText}
          </button>
        </div>
      </div>

      {/* ========================================================
          LEAVE WITHOUT SAVE MODAL
      ======================================================== */}

      {showLeaveModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/50
            px-3
            sm:px-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              dark:bg-slate-900
              shadow-2xl
            "
          >
            {/* HEADER */}

            <div className="border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-100
                    dark:bg-amber-900/40
                  "
                >
                  <AlertTriangle
                    size={22}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Leave without saving?
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You have unsaved changes.
                  </p>
                </div>
              </div>
            </div>

            {/* BODY */}

            <div className="p-4 sm:p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                If you go back now, all the changes you made
                will be discarded.
              </p>
            </div>

            {/* BUTTONS */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                rounded-b-2xl
                bg-slate-50
                dark:bg-slate-800
                px-4
                py-4
                sm:flex-row
                sm:justify-end
                sm:px-6
              "
            >
              <button
                type="button"
                onClick={handleStay}
                className="
                  w-full
                  sm:w-auto
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  px-5
                  py-2.5
                  font-medium
                  text-slate-700
                  dark:text-slate-200
                  transition
                  hover:bg-slate-100
                  dark:hover:bg-slate-700
                "
              >
                Stay & Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmLeave}
                className="
                  w-full
                  sm:w-auto
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupForm;