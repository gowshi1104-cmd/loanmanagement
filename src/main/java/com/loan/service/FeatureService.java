package com.loan.service;

import com.loan.entity.Feature;
import com.loan.entity.RoleFeature;

import java.util.List;

public interface FeatureService {

    // =========================================================
    // GET ALL FEATURES
    // =========================================================

    List<Feature> getAllFeatures();

    // =========================================================
    // GET FEATURE BY ID
    // =========================================================

    Feature getFeatureById(Long id);

    // =========================================================
    // CREATE FEATURE
    // =========================================================

    Feature createFeature(Feature feature);

    // =========================================================
    // UPDATE FEATURE
    // =========================================================

    Feature updateFeature(Long id, Feature feature);

    // =========================================================
    // DELETE FEATURE
    // =========================================================

    void deleteFeature(Long id);

    // =========================================================
    // UPDATE GLOBAL FEATURE STATUS
    // =========================================================

    Feature updateFeatureStatus(
            Long id,
            boolean enabled
    );

    // =========================================================
    // GET ROLE FEATURES
    // =========================================================

    List<RoleFeature> getRoleFeatures(Long roleId);

    // =========================================================
    // UPDATE ROLE FEATURE
    // =========================================================

    RoleFeature updateRoleFeature(
            Long roleId,
            Long featureId,
            boolean enabled
    );

    // =========================================================
    // GET FEATURES FOR CURRENT USER ROLE
    // =========================================================

    List<Feature> getCurrentUserFeatures();

    // =========================================================
    // CHECK FEATURE ACCESS
    // =========================================================

    boolean isFeatureEnabledForCurrentUser(
            String featureKey
    );
}