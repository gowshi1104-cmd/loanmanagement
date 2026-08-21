package com.loan.service.impl;

import com.loan.dto.ChangePasswordRequest;
import com.loan.dto.UserRequest;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.RoleRepository;
import com.loan.repository.UserRepository;
import com.loan.service.UserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // GET USERNAME PREFIX
    // =========================================================

    private String getUsernamePrefix(String roleName) {

        if (roleName == null || roleName.trim().isEmpty()) {
            throw new RuntimeException("Role name is required");
        }

        String role = roleName.trim().toUpperCase();

        return switch (role) {
            case "ADMIN" -> "ADM";
            case "MANAGER" -> "MAN";
            case "STAFF" -> "STA";
            case "CUSTOMER", "MEMBER" -> "CUS";

            default -> throw new RuntimeException(
                    "Username prefix not configured for role: "
                            + roleName
            );
        };
    }

    // =========================================================
    // GENERATE USERNAME
    // =========================================================

    private String generateUsername(String roleName) {

        String prefix = getUsernamePrefix(roleName);

        var latestUser =
                userRepository
                        .findTopByUsernameStartingWithOrderByUsernameDesc(
                                prefix
                        );

        int nextNumber = 1;

        if (latestUser.isPresent()) {

            String latestUsername =
                    latestUser.get().getUsername();

            try {

                String numberPart =
                        latestUsername.substring(prefix.length());

                int latestNumber =
                        Integer.parseInt(numberPart);

                nextNumber = latestNumber + 1;

            } catch (Exception ignored) {
                nextNumber = 1;
            }
        }

        String generatedUsername =
                prefix + String.format("%03d", nextNumber);

        // Extra duplicate protection
        while (userRepository.existsByUsername(generatedUsername)) {

            nextNumber++;

            generatedUsername =
                    prefix + String.format("%03d", nextNumber);
        }

        return generatedUsername;
    }

    // =========================================================
    // CREATE USER
    // =========================================================

    @Override
    public User createUser(UserRequest request) {

        if (request == null) {
            throw new RuntimeException("User request cannot be null");
        }

        if (request.getRoleId() == null) {
            throw new RuntimeException("Role is required");
        }

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            throw new RuntimeException("Full name is required");
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null ||
                request.getPassword().trim().isEmpty()) {

            throw new RuntimeException("Password is required");
        }

        // =====================================================
        // FIND ROLE
        // =====================================================

        Role role =
                roleRepository
                        .findById(request.getRoleId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Role not found"
                                )
                        );

        // =====================================================
        // GENERATE USERNAME
        // =====================================================

        String generatedUsername =
                generateUsername(role.getRoleName());

        // =====================================================
        // CREATE USER
        // =====================================================

        User user = new User();

        user.setUsername(generatedUsername);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setFullName(
                request.getFullName().trim()
        );

        user.setEmail(
                request.getEmail().trim()
        );

        user.setEnabled(true);

        user.setRole(role);

        return userRepository.save(user);
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    @Override
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // =========================================================
    // GET ALL MANAGERS
    // Used by GroupForm manager dropdown
    // =========================================================

    @Override
    public List<User> getManagers() {

        return userRepository.findByRoleRoleNameIgnoreCase("MANAGER");
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Override
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }

    // =========================================================
    // UPDATE USER
    // =========================================================

    @Override
    public User updateUser(
            Long id,
            UserRequest request) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        if (request.getRoleId() == null) {
            throw new RuntimeException("Role is required");
        }

        Role role =
                roleRepository.findById(request.getRoleId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Role not found"
                                )
                        );

        // =====================================================
        // USERNAME / USER ID MUST NEVER CHANGE
        //
        // STA001 -> remains STA001
        // MAN001 -> remains MAN001
        // CUS001 -> remains CUS001
        //
        // Even if role is changed, existing login ID
        // will remain unchanged.
        // =====================================================

        user.setFullName(
                request.getFullName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setRole(role);

        // =====================================================
        // PASSWORD
        // =====================================================

        if (request.getPassword() != null &&
                !request.getPassword().trim().isEmpty()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        return userRepository.save(user);
    }

    // =========================================================
    // GET USER BY USERNAME
    // =========================================================

    @Override
    public User getUserByUsername(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @Override
    public User updateProfile(
            String username,
            UserRequest request) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        user.setFullName(
                request.getFullName()
        );

        user.setEmail(
                request.getEmail()
        );

        return userRepository.save(user);
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @Override
    public void changePassword(
            String username,
            ChangePasswordRequest request) {

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Current Password is incorrect"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    @Override
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteById(id);
    }
}