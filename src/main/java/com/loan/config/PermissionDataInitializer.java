package com.loan.config;

import com.loan.entity.Permission;
import com.loan.repository.PermissionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class PermissionDataInitializer {

    @Bean
    CommandLineRunner initializePermissions(
            PermissionRepository permissionRepository
    ) {

        return args -> {

            /*
             * =========================================================
             * CUSTOMER PORTAL PERMISSIONS
             * =========================================================
             *
             * These permissions are used only for Customer / Member
             * portal pages.
             *
             * Existing permissions will NOT be duplicated.
             */

            List<String> customerPermissions = List.of(

                    "VIEW_CUSTOMER_DASHBOARD",

                    "VIEW_MY_LOANS",

                    "VIEW_EMI_SCHEDULE",

                    "VIEW_MY_PAYMENT_HISTORY"

            );

            for (String permissionName : customerPermissions) {

                if (
                        permissionRepository
                                .findByPermissionName(permissionName)
                                .isEmpty()
                ) {

                    Permission permission =
                            new Permission();

                    permission.setPermissionName(
                            permissionName
                    );

                    permissionRepository.save(
                            permission
                    );

                    System.out.println(
                            "Created permission: "
                                    + permissionName
                    );
                }
            }

            System.out.println(
                    "Customer permissions initialization completed."
            );
        };
    }
}