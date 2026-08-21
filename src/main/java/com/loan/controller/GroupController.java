package com.loan.controller;

import com.loan.entity.Group;
import com.loan.entity.Member;
import com.loan.entity.User;
import com.loan.repository.MemberRepository;
import com.loan.repository.UserRepository;
import com.loan.service.GroupService;
import com.loan.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class GroupController {

    private final GroupService groupService;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    public GroupController(
            GroupService groupService,
            UserRepository userRepository,
            MemberRepository memberRepository,
            NotificationService notificationService
    ) {
        this.groupService = groupService;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET MANAGERS
    //
    // GET /api/groups/managers
    //
    // Used by Admin Group create/edit dropdown.
    // =========================================================

    @GetMapping("/managers")
    public ResponseEntity<?> getManagers(
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        if (!"ADMIN".equals(roleName)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to view managers");
        }

        List<Map<String, Object>> response =
                groupService.getManagers()
                        .stream()
                        .map(this::createManagerResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET ALL GROUPS
    //
    // ADMIN   -> ALL GROUPS
    // MANAGER -> OWN GROUPS ONLY
    // STAFF   -> ACTIVE GROUPS ONLY
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getGroups(
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        List<Group> groups;

        if ("ADMIN".equals(roleName)) {

            groups =
                    groupService.getAllGroups();

        } else if ("MANAGER".equals(roleName)) {

            groups =
                    groupService.getGroupsByManager(
                            currentUser.getId()
                    );

        } else if ("STAFF".equals(roleName)) {

            groups =
                    groupService.getActiveGroups();

        } else {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to view groups");
        }

        List<Map<String, Object>> response =
                groups.stream()
                        .map(this::createGroupResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET GROUP BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        try {

            Group group;

            if ("ADMIN".equals(roleName)) {

                group =
                        groupService.getGroupById(id);

            } else if ("MANAGER".equals(roleName)) {

                group =
                        groupService.getGroupByIdForManager(
                                id,
                                currentUser.getId()
                        );

            } else if ("STAFF".equals(roleName)) {

                group =
                        groupService.getGroupById(id);

                if (!"ACTIVE".equalsIgnoreCase(
                        group.getStatus()
                )) {

                    return ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .body("Group not found");
                }

            } else {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("You are not allowed to view this group");
            }

            return ResponseEntity.ok(
                    createGroupResponse(group)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET GROUP MEMBERS
    // =========================================================

    @GetMapping("/{id}/members")
    public ResponseEntity<?> getGroupMembers(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        try {

            Group group;

            if ("ADMIN".equals(roleName)) {

                group =
                        groupService.getGroupById(id);

            } else if ("MANAGER".equals(roleName)) {

                group =
                        groupService.getGroupByIdForManager(
                                id,
                                currentUser.getId()
                        );

            } else if ("STAFF".equals(roleName)) {

                group =
                        groupService.getGroupById(id);

                if (!"ACTIVE".equalsIgnoreCase(
                        group.getStatus()
                )) {

                    return ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .body("Group not found");
                }

            } else {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You are not allowed to view group members"
                        );
            }

            List<Member> members =
                    memberRepository.findByGroupId(
                            group.getId()
                    );

            List<Map<String, Object>> response =
                    members.stream()
                            .map(this::createGroupMemberResponse)
                            .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CREATE GROUP
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createGroup(
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        if (!"ADMIN".equals(roleName)
                && !"MANAGER".equals(roleName)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to create groups");
        }

        try {

            String groupName =
                    request.get("groupName") != null
                            ? request.get("groupName").toString()
                            : null;

            Long managerUserId =
                    parseLong(
                            request.get("managerUserId")
                    );

            String status =
                    request.get("status") != null
                            ? request.get("status").toString()
                            : "ACTIVE";

            // Manager creates group only under himself
            if ("MANAGER".equals(roleName)) {

                managerUserId =
                        currentUser.getId();
            }

            Group savedGroup =
                    groupService.createGroup(
                            groupName,
                            managerUserId,
                            status
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            createGroupResponse(savedGroup)
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // UPDATE GROUP
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        if (!"ADMIN".equals(roleName)
                && !"MANAGER".equals(roleName)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to update groups");
        }

        try {

            Group existingGroup =
                    groupService.getGroupById(id);

            // Manager can update only own group
            if ("MANAGER".equals(roleName)
                    && !currentUser.getId().equals(
                    existingGroup.getLeaderUserId()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You can update only your own groups"
                        );
            }

            String groupName =
                    request.get("groupName") != null
                            ? request.get("groupName").toString()
                            : null;

            Long managerUserId =
                    parseLong(
                            request.get("managerUserId")
                    );

            String status =
                    request.get("status") != null
                            ? request.get("status").toString()
                            : "ACTIVE";

            // Manager cannot transfer group ownership
            if ("MANAGER".equals(roleName)) {

                managerUserId =
                        currentUser.getId();
            }

            Group updatedGroup =
                    groupService.updateGroup(
                            id,
                            groupName,
                            managerUserId,
                            status
                    );

            return ResponseEntity.ok(
                    createGroupResponse(updatedGroup)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // DELETE GROUP
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User currentUser =
                requireCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        String roleName =
                getRoleName(currentUser);

        if (!"ADMIN".equals(roleName)
                && !"MANAGER".equals(roleName)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to delete groups");
        }

        try {

            Group group =
                    groupService.getGroupById(id);

            if ("MANAGER".equals(roleName)
                    && !currentUser.getId().equals(
                    group.getLeaderUserId()
            )) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You can delete only your own groups"
                        );
            }

            notificationService.notifyAllUsersForGroupDeleted(
                    currentUser,
                    group
            );

            groupService.deleteGroup(id);

            return ResponseEntity.ok(
                    "Group deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private User requireCurrentUser(
            Authentication authentication
    ) {

        if (authentication == null
                || authentication.getName() == null) {

            return null;
        }

        return userRepository
                .findByUsername(
                        authentication.getName()
                )
                .orElse(null);
    }

    // =========================================================
    // GROUP RESPONSE
    //
    // Frontend-compatible response:
    //
    // managerUserId
    // managerName
    // managerUsername
    // totalMembers
    //
    // Old leader fields are also retained for compatibility.
    // =========================================================

    private Map<String, Object> createGroupResponse(
            Group group
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                group.getId()
        );

        response.put(
                "groupName",
                group.getGroupName()
        );

        Long managerUserId =
                group.getLeaderUserId();

        // New frontend field
        response.put(
                "managerUserId",
                managerUserId
        );

        // Old compatibility field
        response.put(
                "leaderUserId",
                managerUserId
        );

        User manager = null;

        if (managerUserId != null) {

            manager =
                    userRepository
                            .findById(managerUserId)
                            .orElse(null);
        }

        String managerName =
                getDisplayName(manager);

        String managerUsername =
                manager != null
                        ? manager.getUsername()
                        : null;

        // New frontend fields
        response.put(
                "managerName",
                managerName
        );

        response.put(
                "managerUsername",
                managerUsername
        );

        // Old compatibility fields
        response.put(
                "leaderName",
                managerName
        );

        response.put(
                "leaderUsername",
                managerUsername
        );

        long totalMembers =
                memberRepository.countByGroupId(
                        group.getId()
                );

        // New frontend field
        response.put(
                "totalMembers",
                totalMembers
        );

        // Old compatibility field
        response.put(
                "memberCount",
                totalMembers
        );

        response.put(
                "status",
                group.getStatus()
        );

        return response;
    }

    // =========================================================
    // MANAGER RESPONSE
    // =========================================================

    private Map<String, Object> createManagerResponse(
            User manager
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                manager.getId()
        );

        // Frontend supports fullName
        response.put(
                "fullName",
                getDisplayName(manager)
        );

        // Compatibility field
        response.put(
                "name",
                getDisplayName(manager)
        );

        response.put(
                "username",
                manager.getUsername()
        );

        response.put(
                "role",
                getRoleName(manager)
        );

        return response;
    }

    // =========================================================
    // GROUP MEMBER RESPONSE
    // =========================================================

    private Map<String, Object> createGroupMemberResponse(
            Member member
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                member.getId()
        );

        response.put(
                "customerId",
                member.getCustomerId()
        );

        response.put(
                "name",
                member.getName()
        );

        response.put(
                "phone",
                member.getPhone()
        );

        response.put(
                "address",
                member.getAddress()
        );

        response.put(
                "groupId",
                member.getGroupId()
        );

        response.put(
                "createdByUserId",
                member.getCreatedByUserId()
        );

        return response;
    }

    // =========================================================
    // DISPLAY NAME
    // =========================================================

    private String getDisplayName(
            User user
    ) {

        if (user == null) {
            return "Unknown Manager";
        }

        if (user.getFullName() != null
                && !user.getFullName().trim().isEmpty()) {

            return user.getFullName().trim();
        }

        if (user.getUsername() != null
                && !user.getUsername().trim().isEmpty()) {

            return user.getUsername().trim();
        }

        return "Unknown Manager";
    }

    // =========================================================
    // ROLE NAME
    // =========================================================

    private String getRoleName(
            User user
    ) {

        if (user == null
                || user.getRole() == null
                || user.getRole().getRoleName() == null) {

            return "";
        }

        String roleName =
                user.getRole()
                        .getRoleName()
                        .trim()
                        .toUpperCase();

        if (roleName.startsWith("ROLE_")) {

            roleName =
                    roleName.substring(5);
        }

        return roleName;
    }

    // =========================================================
    // LONG PARSER
    // =========================================================

    private Long parseLong(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number) {
            return ((Number) value).longValue();
        }

        try {

            return Long.parseLong(
                    value.toString().trim()
            );

        } catch (Exception e) {

            return null;
        }
    }
}