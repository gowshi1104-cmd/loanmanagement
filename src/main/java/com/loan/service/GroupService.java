package com.loan.service;

import com.loan.entity.Group;
import com.loan.entity.User;
import com.loan.repository.GroupRepository;
import com.loan.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupService(
            GroupRepository groupRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET ALL GROUPS
    // =========================================================

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    // =========================================================
    // GET GROUPS BY MANAGER
    // =========================================================

    public List<Group> getGroupsByManager(
            Long managerUserId
    ) {
        return groupRepository.findByLeaderUserId(
                managerUserId
        );
    }

    // =========================================================
    // GET GROUP BY ID
    // =========================================================

    public Group getGroupById(
            Long groupId
    ) {
        return groupRepository
                .findById(groupId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Group not found"
                        )
                );
    }

    // =========================================================
    // GET GROUP BY ID FOR MANAGER
    // =========================================================

    public Group getGroupByIdForManager(
            Long groupId,
            Long managerUserId
    ) {
        return groupRepository
                .findByIdAndLeaderUserId(
                        groupId,
                        managerUserId
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Group not found or you are not the group manager"
                        )
                );
    }

    // =========================================================
    // GET ACTIVE GROUPS
    // =========================================================

    public List<Group> getActiveGroups() {
        return groupRepository.findByStatus("ACTIVE");
    }

    // =========================================================
    // GET ACTIVE GROUPS BY MANAGER
    // =========================================================

    public List<Group> getActiveGroupsByManager(
            Long managerUserId
    ) {
        return groupRepository.findByLeaderUserIdAndStatus(
                managerUserId,
                "ACTIVE"
        );
    }

    // =========================================================
    // GET MANAGERS
    // =========================================================
    //
    // Used for Admin Group create/edit dropdown.
    // Only MANAGER users are returned.
    //
    // =========================================================

    public List<User> getManagers() {

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        "MANAGER".equals(
                                getRoleName(user)
                        )
                )
                .toList();
    }

    // =========================================================
    // CREATE GROUP
    // =========================================================

    public Group createGroup(
            String groupName,
            Long leaderUserId,
            String status
    ) {

        // -----------------------------------------------------
        // VALIDATE GROUP NAME
        // -----------------------------------------------------

        if (groupName == null ||
                groupName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Group name is required"
            );
        }

        // -----------------------------------------------------
        // VALIDATE GROUP LEADER
        // -----------------------------------------------------

        if (leaderUserId == null) {

            throw new RuntimeException(
                    "Group leader is required"
            );
        }

        String normalizedGroupName =
                groupName.trim();

        // -----------------------------------------------------
        // CHECK DUPLICATE GROUP NAME
        // -----------------------------------------------------

        if (groupRepository
                .existsByGroupNameIgnoreCase(
                        normalizedGroupName
                )) {

            throw new RuntimeException(
                    "Group already exists"
            );
        }

        // -----------------------------------------------------
        // FIND MANAGER
        // -----------------------------------------------------

        User manager = userRepository
                .findById(leaderUserId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Selected manager not found"
                        )
                );

        // -----------------------------------------------------
        // VERIFY MANAGER ROLE
        // -----------------------------------------------------

        String roleName =
                getRoleName(manager);

        if (!"MANAGER".equals(roleName)) {

            throw new RuntimeException(
                    "Group leader must be a Manager"
            );
        }

        // -----------------------------------------------------
        // CREATE GROUP
        // -----------------------------------------------------

        Group group = new Group();

        group.setGroupName(
                normalizedGroupName
        );

        group.setLeaderUserId(
                leaderUserId
        );

        group.setStatus(
                normalizeStatus(status)
        );

        return groupRepository.save(group);
    }

    // =========================================================
    // UPDATE GROUP
    // =========================================================

    public Group updateGroup(
            Long groupId,
            String groupName,
            Long leaderUserId,
            String status
    ) {

        // -----------------------------------------------------
        // FIND GROUP
        // -----------------------------------------------------

        Group group =
                getGroupById(groupId);

        // -----------------------------------------------------
        // VALIDATE GROUP NAME
        // -----------------------------------------------------

        if (groupName == null ||
                groupName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Group name is required"
            );
        }

        // -----------------------------------------------------
        // VALIDATE GROUP LEADER
        // -----------------------------------------------------

        if (leaderUserId == null) {

            throw new RuntimeException(
                    "Group leader is required"
            );
        }

        String normalizedGroupName =
                groupName.trim();

        // -----------------------------------------------------
        // CHECK DUPLICATE GROUP NAME
        // -----------------------------------------------------

        groupRepository
                .findByGroupNameIgnoreCase(
                        normalizedGroupName
                )
                .ifPresent(existing -> {

                    if (!existing.getId()
                            .equals(groupId)) {

                        throw new RuntimeException(
                                "Another group already exists with this name"
                        );
                    }
                });

        // -----------------------------------------------------
        // FIND MANAGER
        // -----------------------------------------------------

        User manager = userRepository
                .findById(leaderUserId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Selected manager not found"
                        )
                );

        // -----------------------------------------------------
        // VERIFY MANAGER ROLE
        // -----------------------------------------------------

        String roleName =
                getRoleName(manager);

        if (!"MANAGER".equals(roleName)) {

            throw new RuntimeException(
                    "Group leader must be a Manager"
            );
        }

        // -----------------------------------------------------
        // UPDATE GROUP
        // -----------------------------------------------------

        group.setGroupName(
                normalizedGroupName
        );

        group.setLeaderUserId(
                leaderUserId
        );

        group.setStatus(
                normalizeStatus(status)
        );

        return groupRepository.save(group);
    }

    // =========================================================
    // DELETE GROUP
    // =========================================================

    public void deleteGroup(
            Long groupId
    ) {

        Group group =
                getGroupById(groupId);

        groupRepository.delete(group);
    }

    // =========================================================
    // NORMALIZE STATUS
    // =========================================================

    private String normalizeStatus(
            String status
    ) {

        if (status == null ||
                status.trim().isEmpty()) {

            return "ACTIVE";
        }

        return status
                .trim()
                .toUpperCase();
    }

    // =========================================================
    // GET ROLE NAME
    // =========================================================

    private String getRoleName(
            User user
    ) {

        if (user == null ||
                user.getRole() == null ||
                user.getRole().getRoleName() == null) {

            return "";
        }

        String roleName =
                user.getRole()
                        .getRoleName()
                        .trim()
                        .toUpperCase();

        // Supports both:
        // MANAGER
        // ROLE_MANAGER

        if (roleName.startsWith("ROLE_")) {

            roleName =
                    roleName.substring(5);
        }

        return roleName;
    }
}