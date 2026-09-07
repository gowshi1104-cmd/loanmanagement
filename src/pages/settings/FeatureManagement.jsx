import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers3,
  Settings2,
} from "lucide-react";

import { toast } from "react-hot-toast";

import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
  updateFeatureStatus,
  getRoleFeatures,
  updateRoleFeature,
} from "../../services/featureService";

import { getRoles } from "../../services/roleService";

import DeleteModal from "../../components/common/DeleteModal";

const FeatureManagement = () => {
  const [features, setFeatures] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleFeatures, setRoleFeatures] = useState([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [updatingGlobal, setUpdatingGlobal] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    featureKey: "",
    featureName: "",
    module: "",
    type: "PAGE",
  });

  // ==================================================
  // LOAD FEATURES
  // ==================================================

  const loadFeatures = async () => {
    try {
      setLoading(true);

      const response = await getFeatures();

      setFeatures(response.data || []);
    } catch (error) {
      console.error("Failed to load features:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load features"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD ROLES
  // ==================================================

  const loadRoles = async () => {
    try {
      const response = await getRoles();

      const roleList = response.data || [];

      setRoles(roleList);

      if (roleList.length > 0) {
        setSelectedRole(roleList[0]);
      }
    } catch (error) {
      console.error("Failed to load roles:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load roles"
      );
    }
  };

  useEffect(() => {
    loadFeatures();
    loadRoles();
  }, []);

  // ==================================================
  // LOAD ROLE FEATURES
  // ==================================================

  const loadRoleFeatures = async (roleId) => {
    if (!roleId) {
      setRoleFeatures([]);
      return;
    }

    try {
      setRoleLoading(true);

      const response = await getRoleFeatures(roleId);

      setRoleFeatures(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load role features:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load role features"
      );
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole?.id) {
      loadRoleFeatures(selectedRole.id);
    } else {
      setRoleFeatures([]);
    }
  }, [selectedRole]);

  // ==================================================
  // MODULES
  // ==================================================

  const modules = useMemo(() => {
    const moduleSet = new Set();

    features.forEach((feature) => {
      if (feature.module) {
        moduleSet.add(feature.module);
      }
    });

    return Array.from(moduleSet).sort();
  }, [features]);

  // ==================================================
  // FILTER
  // ==================================================

  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        feature.featureName
          ?.toLowerCase()
          .includes(searchText) ||
        feature.featureKey
          ?.toLowerCase()
          .includes(searchText) ||
        feature.module
          ?.toLowerCase()
          .includes(searchText);

      const matchesModule =
        moduleFilter === "ALL" ||
        feature.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [features, search, moduleFilter]);

  // ==================================================
  // GROUP FEATURES BY MODULE
  // ==================================================

  const groupedFeatures = useMemo(() => {
    const grouped = {};

    filteredFeatures.forEach((feature) => {
      const moduleName = feature.module || "Other";

      if (!grouped[moduleName]) {
        grouped[moduleName] = [];
      }

      grouped[moduleName].push(feature);
    });

    return grouped;
  }, [filteredFeatures]);

  // ==================================================
  // ROLE FEATURE
  // ==================================================

  const getRoleFeature = (featureId) => {
    return roleFeatures.find(
      (item) => item.feature?.id === featureId
    );
  };

  const isRoleFeatureEnabled = (feature) => {
    const roleName = String(
      selectedRole?.roleName || ""
    )
      .trim()
      .toUpperCase();

    // ADMIN does not depend on role_features.
    // Admin access is controlled only by global feature state.

    if (roleName === "ADMIN") {
      return feature.enabled === true;
    }

    const mapping = getRoleFeature(feature.id);

    return mapping?.enabled === true;
  };

  // ==================================================
  // ADD FEATURE
  // ==================================================

  const openAddModal = () => {
    setEditingFeature(null);

    setFormData({
      featureKey: "",
      featureName: "",
      module: "",
      type: "PAGE",
    });

    setShowModal(true);
  };

  // ==================================================
  // EDIT FEATURE
  // ==================================================

  const openEditModal = (feature) => {
    setEditingFeature(feature);

    setFormData({
      featureKey: feature.featureKey || "",
      featureName: feature.featureName || "",
      module: feature.module || "",
      type: feature.type || "PAGE",
    });

    setShowModal(true);
  };

  // ==================================================
  // INPUT CHANGE
  // ==================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================================================
  // SAVE FEATURE
  // ==================================================

  const handleSaveFeature = async (e) => {
    e.preventDefault();

    if (!formData.featureKey.trim()) {
      toast.error("Feature key is required");
      return;
    }

    if (!formData.featureName.trim()) {
      toast.error("Feature name is required");
      return;
    }

    if (!formData.module.trim()) {
      toast.error("Module is required");
      return;
    }

    try {
      const payload = {
        featureKey: formData.featureKey
          .trim()
          .toUpperCase(),

        featureName: formData.featureName.trim(),

        module: formData.module.trim(),

        type: formData.type
          .trim()
          .toUpperCase(),
      };

      if (editingFeature) {
        await updateFeature(
          editingFeature.id,
          payload
        );

        toast.success(
          "Feature updated successfully"
        );
      } else {
        await createFeature({
          ...payload,
          enabled: true,
        });

        toast.success(
          "Feature created successfully"
        );
      }

      setShowModal(false);
      setEditingFeature(null);

      await loadFeatures();
    } catch (error) {
      console.error(
        "Feature save error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to save feature"
      );
    }
  };

  // ==================================================
  // GLOBAL TOGGLE
  // ==================================================

  const handleGlobalToggle = async (feature) => {
    if (!feature?.id) {
      return;
    }

    if (updatingGlobal === feature.id) {
      return;
    }

    const previousStatus = feature.enabled === true;
    const newStatus = !previousStatus;

    try {
      setUpdatingGlobal(feature.id);

      // Optimistic UI update

      setFeatures((prev) =>
        prev.map((item) =>
          item.id === feature.id
            ? {
                ...item,
                enabled: newStatus,
              }
            : item
        )
      );

      // Update global feature status

      await updateFeatureStatus(
        feature.id,
        newStatus
      );

      toast.success(
        newStatus
          ? `${feature.featureName} enabled globally`
          : `${feature.featureName} disabled globally`
      );

      // Get authoritative state from backend

      const response = await getFeatures();

      setFeatures(response.data || []);

      /**
       * IMPORTANT:
       *
       * Global OFF does NOT change role_features.
       *
       * Example:
       *
       * GLOBAL = OFF
       * MANAGER = ON
       * STAFF   = ON
       *
       * Still nobody except ADMIN can access.
       *
       * When GLOBAL becomes ON again:
       *
       * MANAGER = ON  -> Manager gets access
       * STAFF   = ON  -> Staff gets access
       * STAFF   = OFF -> Staff remains blocked
       *
       * Therefore we intentionally do not modify
       * roleFeatures here.
       */

      if (selectedRole?.id) {
        await loadRoleFeatures(
          selectedRole.id
        );
      }
    } catch (error) {
      console.error(
        "Global feature toggle error:",
        error
      );

      // Revert optimistic update

      setFeatures((prev) =>
        prev.map((item) =>
          item.id === feature.id
            ? {
                ...item,
                enabled: previousStatus,
              }
            : item
        )
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update feature status"
      );
    } finally {
      setUpdatingGlobal(null);
    }
  };

  // ==================================================
  // ROLE TOGGLE
  // ==================================================

  const handleRoleToggle = async (feature) => {
    if (!selectedRole?.id) {
      toast.error("Please select a role");
      return;
    }

    const roleName = String(
      selectedRole.roleName || ""
    )
      .trim()
      .toUpperCase();

    // Admin is always controlled by global feature.

    if (roleName === "ADMIN") {
      return;
    }

    /**
     * Global feature OFF means role cannot access it.
     * Do not allow role toggle while globally disabled.
     */

    if (feature.enabled !== true) {
      toast.error(
        "Enable the feature globally first"
      );

      return;
    }

    const currentState =
      isRoleFeatureEnabled(feature);

    const newState = !currentState;

    const updateKey = `${selectedRole.id}-${feature.id}`;

    if (updatingRole === updateKey) {
      return;
    }

    try {
      setUpdatingRole(updateKey);

      /**
       * Optimistic update.
       *
       * If role_features mapping already exists,
       * update that mapping.
       *
       * If it does not exist, create a temporary
       * frontend mapping until backend returns
       * the actual mapping.
       */

      setRoleFeatures((prev) => {
        const existing = prev.find(
          (item) =>
            item.feature?.id === feature.id
        );

        if (existing) {
          return prev.map((item) =>
            item.feature?.id === feature.id
              ? {
                  ...item,
                  enabled: newState,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            id: `temp-${selectedRole.id}-${feature.id}`,
            enabled: newState,
            feature,
            role: selectedRole,
          },
        ];
      });

      /**
       * Backend is the final source of truth.
       *
       * This endpoint must update/create the
       * role_features mapping for this role + feature.
       */

      await updateRoleFeature(
        selectedRole.id,
        feature.id,
        newState
      );

      toast.success(
        newState
          ? `${feature.featureName} enabled for ${selectedRole.roleName}`
          : `${feature.featureName} disabled for ${selectedRole.roleName}`
      );

      // Reload actual role-feature state

      await loadRoleFeatures(
        selectedRole.id
      );
    } catch (error) {
      console.error(
        "Role feature toggle error:",
        error
      );

      /**
       * Backend failed, so reload from backend
       * and remove any optimistic state.
       */

      await loadRoleFeatures(
        selectedRole.id
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update role feature"
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  // ==================================================
  // DELETE
  // ==================================================

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteFeature(
        deleteTarget.id
      );

      toast.success(
        "Feature deleted successfully"
      );

      setDeleteTarget(null);

      await loadFeatures();

      if (selectedRole?.id) {
        await loadRoleFeatures(
          selectedRole.id
        );
      }
    } catch (error) {
      console.error(
        "Feature delete error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete feature"
      );
    }
  };

  // ==================================================
  // TOGGLE COMPONENT
  // ==================================================

  const Toggle = ({
    checked,
    disabled,
    loading,
    onClick,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked
            ? "bg-blue-600"
            : "bg-slate-300 dark:bg-slate-600"
        } ${
          disabled || loading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked
              ? "translate-x-5"
              : "translate-x-0.5"
          }`}
        />

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-5 lg:space-y-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 break-words">
            Feature Management
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Manage application features and
            control feature access by role.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow"
        >
          <Plus size={18} />
          Add Feature
        </button>
      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search features..."
              className="w-full min-w-0 pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(e.target.value)
            }
            className="w-full md:w-56 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">
              All Modules
            </option>

            {modules.map((module) => (
              <option
                key={module}
                value={module}
              >
                {module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==================================================
          ROLE SELECTION
      ================================================== */}

      <div className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-start sm:items-center gap-3 mb-4">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
            <Settings2
              size={20}
              className="text-blue-600 dark:text-blue-300"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Role Feature Access
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Select a role to control its
              feature access.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {roles.map((role) => {
            const active =
              selectedRole?.id === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() =>
                  setSelectedRole(role)
                }
                className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold border transition text-sm sm:text-base ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {role.roleName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          FEATURES
      ================================================== */}

      {loading ? (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-10 text-center text-slate-500 dark:text-slate-400">
          Loading features...
        </div>
      ) : Object.keys(groupedFeatures).length === 0 ? (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-10 text-center">
          <Layers3
            size={40}
            className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
          />

          <p className="text-slate-500 dark:text-slate-400">
            No features found.
          </p>
        </div>
      ) : (
        <div className="w-full min-w-0 space-y-5 sm:space-y-6">
          {Object.entries(
            groupedFeatures
          ).map(
            ([moduleName, moduleFeatures]) => (
              <div
                key={moduleName}
                className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* MODULE HEADER */}

                <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                    <Layers3
                      size={20}
                      className="text-blue-600 dark:text-blue-300"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {moduleName}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {moduleFeatures.length}{" "}
                      feature
                      {moduleFeatures.length !==
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                </div>

                {/* TABLE */}

                <div className="w-full overflow-x-auto overscroll-x-contain">
                  <table className="w-full min-w-[760px] sm:min-w-[850px]">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <th className="px-3 sm:px-5 py-3 font-semibold">
                          Feature
                        </th>

                        <th className="px-3 sm:px-5 py-3 font-semibold">
                          Key
                        </th>

                        <th className="px-3 sm:px-5 py-3 font-semibold">
                          Type
                        </th>

                        <th className="px-3 sm:px-5 py-3 font-semibold text-center">
                          Global
                        </th>

                        <th className="px-3 sm:px-5 py-3 font-semibold text-center">
                          {selectedRole?.roleName ||
                            "Role"}
                        </th>

                        <th className="px-3 sm:px-5 py-3 font-semibold text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {moduleFeatures.map(
                        (feature) => {
                          const roleEnabled =
                            isRoleFeatureEnabled(
                              feature
                            );

                          const isAdmin =
                            String(
                              selectedRole?.roleName ||
                                ""
                            )
                              .trim()
                              .toUpperCase() ===
                            "ADMIN";

                          const globalUpdating =
                            updatingGlobal ===
                            feature.id;

                          const roleUpdating =
                            updatingRole ===
                            `${selectedRole?.id}-${feature.id}`;

                          return (
                            <tr
                              key={feature.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                              {/* FEATURE */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <div className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 max-w-[220px] break-words">
                                  {
                                    feature.featureName
                                  }
                                </div>
                              </td>

                              {/* KEY */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <code className="inline-block max-w-[220px] text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md break-all">
                                  {
                                    feature.featureKey
                                  }
                                </code>
                              </td>

                              {/* TYPE */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {feature.type}
                                </span>
                              </td>

                              {/* GLOBAL TOGGLE */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <div className="flex justify-center items-center gap-2 sm:gap-3">
                                  <Toggle
                                    checked={
                                      feature.enabled ===
                                      true
                                    }
                                    loading={
                                      globalUpdating
                                    }
                                    onClick={() =>
                                      handleGlobalToggle(
                                        feature
                                      )
                                    }
                                  />

                                  <span
                                    className={`text-xs font-semibold w-16 ${
                                      feature.enabled
                                        ? "text-green-600 dark:text-emerald-300"
                                        : "text-slate-500 dark:text-slate-400"
                                    }`}
                                  >
                                    {feature.enabled
                                      ? "Enabled"
                                      : "Disabled"}
                                  </span>
                                </div>
                              </td>

                              {/* ROLE TOGGLE */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <div className="flex justify-center items-center gap-2 sm:gap-3">
                                  {isAdmin ? (
                                    <span
                                      className={`text-xs font-semibold whitespace-nowrap ${
                                        feature.enabled
                                          ? "text-green-600 dark:text-emerald-300"
                                          : "text-slate-400 dark:text-slate-500"
                                      }`}
                                    >
                                      {feature.enabled
                                        ? "Always Enabled"
                                        : "Globally Disabled"}
                                    </span>
                                  ) : (
                                    <>
                                      <Toggle
                                        checked={
                                          roleEnabled
                                        }
                                        disabled={
                                          !feature.enabled ||
                                          roleLoading
                                        }
                                        loading={
                                          roleUpdating
                                        }
                                        onClick={() =>
                                          handleRoleToggle(
                                            feature
                                          )
                                        }
                                      />

                                      <span
                                        className={`text-xs font-semibold w-16 ${
                                          !feature.enabled
                                            ? "text-slate-400 dark:text-slate-500"
                                            : roleEnabled
                                            ? "text-green-600 dark:text-emerald-300"
                                            : "text-slate-500 dark:text-slate-400"
                                        }`}
                                      >
                                        {!feature.enabled
                                          ? "Blocked"
                                          : roleEnabled
                                          ? "Enabled"
                                          : "Disabled"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>

                              {/* ACTIONS */}

                              <td className="px-3 sm:px-5 py-3.5 sm:py-4">
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditModal(
                                        feature
                                      )
                                    }
                                    className="p-2 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    title="Edit"
                                  >
                                    <Pencil
                                      size={17}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget(
                                        feature
                                      )
                                    }
                                    className="p-2 rounded-lg text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    title="Delete"
                                  >
                                    <Trash2
                                      size={17}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg max-h-[94vh] sm:max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingFeature
                  ? "Edit Feature"
                  : "Add Feature"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Configure application feature
                details.
              </p>
            </div>

            <form
              onSubmit={handleSaveFeature}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              {/* FEATURE KEY */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Feature Key
                </label>

                <input
                  type="text"
                  name="featureKey"
                  value={formData.featureKey}
                  onChange={handleInputChange}
                  placeholder="Example: ADD_CUSTOMER"
                  className="w-full px-3 sm:px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* FEATURE NAME */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Feature Name
                </label>

                <input
                  type="text"
                  name="featureName"
                  value={formData.featureName}
                  onChange={handleInputChange}
                  placeholder="Example: Add Customer"
                  className="w-full px-3 sm:px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* MODULE */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Module
                </label>

                <input
                  type="text"
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  placeholder="Example: Customers"
                  className="w-full px-3 sm:px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TYPE */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Feature Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PAGE">
                    Page
                  </option>

                  <option value="BUTTON">
                    Button
                  </option>

                  <option value="ACTION">
                    Action
                  </option>

                  <option value="SECTION">
                    Section
                  </option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {editingFeature
                    ? "Update Feature"
                    : "Create Feature"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE MODAL
      ================================================== */}

      {deleteTarget && (
        <DeleteModal
          itemName={
            deleteTarget.featureName
          }
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default FeatureManagement;