package com.loan.service;

import com.loan.dto.ChangePasswordRequest;
import com.loan.dto.UserRequest;
import com.loan.entity.User;

import java.util.List;

public interface UserService {

    // =========================================================
    // CREATE USER
    // =========================================================

    User createUser(UserRequest request);

    // =========================================================
    // GET ALL USERS
    // =========================================================

    List<User> getAllUsers();

    // =========================================================
    // GET ALL MANAGERS
    // Used by GroupForm manager dropdown
    // =========================================================

    List<User> getManagers();

    // =========================================================
    // GET USER BY ID
    // =========================================================

    User getUserById(Long id);

    // =========================================================
    // UPDATE USER
    // =========================================================

    User updateUser(
            Long id,
            UserRequest request
    );

    // =========================================================
    // UPDATE USER STATUS
    // =========================================================

    User updateUserStatus(
            Long id,
            boolean enabled
    );

    // =========================================================
    // GET USER BY USERNAME
    // =========================================================

    User getUserByUsername(String username);

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    User updateProfile(
            String username,
            UserRequest request
    );

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    void changePassword(
            String username,
            ChangePasswordRequest request
    );

    // =========================================================
    // DELETE USER
    // =========================================================

    void deleteUser(Long id);
}