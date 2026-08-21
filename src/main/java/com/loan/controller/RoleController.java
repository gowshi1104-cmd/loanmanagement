package com.loan.controller;

import com.loan.dto.RoleRequest;
import com.loan.entity.Permission;
import com.loan.entity.Role;
import com.loan.service.RoleService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "http://localhost:5173")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // =========================================================
    // GET ALL ROLES
    // =========================================================

    @GetMapping
    public List<Role> getAllRoles() {

        return roleService.getAllRoles();
    }

    // =========================================================
    // GET ROLE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Role getRoleById(
            @PathVariable Long id) {

        return roleService.getRoleById(id);
    }

    // =========================================================
    // GET AVAILABLE PERMISSIONS
    // =========================================================

    /*
     * ADMIN:
     *     Returns ALL permissions.
     *
     * MANAGER / STAFF:
     *     Returns only permissions belonging to their
     *     current role.
     */

    @GetMapping("/available-permissions")
    public List<Permission> getAvailablePermissions() {

        return roleService.getAvailablePermissions();
    }

    // =========================================================
    // CREATE ROLE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createRole(
            @RequestBody RoleRequest request) {

        try {

            System.out.println(
                    "CREATE ROLE API HIT"
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            roleService.createRole(request)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // UPDATE ROLE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestBody RoleRequest request) {

        try {

            return ResponseEntity.ok(
                    roleService.updateRole(
                            id,
                            request
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // DELETE ROLE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(
            @PathVariable Long id) {

        try {

            roleService.deleteRole(id);

            return ResponseEntity.ok(
                    "Role deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            e.getMessage()
                    );
        }
    }
}