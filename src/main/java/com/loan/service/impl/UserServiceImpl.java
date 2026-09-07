package com.loan.service.impl;

import com.loan.dto.ChangePasswordRequest;
import com.loan.dto.UserRequest;
import com.loan.entity.Role;
import com.loan.entity.User;
import com.loan.repository.RoleRepository;
import com.loan.repository.UserRepository;
import com.loan.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            PasswordEncoder passwordEncoder
    ) {
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

        while (
                userRepository.existsByUsername(
                        generatedUsername
                )
        ) {

            nextNumber++;

            generatedUsername =
                    prefix + String.format("%03d", nextNumber);
        }

        return generatedUsername;
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
                .orElseThrow(
                        () -> new RuntimeException(
                                "Current user not found"
                        )
                );
    }

    // =========================================================
    // CHECK ADMIN
    // =========================================================
    private boolean isAdmin(User user) {

        return user != null &&
                user.getRole() != null &&
                "ADMIN".equalsIgnoreCase(
                        user.getRole().getRoleName()
                );
    }

    // =========================================================
    // CHECK MANAGER
    // =========================================================
    private boolean isManager(User user) {

        return user != null &&
                user.getRole() != null &&
                "MANAGER".equalsIgnoreCase(
                        user.getRole().getRoleName()
                );
    }

    // =========================================================
    // VALIDATE REPORTING MANAGER
    // =========================================================
    private User getReportingManager(
            Long reportingManagerId
    ) {

        if (reportingManagerId == null) {

            throw new RuntimeException(
                    "Reporting manager is required for STAFF"
            );
        }

        User manager =
                userRepository
                        .findById(reportingManagerId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Reporting manager not found"
                                )
                        );

        if (!isManager(manager)) {

            throw new RuntimeException(
                    "Selected reporting manager must have MANAGER role"
            );
        }

        return manager;
    }

    // =========================================================
    // CREATE USER
    // =========================================================
    @Override
    public User createUser(UserRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "User request cannot be null"
            );
        }

        if (request.getRoleId() == null) {

            throw new RuntimeException(
                    "Role is required"
            );
        }

        if (request.getFullName() == null ||
                request.getFullName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().trim().isEmpty()) {

            throw new RuntimeException(
                    "Password is required"
            );
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
        // REPORTING MANAGER
        //
        // Only STAFF requires reporting manager.
        // =====================================================
        User reportingManager = null;

        if ("STAFF".equalsIgnoreCase(
                role.getRoleName()
        )) {

            reportingManager =
                    getReportingManager(
                            request.getReportingManagerId()
                    );
        }

        // =====================================================
        // GENERATE USERNAME
        // =====================================================
        String generatedUsername =
                generateUsername(
                        role.getRoleName()
                );

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

        // =====================================================
        // USER STATUS
        //
        // TRUE  -> ACTIVE
        // FALSE -> INACTIVE
        // NULL  -> ACTIVE
        //
        // IMPORTANT:
        // Do NOT hardcode true here.
        // =====================================================
        user.setEnabled(
                request.getEnabled() == null
                        ? true
                        : request.getEnabled()
        );

        user.setRole(role);

        // =====================================================
        // REPORTING MANAGER
        // =====================================================
        user.setReportingManager(
                reportingManager
        );

        return userRepository.save(user);
    }

    // =========================================================
    // GET ALL USERS
    //
    // ADMIN  -> ALL USERS
    // MANAGER -> ONLY THEIR STAFF
    // OTHERS -> ALL USERS
    // =========================================================
    @Override
    public List<User> getAllUsers() {

        User currentUser = getCurrentUser();

        if (isAdmin(currentUser)) {

            return userRepository.findAll();
        }

        if (isManager(currentUser)) {

            return userRepository.findByReportingManagerId(
                    currentUser.getId()
            );
        }

        return userRepository.findAll();
    }

    // =========================================================
    // GET ALL MANAGERS
    // =========================================================
    @Override
    public List<User> getManagers() {

        return userRepository
                .findByRoleRoleNameIgnoreCase("MANAGER");
    }

    // =========================================================
    // GET USER BY ID
    // =========================================================
    @Override
    public User getUserById(Long id) {

        User requestedUser =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        User currentUser = getCurrentUser();

        // ADMIN can see everyone
        if (isAdmin(currentUser)) {

            return requestedUser;
        }

        // MANAGER can see only assigned STAFF
        if (isManager(currentUser)) {

            boolean isOwnStaff =
                    userRepository
                            .existsByIdAndReportingManagerId(
                                    requestedUser.getId(),
                                    currentUser.getId()
                            );

            if (!isOwnStaff) {

                String managerName =
                        "the assigned reporting manager";

                if (requestedUser.getReportingManager() != null &&
                        requestedUser
                                .getReportingManager()
                                .getFullName() != null) {

                    managerName =
                            requestedUser
                                    .getReportingManager()
                                    .getFullName();
                }

                throw new RuntimeException(
                        "You don't have view/access to this staff. "
                                + "Please contact the reporting manager: "
                                + managerName
                );
            }

            return requestedUser;
        }

        return requestedUser;
    }

    // =========================================================
    // UPDATE USER
    // =========================================================
    @Override
    public User updateUser(
            Long id,
            UserRequest request
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        if (request == null) {

            throw new RuntimeException(
                    "User request cannot be null"
            );
        }

        if (request.getRoleId() == null) {

            throw new RuntimeException(
                    "Role is required"
            );
        }

        Role role =
                roleRepository
                        .findById(request.getRoleId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Role not found"
                                )
                        );

        // =====================================================
        // REPORTING MANAGER
        //
        // STAFF -> required
        // Other roles -> null
        // =====================================================
        User reportingManager = null;

        if ("STAFF".equalsIgnoreCase(
                role.getRoleName()
        )) {

            reportingManager =
                    getReportingManager(
                            request.getReportingManagerId()
                    );
        }

        // =====================================================
        // USERNAME MUST NEVER CHANGE
        // =====================================================
        user.setFullName(
                request.getFullName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setRole(role);

        user.setReportingManager(
                reportingManager
        );

        // =====================================================
        // USER STATUS
        //
        // If frontend sends true  -> Active
        // If frontend sends false -> Inactive
        // If frontend doesn't send enabled -> keep existing
        // =====================================================
        if (request.getEnabled() != null) {

            user.setEnabled(
                    request.getEnabled()
            );
        }

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
    // UPDATE USER STATUS
    // =========================================================
    @Override
    public User updateUserStatus(
            Long id,
            boolean enabled
    ) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        user.setEnabled(enabled);

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
            UserRequest request
    ) {

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
            ChangePasswordRequest request
    ) {

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
                user.getPassword()
        )) {

            throw new RuntimeException(
                    "Current Password is incorrect"
            );
        }

        // =====================================================
        // UPDATE PASSWORD
        // =====================================================
        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        // =====================================================
        // PASSWORD CHANGE COMPLETED
        //
        // User has successfully changed the temporary/forced
        // password, so forced password change is no longer
        // required.
        // =====================================================
        user.setMustChangePassword(false);

        // =====================================================
        // SAVE USER
        // =====================================================
        userRepository.save(user);
    }

    // =========================================================
    // DELETE USER
    // =========================================================
    @Override
    public void deleteUser(Long id) {

        if (!userRepository.existsById(id)) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        userRepository.deleteById(id);
    }
}