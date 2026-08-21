package com.loan.service;

import com.loan.dto.RoleRequest;
import com.loan.entity.Permission;
import com.loan.entity.Role;

import java.util.List;

public interface RoleService {

    List<Role> getAllRoles();

    Role getRoleById(Long id);

    Role createRole(RoleRequest request);

    Role updateRole(Long id, RoleRequest request);

    void deleteRole(Long id);

    /*
     * Returns permissions that the currently logged-in
     * user is allowed to assign to another role.
     *
     * ADMIN  -> all permissions
     * Others -> only their own role permissions
     */
    List<Permission> getAvailablePermissions();
}