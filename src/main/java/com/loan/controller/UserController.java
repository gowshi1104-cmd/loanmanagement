package com.loan.controller;

import com.loan.dto.ChangePasswordRequest;
import com.loan.dto.UserRequest;
import com.loan.entity.User;
import com.loan.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    // =========================================================
    // GET ALL MANAGERS
    // =========================================================

    @GetMapping("/managers")
    public List<User> getManagers() {

        return userService.getManagers();
    }

    // =========================================================
    // GET USER
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    userService.getUserById(id)
            );

        } catch (RuntimeException e) {

            if (e.getMessage() != null &&
                    e.getMessage()
                            .toLowerCase()
                            .contains("don't have view/access")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(e.getMessage());
            }

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CREATE USER
    // =========================================================

    @PostMapping
    public User createUser(
            @RequestBody UserRequest request
    ) {

        return userService.createUser(request);
    }

    // =========================================================
    // UPDATE USER
    // =========================================================

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody UserRequest request
    ) {

        return userService.updateUser(
                id,
                request
        );
    }

    // =========================================================
    // UPDATE USER STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request
    ) {

        Boolean enabled = request.get("enabled");

        if (enabled == null) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        User updatedUser =
                userService.updateUserStatus(
                        id,
                        enabled
                );

        return ResponseEntity.ok(updatedUser);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Long id
    ) {

        userService.deleteUser(id);

        return "User deleted successfully";
    }

    // =========================================================
    // MY PROFILE
    // =========================================================

    @GetMapping("/me")
    public User getProfile(
            Authentication authentication
    ) {

        return userService.getUserByUsername(
                authentication.getName()
        );
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @PutMapping("/me")
    public User updateProfile(
            Authentication authentication,
            @RequestBody UserRequest request
    ) {

        return userService.updateProfile(
                authentication.getName(),
                request
        );
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @PutMapping("/change-password")
    public String changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return "Password Changed Successfully";
    }
}