package com.loan.controller;

import com.loan.entity.Permission;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.PermissionRepository;
import com.loan.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin(origins = "http://localhost:5173")
public class PermissionController {

    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public PermissionController(
            PermissionRepository permissionRepository,
            UserRepository userRepository) {

        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET PERMISSIONS AVAILABLE FOR CURRENT USER
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllPermissions(
            Authentication authentication) {

        try {

            if (authentication == null ||
                    authentication.getName() == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("User is not authenticated");
            }

            String username =
                    authentication.getName();

            User currentUser =
                    userRepository
                            .findByUsername(username)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Current user not found"
                                    )
                            );

            Role role =
                    currentUser.getRole();

            if (role == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("User has no role assigned");
            }

            // =================================================
            // ADMIN
            // =================================================
            //
            // ADMIN can see ALL permissions.
            //

            if ("ADMIN".equalsIgnoreCase(
                    role.getRoleName())) {

                return ResponseEntity.ok(
                        permissionRepository.findAll()
                );
            }

            // =================================================
            // OTHER ROLES
            // =================================================
            //
            // Manager / Staff / Customer etc.
            // can see ONLY permissions assigned
            // to their own role.
            //

            return ResponseEntity.ok(
                    role.getPermissions()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }
}