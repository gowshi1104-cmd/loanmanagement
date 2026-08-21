package com.loan.service.impl;

import com.loan.dto.RoleRequest;
import com.loan.entity.Permission;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.PermissionRepository;
import com.loan.repository.RoleRepository;
import com.loan.repository.UserRepository;
import com.loan.service.RoleService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RoleServiceImpl(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository) {

        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET ALL ROLES
    // =========================================================

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @Override
    public Role getRoleById(Long id) {

        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));
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
                .orElseThrow(() ->
                        new RuntimeException(
                                "Current user not found"
                        ));
    }

    // =========================================================
    // CHECK ADMIN
    // =========================================================

    private boolean isCurrentUserAdmin() {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == null) {
            return false;
        }

        return "ADMIN".equalsIgnoreCase(
                currentUser
                        .getRole()
                        .getRoleName()
        );
    }

    // =========================================================
    // GET CURRENT USER PERMISSIONS
    // =========================================================

    private Set<Permission> getCurrentUserPermissions() {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == null ||
                currentUser.getRole().getPermissions() == null) {

            return new HashSet<>();
        }

        return new HashSet<>(
                currentUser
                        .getRole()
                        .getPermissions()
        );
    }

    // =========================================================
    // AVAILABLE PERMISSIONS
    // =========================================================

    @Override
    public List<Permission> getAvailablePermissions() {

        /*
         * ADMIN
         * -----
         * Admin can see and assign every permission.
         */

        if (isCurrentUserAdmin()) {

            return permissionRepository.findAll()
                    .stream()
                    .sorted(
                            (a, b) ->
                                    a.getPermissionName()
                                            .compareToIgnoreCase(
                                                    b.getPermissionName()
                                            )
                    )
                    .collect(Collectors.toList());
        }

        /*
         * MANAGER / STAFF / OTHER
         * ----------------------
         * They can only see permissions
         * that they currently possess.
         */

        return getCurrentUserPermissions()
                .stream()
                .sorted(
                        (a, b) ->
                                a.getPermissionName()
                                        .compareToIgnoreCase(
                                                b.getPermissionName()
                                        )
                )
                .collect(Collectors.toList());
    }

    // =========================================================
    // CREATE ROLE
    // =========================================================

    @Override
    public Role createRole(RoleRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Role request cannot be null"
            );
        }

        if (request.getRoleName() == null ||
                request.getRoleName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Role name is required"
            );
        }

        String requestedRoleName =
                request.getRoleName().trim();

        // =====================================================
        // DUPLICATE ROLE
        // =====================================================

        if (roleRepository.existsByRoleName(
                requestedRoleName)) {

            throw new RuntimeException(
                    "Role already exists"
            );
        }

        // =====================================================
        // CURRENT USER
        // =====================================================

        User currentUser = getCurrentUser();

        boolean currentUserIsAdmin =
                isCurrentUserAdmin();

        // =====================================================
        // NON-ADMIN CANNOT CREATE ADMIN
        // =====================================================

        if (!currentUserIsAdmin &&
                "ADMIN".equalsIgnoreCase(
                        requestedRoleName)) {

            throw new RuntimeException(
                    "Only ADMIN can create the ADMIN role."
            );
        }

        // =====================================================
        // CREATE ROLE
        // =====================================================

        Role role = new Role();

        role.setRoleName(requestedRoleName);

        role.setDescription(
                request.getDescription()
        );

        role.setStatus(
                request.getStatus() == null ||
                        request.getStatus().trim().isEmpty()
                        ? "ACTIVE"
                        : request.getStatus()
        );

        Set<Permission> permissions =
                new HashSet<>();

        // =====================================================
        // ADMIN ROLE
        // =====================================================

        if ("ADMIN".equalsIgnoreCase(
                requestedRoleName)) {

            /*
             * ADMIN role ALWAYS gets ALL permissions.
             */

            if (!currentUserIsAdmin) {

                throw new RuntimeException(
                        "Only ADMIN can create the ADMIN role."
                );
            }

            permissions.addAll(
                    permissionRepository.findAll()
            );

        } else {

            // =================================================
            // REQUESTED PERMISSIONS
            // =================================================

            Set<Long> requestedPermissionIds =
                    request.getPermissionIds() == null
                            ? new HashSet<>()
                            : new HashSet<>(
                                    request.getPermissionIds()
                            );

            // =================================================
            // ALLOWED PERMISSIONS
            // =================================================

            Set<Permission> allowedPermissions;

            if (currentUserIsAdmin) {

                allowedPermissions =
                        new HashSet<>(
                                permissionRepository.findAll()
                        );

            } else {

                allowedPermissions =
                        getCurrentUserPermissions();
            }

            Set<Long> allowedPermissionIds =
                    allowedPermissions
                            .stream()
                            .map(Permission::getId)
                            .collect(Collectors.toSet());

            // =================================================
            // SECURITY CHECK
            // =================================================

            boolean hasUnauthorizedPermission =
                    requestedPermissionIds
                            .stream()
                            .anyMatch(
                                    permissionId ->
                                            !allowedPermissionIds
                                                    .contains(
                                                            permissionId
                                                    )
                            );

            if (hasUnauthorizedPermission) {

                throw new RuntimeException(
                        "You can only assign permissions that you currently have."
                );
            }

            // =================================================
            // LOAD PERMISSIONS
            // =================================================

            if (!requestedPermissionIds.isEmpty()) {

                permissions.addAll(
                        permissionRepository.findAllById(
                                requestedPermissionIds
                        )
                );
            }
        }

        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @Override
    public Role updateRole(
            Long id,
            RoleRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Role request cannot be null"
            );
        }

        Role role = getRoleById(id);

        User currentUser = getCurrentUser();

        boolean currentUserIsAdmin =
                isCurrentUserAdmin();

        String existingRoleName =
                role.getRoleName();

        String requestedRoleName =
                request.getRoleName() == null
                        ? ""
                        : request
                                .getRoleName()
                                .trim();

        if (requestedRoleName.isEmpty()) {

            throw new RuntimeException(
                    "Role name is required"
            );
        }

        // =====================================================
        // ADMIN ROLE PROTECTION
        // =====================================================

        if ("ADMIN".equalsIgnoreCase(
                existingRoleName)) {

            if (!currentUserIsAdmin) {

                throw new RuntimeException(
                        "Only ADMIN can update the ADMIN role."
                );
            }
        }

        // =====================================================
        // NON-ADMIN CANNOT RENAME TO ADMIN
        // =====================================================

        if (!currentUserIsAdmin &&
                "ADMIN".equalsIgnoreCase(
                        requestedRoleName)) {

            throw new RuntimeException(
                    "Only ADMIN can create or rename a role to ADMIN."
            );
        }

        // =====================================================
        // DUPLICATE ROLE NAME
        // =====================================================

        if (!existingRoleName.equalsIgnoreCase(
                requestedRoleName
        ) &&
                roleRepository.existsByRoleName(
                        requestedRoleName
                )) {

            throw new RuntimeException(
                    "Role already exists"
            );
        }

        // =====================================================
        // UPDATE BASIC DETAILS
        // =====================================================

        role.setRoleName(
                requestedRoleName
        );

        role.setDescription(
                request.getDescription()
        );

        role.setStatus(
                request.getStatus() == null ||
                        request.getStatus().trim().isEmpty()
                        ? "ACTIVE"
                        : request.getStatus()
        );

        Set<Permission> permissions =
                new HashSet<>();

        // =====================================================
        // ADMIN ROLE
        // =====================================================

        if ("ADMIN".equalsIgnoreCase(
                requestedRoleName)) {

            /*
             * ADMIN ALWAYS GETS ALL PERMISSIONS.
             */

            if (!currentUserIsAdmin) {

                throw new RuntimeException(
                        "Only ADMIN can update the ADMIN role."
                );
            }

            permissions.addAll(
                    permissionRepository.findAll()
            );

        } else {

            // =================================================
            // REQUESTED PERMISSIONS
            // =================================================

            Set<Long> requestedPermissionIds =
                    request.getPermissionIds() == null
                            ? new HashSet<>()
                            : new HashSet<>(
                                    request.getPermissionIds()
                            );

            // =================================================
            // ALLOWED PERMISSIONS
            // =================================================

            Set<Permission> allowedPermissions;

            if (currentUserIsAdmin) {

                allowedPermissions =
                        new HashSet<>(
                                permissionRepository.findAll()
                        );

            } else {

                allowedPermissions =
                        getCurrentUserPermissions();
            }

            Set<Long> allowedPermissionIds =
                    allowedPermissions
                            .stream()
                            .map(Permission::getId)
                            .collect(Collectors.toSet());

            // =================================================
            // SECURITY VALIDATION
            // =================================================

            boolean hasUnauthorizedPermission =
                    requestedPermissionIds
                            .stream()
                            .anyMatch(
                                    permissionId ->
                                            !allowedPermissionIds
                                                    .contains(
                                                            permissionId
                                                    )
                            );

            if (hasUnauthorizedPermission) {

                throw new RuntimeException(
                        "You can only assign permissions that you currently have."
                );
            }

            // =================================================
            // LOAD REQUESTED PERMISSIONS
            // =================================================

            if (!requestedPermissionIds.isEmpty()) {

                permissions.addAll(
                        permissionRepository.findAllById(
                                requestedPermissionIds
                        )
                );
            }
        }

        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    // =========================================================
    // DELETE ROLE
    // =========================================================

    @Override
    public void deleteRole(Long id) {

        Role role = getRoleById(id);

        // =====================================================
        // ADMIN ROLE PROTECTION
        // =====================================================

        if ("ADMIN".equalsIgnoreCase(
                role.getRoleName()
        )) {

            throw new RuntimeException(
                    "ADMIN role cannot be deleted."
            );
        }

        // =====================================================
        // CURRENT USER
        // =====================================================

        User currentUser = getCurrentUser();

        boolean currentUserIsAdmin =
                isCurrentUserAdmin();

        // =====================================================
        // NON-ADMIN PERMISSION CHECK
        // =====================================================

        if (!currentUserIsAdmin) {

            boolean hasDeleteRolePermission =
                    getCurrentUserPermissions()
                            .stream()
                            .anyMatch(
                                    permission ->
                                            "DELETE_ROLE"
                                                    .equalsIgnoreCase(
                                                            permission
                                                                    .getPermissionName()
                                                    )
                            );

            if (!hasDeleteRolePermission) {

                throw new RuntimeException(
                        "You do not have permission to delete roles."
                );
            }
        }

        // =====================================================
        // ROLE ASSIGNED TO USER
        // =====================================================

        if (userRepository.existsByRole(role)) {

            throw new RuntimeException(
                    "Cannot delete this role because it is assigned to one or more users."
            );
        }

        roleRepository.delete(role);
    }
}