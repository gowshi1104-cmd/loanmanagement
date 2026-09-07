package com.loan.service.impl;

import com.loan.entity.Feature;
import com.loan.entity.Role;
import com.loan.entity.RoleFeature;
import com.loan.entity.User;
import com.loan.repository.FeatureRepository;
import com.loan.repository.RoleFeatureRepository;
import com.loan.repository.RoleRepository;
import com.loan.repository.UserRepository;
import com.loan.service.FeatureService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FeatureServiceImpl implements FeatureService {

    private final FeatureRepository featureRepository;
    private final RoleFeatureRepository roleFeatureRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public FeatureServiceImpl(
            FeatureRepository featureRepository,
            RoleFeatureRepository roleFeatureRepository,
            RoleRepository roleRepository,
            UserRepository userRepository
    ) {
        this.featureRepository = featureRepository;
        this.roleFeatureRepository = roleFeatureRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET CURRENT LOGGED-IN USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String username = authentication.getName();

        if (username == null ||
                username.trim().isEmpty()) {

            throw new RuntimeException(
                    "Unable to identify current user"
            );
        }

        return userRepository
                .findByUsername(username)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Current user not found"
                        )
                );
    }

    // =========================================================
    // CHECK ADMIN
    // =========================================================

    private boolean isAdmin(User user) {

        return user != null &&
                user.getRole() != null &&
                "ADMIN".equalsIgnoreCase(
                        user.getRole().getRoleName()
                );
    }

    // =========================================================
    // GET ROLE
    // =========================================================

    private Role getRole(Long roleId) {

        if (roleId == null) {

            throw new RuntimeException(
                    "Role ID is required"
            );
        }

        return roleRepository
                .findById(roleId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Role not found"
                        )
                );
    }

    // =========================================================
    // GET ALL FEATURES
    // =========================================================

    @Override
    public List<Feature> getAllFeatures() {

        return featureRepository
                .findAll()
                .stream()
                .sorted(
                        (a, b) -> {

                            int moduleCompare =
                                    a.getModule()
                                            .compareToIgnoreCase(
                                                    b.getModule()
                                            );

                            if (moduleCompare != 0) {
                                return moduleCompare;
                            }

                            return a.getFeatureName()
                                    .compareToIgnoreCase(
                                            b.getFeatureName()
                                    );
                        }
                )
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FEATURE BY ID
    // =========================================================

    @Override
    public Feature getFeatureById(Long id) {

        return featureRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Feature not found"
                        )
                );
    }

    // =========================================================
    // CREATE FEATURE
    // =========================================================

    @Override
    public Feature createFeature(Feature feature) {

        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser)) {

            throw new RuntimeException(
                    "Only ADMIN can create features."
            );
        }

        if (feature == null) {

            throw new RuntimeException(
                    "Feature cannot be null"
            );
        }

        // =====================================================
        // FEATURE KEY
        // =====================================================

        if (feature.getFeatureKey() == null ||
                feature.getFeatureKey().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature key is required"
            );
        }

        String featureKey =
                feature.getFeatureKey()
                        .trim()
                        .toUpperCase();

        // =====================================================
        // FEATURE NAME
        // =====================================================

        if (feature.getFeatureName() == null ||
                feature.getFeatureName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature name is required"
            );
        }

        // =====================================================
        // MODULE
        // =====================================================

        if (feature.getModule() == null ||
                feature.getModule().trim().isEmpty()) {

            throw new RuntimeException(
                    "Module is required"
            );
        }

        // =====================================================
        // TYPE
        // =====================================================

        if (feature.getType() == null ||
                feature.getType().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature type is required"
            );
        }

        // =====================================================
        // DUPLICATE FEATURE KEY
        // =====================================================

        if (featureRepository.existsByFeatureKey(
                featureKey
        )) {

            throw new RuntimeException(
                    "Feature already exists"
            );
        }

        feature.setFeatureKey(featureKey);

        feature.setFeatureName(
                feature.getFeatureName().trim()
        );

        feature.setModule(
                feature.getModule().trim()
        );

        feature.setType(
                feature.getType().trim().toUpperCase()
        );

        // =====================================================
        // DEFAULT STATUS
        // =====================================================

        if (feature.getEnabled() == null) {

            feature.setEnabled(true);
        }

        return featureRepository.save(feature);
    }

    // =========================================================
    // UPDATE FEATURE
    // =========================================================

    @Override
    public Feature updateFeature(
            Long id,
            Feature feature
    ) {

        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser)) {

            throw new RuntimeException(
                    "Only ADMIN can update features."
            );
        }

        if (feature == null) {

            throw new RuntimeException(
                    "Feature cannot be null"
            );
        }

        Feature existingFeature =
                getFeatureById(id);

        // =====================================================
        // FEATURE KEY
        // =====================================================

        if (feature.getFeatureKey() == null ||
                feature.getFeatureKey().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature key is required"
            );
        }

        String requestedFeatureKey =
                feature.getFeatureKey()
                        .trim()
                        .toUpperCase();

        // =====================================================
        // DUPLICATE FEATURE KEY
        // =====================================================

        if (!existingFeature
                .getFeatureKey()
                .equalsIgnoreCase(
                        requestedFeatureKey
                ) &&
                featureRepository.existsByFeatureKey(
                        requestedFeatureKey
                )) {

            throw new RuntimeException(
                    "Feature already exists"
            );
        }

        // =====================================================
        // FEATURE NAME
        // =====================================================

        if (feature.getFeatureName() == null ||
                feature.getFeatureName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature name is required"
            );
        }

        // =====================================================
        // MODULE
        // =====================================================

        if (feature.getModule() == null ||
                feature.getModule().trim().isEmpty()) {

            throw new RuntimeException(
                    "Module is required"
            );
        }

        // =====================================================
        // TYPE
        // =====================================================

        if (feature.getType() == null ||
                feature.getType().trim().isEmpty()) {

            throw new RuntimeException(
                    "Feature type is required"
            );
        }

        existingFeature.setFeatureKey(
                requestedFeatureKey
        );

        existingFeature.setFeatureName(
                feature.getFeatureName().trim()
        );

        existingFeature.setModule(
                feature.getModule().trim()
        );

        existingFeature.setType(
                feature.getType().trim().toUpperCase()
        );

        if (feature.getEnabled() != null) {

            existingFeature.setEnabled(
                    feature.getEnabled()
            );
        }

        return featureRepository.save(
                existingFeature
        );
    }

    // =========================================================
    // DELETE FEATURE
    // =========================================================

    @Override
    public void deleteFeature(Long id) {

        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser)) {

            throw new RuntimeException(
                    "Only ADMIN can delete features."
            );
        }

        Feature feature =
                getFeatureById(id);

        // =====================================================
        // REMOVE ROLE FEATURE MAPPINGS FIRST
        // =====================================================

        List<RoleFeature> roleFeatures =
                roleFeatureRepository
                        .findByFeatureId(id);

        if (!roleFeatures.isEmpty()) {

            roleFeatureRepository.deleteAll(
                    roleFeatures
            );
        }

        featureRepository.delete(feature);
    }

    // =========================================================
    // UPDATE GLOBAL FEATURE STATUS
    // =========================================================

    @Override
    public Feature updateFeatureStatus(
            Long id,
            boolean enabled
    ) {

        User currentUser = getCurrentUser();

        if (!isAdmin(currentUser)) {

            throw new RuntimeException(
                    "Only ADMIN can change feature status."
            );
        }

        Feature feature =
                getFeatureById(id);

        feature.setEnabled(enabled);

        return featureRepository.save(feature);
    }

    // =========================================================
    // GET ROLE FEATURES
    // =========================================================

    @Override
    public List<RoleFeature> getRoleFeatures(
            Long roleId
    ) {

        User currentUser = getCurrentUser();

        // =====================================================
        // ADMIN CAN VIEW ANY ROLE
        // =====================================================

        if (isAdmin(currentUser)) {

            getRole(roleId);

            return roleFeatureRepository
                    .findByRoleId(roleId);
        }

        // =====================================================
        // NON ADMIN
        //
        // They can only view their own role's features.
        // =====================================================

        if (currentUser.getRole() == null ||
                currentUser.getRole().getId() == null) {

            throw new RuntimeException(
                    "Current user role not found"
            );
        }

        Long currentRoleId =
                currentUser
                        .getRole()
                        .getId();

        if (!currentRoleId.equals(roleId)) {

            throw new RuntimeException(
                    "You do not have permission to view this role's features."
            );
        }

        return roleFeatureRepository
                .findByRoleId(roleId);
    }

    // =========================================================
    // UPDATE ROLE FEATURE
    // =========================================================

    @Override
    public RoleFeature updateRoleFeature(
            Long roleId,
            Long featureId,
            boolean enabled
    ) {

        User currentUser = getCurrentUser();

        // =====================================================
        // ONLY ADMIN CAN MANAGE ROLE FEATURES
        // =====================================================

        if (!isAdmin(currentUser)) {

            throw new RuntimeException(
                    "Only ADMIN can manage role features."
            );
        }

        Role role =
                getRole(roleId);

        Feature feature =
                getFeatureById(featureId);

        // =====================================================
        // GLOBAL FEATURE MUST BE ENABLED
        // =====================================================

        if (!Boolean.TRUE.equals(
                feature.getEnabled()
        ) && enabled) {

            throw new RuntimeException(
                    "This feature is globally disabled. "
                            + "Enable the feature first."
            );
        }

        RoleFeature roleFeature =
                roleFeatureRepository
                        .findByRoleIdAndFeatureId(
                                roleId,
                                featureId
                        )
                        .orElse(null);

        // =====================================================
        // CREATE ROLE FEATURE MAPPING
        // =====================================================

        if (roleFeature == null) {

            roleFeature =
                    new RoleFeature();

            roleFeature.setRole(role);

            roleFeature.setFeature(feature);
        }

        roleFeature.setEnabled(enabled);

        return roleFeatureRepository.save(
                roleFeature
        );
    }

    // =========================================================
    // GET FEATURES FOR CURRENT USER ROLE
    // =========================================================

    @Override
    public List<Feature> getCurrentUserFeatures() {

        User currentUser =
                getCurrentUser();

        // =====================================================
        // ROLE REQUIRED
        // =====================================================

        if (currentUser.getRole() == null ||
                currentUser.getRole().getId() == null) {

            return List.of();
        }

        // =====================================================
        // ADMIN
        //
        // ADMIN gets all globally enabled features.
        // =====================================================

        if (isAdmin(currentUser)) {

            return featureRepository
                    .findAll()
                    .stream()
                    .filter(
                            feature ->
                                    Boolean.TRUE.equals(
                                            feature.getEnabled()
                                    )
                    )
                    .sorted(
                            (a, b) ->
                                    a.getFeatureName()
                                            .compareToIgnoreCase(
                                                    b.getFeatureName()
                                            )
                    )
                    .collect(
                            Collectors.toList()
                    );
        }

        // =====================================================
        // ROLE FEATURES
        // =====================================================

        List<RoleFeature> roleFeatures =
                roleFeatureRepository
                        .findByRoleId(
                                currentUser
                                        .getRole()
                                        .getId()
                        );

        return roleFeatures
                .stream()
                .filter(
                        roleFeature ->
                                Boolean.TRUE.equals(
                                        roleFeature.getEnabled()
                                )
                )
                .map(RoleFeature::getFeature)
                .filter(
                        feature ->
                                feature != null &&
                                Boolean.TRUE.equals(
                                        feature.getEnabled()
                                )
                )
                .sorted(
                        (a, b) ->
                                a.getFeatureName()
                                        .compareToIgnoreCase(
                                                b.getFeatureName()
                                        )
                )
                .collect(
                        Collectors.toList()
                );
    }

    // =========================================================
    // CHECK FEATURE ACCESS
    // =========================================================

    @Override
    public boolean isFeatureEnabledForCurrentUser(
            String featureKey
    ) {

        if (featureKey == null ||
                featureKey.trim().isEmpty()) {

            return false;
        }

        User currentUser =
                getCurrentUser();

        // =====================================================
        // FIND FEATURE
        // =====================================================

        Feature feature =
                featureRepository
                        .findByFeatureKey(
                                featureKey.trim().toUpperCase()
                        )
                        .orElse(null);

        if (feature == null) {

            return false;
        }

        // =====================================================
        // GLOBAL FEATURE CHECK
        // =====================================================

        if (!Boolean.TRUE.equals(
                feature.getEnabled()
        )) {

            return false;
        }

        // =====================================================
        // ADMIN
        //
        // Admin can access every globally enabled feature.
        // =====================================================

        if (isAdmin(currentUser)) {

            return true;
        }

        // =====================================================
        // ROLE CHECK
        // =====================================================

        if (currentUser.getRole() == null ||
                currentUser.getRole().getId() == null) {

            return false;
        }

        RoleFeature roleFeature =
                roleFeatureRepository
                        .findByRoleIdAndFeatureId(
                                currentUser
                                        .getRole()
                                        .getId(),
                                feature.getId()
                        )
                        .orElse(null);

        if (roleFeature == null) {

            return false;
        }

        return Boolean.TRUE.equals(
                roleFeature.getEnabled()
        );
    }
}