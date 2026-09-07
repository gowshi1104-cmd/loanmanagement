import api from "./api";

// =========================================================
// GET ALL FEATURES
// =========================================================

export const getFeatures = () => {
  return api.get("/features");
};

// =========================================================
// GET FEATURE BY ID
// =========================================================

export const getFeatureById = (id) => {
  return api.get(`/features/${id}`);
};

// =========================================================
// CREATE FEATURE
// =========================================================

export const createFeature = (feature) => {
  return api.post("/features", feature);
};

// =========================================================
// UPDATE FEATURE
// =========================================================

export const updateFeature = (id, feature) => {
  return api.put(`/features/${id}`, feature);
};

// =========================================================
// DELETE FEATURE
// =========================================================

export const deleteFeature = (id) => {
  return api.delete(`/features/${id}`);
};

// =========================================================
// UPDATE GLOBAL FEATURE STATUS
// =========================================================

export const updateFeatureStatus = (
  id,
  enabled
) => {
  return api.patch(
    `/features/${id}/status`,
    null,
    {
      params: {
        enabled,
      },
    }
  );
};

// =========================================================
// GET ROLE FEATURES
// =========================================================

export const getRoleFeatures = (roleId) => {
  return api.get(
    `/features/role/${roleId}`
  );
};

// =========================================================
// UPDATE ROLE FEATURE
// =========================================================

export const updateRoleFeature = (
  roleId,
  featureId,
  enabled
) => {
  return api.patch(
    `/features/role/${roleId}/feature/${featureId}`,
    null,
    {
      params: {
        enabled,
      },
    }
  );
};

// =========================================================
// GET CURRENT USER FEATURES
// =========================================================

export const getMyFeatures = () => {
  return api.get(
    "/features/my-features"
  );
};

// =========================================================
// CHECK FEATURE ACCESS
// =========================================================

export const checkFeatureAccess = (
  featureKey
) => {
  return api.get(
    `/features/check/${featureKey}`
  );
};