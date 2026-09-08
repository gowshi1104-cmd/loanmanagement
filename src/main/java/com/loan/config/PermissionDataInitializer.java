package com.loan.config;

import com.loan.entity.Permission;
import com.loan.entity.Role;
import com.loan.repository.PermissionRepository;
import com.loan.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class PermissionDataInitializer {

    @Bean
    CommandLineRunner initializePermissions(
            PermissionRepository permissionRepository,
            RoleRepository roleRepository
    ) {

        return args -> {

            // =========================================================
            // 1. CREATE REQUIRED PERMISSIONS
            // =========================================================

            List<String> customerPermissions = List.of(
                    "VIEW_CUSTOMER_DASHBOARD",
                    "VIEW_MY_LOANS",
                    "VIEW_EMI_SCHEDULE",
                    "VIEW_MY_PAYMENT_HISTORY"
            );

            for (String permissionName : customerPermissions) {

                if (permissionRepository
                        .findByPermissionName(permissionName)
                        .isEmpty()) {

                    Permission permission = new Permission();
                    permission.setPermissionName(permissionName);

                    permissionRepository.save(permission);

                    System.out.println(
                            "Created permission: " + permissionName
                    );
                }
            }

            // =========================================================
            // 2. CREATE REQUIRED ROLES
            // =========================================================

            createRole(
                    roleRepository,
                    "ADMIN",
                    "System administrator",
                    "ACTIVE"
            );

            createRole(
                    roleRepository,
                    "MANAGER",
                    "Manager",
                    "ACTIVE"
            );

            createRole(
                    roleRepository,
                    "STAFF",
                    "Staff user",
                    "ACTIVE"
            );

            createRole(
                    roleRepository,
                    "CUSTOMER",
                    "Customer user",
                    "ACTIVE"
            );

            // =========================================================
            // 3. ASSIGN CUSTOMER PERMISSIONS
            // =========================================================

            Role customerRole = roleRepository
                    .findByRoleNameIgnoreCase("CUSTOMER")
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "CUSTOMER role was not created"
                            )
                    );

            Set<Permission> permissions =
                    new HashSet<>();

            for (String permissionName : customerPermissions) {

                permissionRepository
                        .findByPermissionName(permissionName)
                        .ifPresent(permissions::add);
            }

            customerRole.setPermissions(permissions);

            roleRepository.save(customerRole);

            System.out.println(
                    "Customer permissions initialization completed."
            );

            System.out.println(
                    "Role initialization completed."
            );
        };
    }

    private void createRole(
            RoleRepository roleRepository,
            String roleName,
            String description,
            String status
    ) {

        if (roleRepository
                .findByRoleNameIgnoreCase(roleName)
                .isEmpty()) {

            Role role = new Role();

            role.setRoleName(roleName);
            role.setDescription(description);
            role.setStatus(status);
            role.setPermissions(new HashSet<>());

            roleRepository.save(role);

            System.out.println(
                    "Created role: " + roleName
            );
        }
    }
}