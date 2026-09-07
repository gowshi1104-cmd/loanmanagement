package com.loan.config;

import com.loan.entity.Feature;
import com.loan.repository.FeatureRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeatureDataInitializer {

    @Bean
    CommandLineRunner initializeFeatures(
            FeatureRepository featureRepository
    ) {

        return args -> {

            // =================================================
            // LOANS
            // =================================================

            createFeature(
                    featureRepository,
                    "LOAN_APPLICATIONS",
                    "Loan Applications",
                    "Loans",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "APPROVED_LOANS",
                    "Approved Loans",
                    "Loans",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ACTIVE_LOANS",
                    "Active Loans",
                    "Loans",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "COMPLETED_LOANS",
                    "Completed Loans",
                    "Loans",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "CLOSED_LOANS",
                    "Closed Loans",
                    "Loans",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ADD_LOAN",
                    "Add Loan",
                    "Loans",
                    "ACTION"
            );

            // =================================================
            // CUSTOMERS
            // =================================================

            createFeature(
                    featureRepository,
                    "CUSTOMERS",
                    "Customers",
                    "Customers",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ADD_CUSTOMER",
                    "Add Customer",
                    "Customers",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "EDIT_CUSTOMER",
                    "Edit Customer",
                    "Customers",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "DELETE_CUSTOMER",
                    "Delete Customer",
                    "Customers",
                    "ACTION"
            );

            // =================================================
            // PAYMENTS
            // =================================================

            createFeature(
                    featureRepository,
                    "PAYMENT_HISTORY",
                    "Payment History",
                    "Payments",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ADD_PAYMENT",
                    "Add Payment",
                    "Payments",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "PAYMENT_RECEIPT",
                    "Payment Receipt",
                    "Payments",
                    "ACTION"
            );

            // =================================================
            // USERS
            // =================================================

            createFeature(
                    featureRepository,
                    "USERS",
                    "Users",
                    "Users",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ADD_USER",
                    "Add User",
                    "Users",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "EDIT_USER",
                    "Edit User",
                    "Users",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "DELETE_USER",
                    "Delete User",
                    "Users",
                    "ACTION"
            );

            // =================================================
            // GROUPS
            // =================================================

            createFeature(
                    featureRepository,
                    "GROUPS",
                    "Groups",
                    "Groups",
                    "PAGE"
            );

            createFeature(
                    featureRepository,
                    "ADD_GROUP",
                    "Add Group",
                    "Groups",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "EDIT_GROUP",
                    "Edit Group",
                    "Groups",
                    "ACTION"
            );

            createFeature(
                    featureRepository,
                    "DELETE_GROUP",
                    "Delete Group",
                    "Groups",
                    "ACTION"
            );

            // =================================================
            // REPORTS
            // =================================================

            createFeature(
                    featureRepository,
                    "REPORTS",
                    "Reports",
                    "Reports",
                    "PAGE"
            );

            // =================================================
            // HELP & SUPPORT
            // =================================================

            createFeature(
                    featureRepository,
                    "HELP_SUPPORT",
                    "Help & Support",
                    "Help & Support",
                    "PAGE"
            );

            // =================================================
            // DASHBOARD
            // =================================================

            createFeature(
                    featureRepository,
                    "DASHBOARD",
                    "Dashboard",
                    "Dashboard",
                    "PAGE"
            );
        };
    }

    // =========================================================
    // CREATE FEATURE IF NOT EXISTS
    // =========================================================

    private void createFeature(
            FeatureRepository featureRepository,
            String featureKey,
            String featureName,
            String module,
            String type
    ) {

        if (featureRepository.existsByFeatureKey(
                featureKey
        )) {

            return;
        }

        Feature feature = new Feature();

        feature.setFeatureKey(featureKey);

        feature.setFeatureName(featureName);

        feature.setModule(module);

        feature.setType(type);

        feature.setEnabled(true);

        featureRepository.save(feature);
    }
}