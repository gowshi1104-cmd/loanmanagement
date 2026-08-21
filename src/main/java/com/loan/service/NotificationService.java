package com.loan.service;

import com.loan.dto.NotificationResponse;
import com.loan.entity.Group;
import com.loan.entity.Member;
import com.loan.entity.Notification;
import com.loan.entity.User;
import com.loan.repository.NotificationRepository;
import com.loan.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    private Notification createNotification(
            User recipient,
            String title,
            String message,
            String type,
            String relatedLoanId
    ) {

        if (recipient == null) {
            throw new IllegalArgumentException(
                    "Notification recipient is required"
            );
        }

        if (recipient.getId() == null) {
            throw new IllegalArgumentException(
                    "Recipient user ID is required"
            );
        }

        Notification notification =
                new Notification();

        notification.setRecipientUserId(
                recipient.getId()
        );

        // Existing DB compatibility
        notification.setUserId(
                recipient.getId()
        );

        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedLoanId(relatedLoanId);
        notification.setRead(false);
        notification.setCreatedAt(
                LocalDateTime.now()
        );

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // NEW MEMBER CREATED
    //
    // ADMIN + MANAGER + STAFF
    // CREATOR EXCLUDED
    // =========================================================

    @Transactional
    public void notifyAllUsersForNewMember(
            Member member,
            User creator
    ) {

        if (member == null || creator == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // Creator should not receive own notification
            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            createNotification(
                    user,
                    "New Member Created",
                    creatorName +
                            " created a new member " +
                            customerName +
                            ". Customer ID: " +
                            member.getCustomerId() +
                            ".",
                    "NEW_MEMBER",
                    null
            );
        }
    }

    // =========================================================
    // NEW MEMBER CREATED WITH GROUP
    //
    // Kept as separate method so existing code does not break.
    // =========================================================

    @Transactional
    public void notifyAllUsersForNewMember(
            Member member,
            User creator,
            String groupName
    ) {

        if (member == null || creator == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        String displayGroupName =
                groupName != null &&
                        !groupName.trim().isEmpty()
                        ? groupName.trim()
                        : "Group";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // Creator excluded
            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            createNotification(
                    user,
                    "New Member Created",
                    creatorName +
                            " created a new member " +
                            customerName +
                            " in group " +
                            displayGroupName +
                            ". Customer ID: " +
                            member.getCustomerId() +
                            ".",
                    "NEW_MEMBER",
                    null
            );
        }
    }

    // =========================================================
    // MEMBER ADDED TO GROUP
    //
    // ADMIN + MANAGER + STAFF
    // CREATOR EXCLUDED
    // =========================================================

    @Transactional
    public void notifyAllUsersForMemberAddedToGroup(
            User creator,
            Member member,
            String groupName
    ) {

        if (creator == null || member == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        String displayGroupName =
                groupName != null &&
                        !groupName.trim().isEmpty()
                        ? groupName.trim()
                        : "Group";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // Creator excluded
            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            createNotification(
                    user,
                    "Member Added to Group",
                    creatorName +
                            " added " +
                            customerName +
                            " to group " +
                            displayGroupName +
                            ". Customer ID: " +
                            member.getCustomerId() +
                            ".",
                    "MEMBER_ADDED_TO_GROUP",
                    null
            );
        }
    }

    // =========================================================
    // OLD METHOD
    //
    // KEPT FOR EXISTING CODE COMPATIBILITY
    // =========================================================

    @Transactional
    public void notifyManagerForMemberAddedToGroup(
            User manager,
            Member member,
            String groupName,
            User creator
    ) {

        if (manager == null ||
                member == null ||
                creator == null) {
            return;
        }

        if (manager.getId() == null ||
                creator.getId() == null) {
            return;
        }

        if (!manager.isEnabled()) {
            return;
        }

        if (manager.getId().equals(
                creator.getId()
        )) {
            return;
        }

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        String displayGroupName =
                groupName != null &&
                        !groupName.trim().isEmpty()
                        ? groupName.trim()
                        : "Group";

        createNotification(
                manager,
                "Member Added to Group",
                customerName +
                        " has been added to " +
                        displayGroupName +
                        ". Customer ID: " +
                        member.getCustomerId() +
                        ".",
                "MEMBER_ADDED_TO_GROUP",
                null
        );
    }

    // =========================================================
    // MEMBER REMOVED FROM GROUP
    //
    // ADMIN + MANAGER + STAFF
    // DELETER EXCLUDED
    // =========================================================

    @Transactional
    public void notifyAllUsersForMemberDeletedFromGroup(
            User creator,
            Member member,
            String groupName
    ) {

        if (creator == null || member == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        String displayGroupName =
                groupName != null &&
                        !groupName.trim().isEmpty()
                        ? groupName.trim()
                        : "Group";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // DELETER EXCLUDED
            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            createNotification(
                    user,
                    "Member Removed from Group",
                    creatorName +
                            " removed " +
                            customerName +
                            " from group " +
                            displayGroupName +
                            ". Customer ID: " +
                            member.getCustomerId() +
                            ".",
                    "MEMBER_REMOVED_FROM_GROUP",
                    null
            );
        }
    }

    // =========================================================
    // MEMBER DELETED
    //
    // ADMIN + MANAGER + STAFF
    // DELETER EXCLUDED
    //
    // THIS IS THE NEW METHOD
    // =========================================================

    @Transactional
    public void notifyAllUsersForMemberDeleted(
            User creator,
            Member member
    ) {

        if (creator == null || member == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String customerName =
                member.getName() != null &&
                        !member.getName().trim().isEmpty()
                        ? member.getName().trim()
                        : "Customer";

        String customerId =
                member.getCustomerId() != null &&
                        !member.getCustomerId().trim().isEmpty()
                        ? member.getCustomerId().trim()
                        : "N/A";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // =================================================
            // DELETER SHOULD NOT RECEIVE OWN NOTIFICATION
            // =================================================

            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            // =================================================
            // ONLY ADMIN / MANAGER / STAFF
            // =================================================

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            // =================================================
            // CREATE NOTIFICATION
            // =================================================

            createNotification(
                    user,
                    "Member Deleted",
                    creatorName +
                            " deleted member " +
                            customerName +
                            ". Customer ID: " +
                            customerId +
                            ".",
                    "MEMBER_DELETED",
                    null
            );
        }
    }

    // =========================================================
    // GROUP DELETED
    //
    // ADMIN + MANAGER + STAFF
    // DELETER EXCLUDED
    // =========================================================

    @Transactional
    public void notifyAllUsersForGroupDeleted(
            User creator,
            Group group
    ) {

        if (creator == null || group == null) {
            return;
        }

        if (creator.getId() == null) {
            return;
        }

        List<User> users =
                userRepository.findAll();

        String creatorName =
                getDisplayName(creator);

        String displayGroupName =
                group.getGroupName() != null &&
                        !group.getGroupName().trim().isEmpty()
                        ? group.getGroupName().trim()
                        : "Group";

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            // DELETER EXCLUDED
            if (user.getId() != null &&
                    user.getId().equals(
                            creator.getId()
                    )) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (!roleName.equals("ADMIN") &&
                    !roleName.equals("MANAGER") &&
                    !roleName.equals("STAFF")) {
                continue;
            }

            createNotification(
                    user,
                    "Group Deleted",
                    creatorName +
                            " deleted group " +
                            displayGroupName +
                            ".",
                    "GROUP_DELETED",
                    null
            );
        }
    }

    // =========================================================
    // STAFF CREATED NEW LOAN
    // =========================================================

    @Transactional
    public void notifyAdminAndManagerForNewLoan(
            String loanId,
            String customerName,
            String staffName
    ) {

        List<User> users =
                userRepository.findAll();

        for (User user : users) {

            if (user == null) {
                continue;
            }

            if (!user.isEnabled()) {
                continue;
            }

            String roleName =
                    getRoleName(user);

            if (roleName.equals("ADMIN") ||
                    roleName.equals("MANAGER")) {

                String displayCustomer =
                        customerName != null &&
                                !customerName.trim().isEmpty()
                                ? customerName
                                : "Customer";

                String displayStaff =
                        staffName != null &&
                                !staffName.trim().isEmpty()
                                ? staffName
                                : "Staff";

                createNotification(
                        user,
                        "New Loan Application",
                        displayStaff +
                                " created a new loan application " +
                                loanId +
                                " for " +
                                displayCustomer +
                                ". Status: PENDING.",
                        "NEW_LOAN",
                        loanId
                );
            }
        }
    }

    // =========================================================
    // LOAN APPROVED
    // =========================================================

    @Transactional
    public void notifyStaffLoanApproved(
            User staff,
            String loanId,
            String customerName
    ) {

        if (staff == null) {
            return;
        }

        if (!staff.isEnabled()) {
            return;
        }

        String displayCustomer =
                customerName != null &&
                        !customerName.trim().isEmpty()
                        ? customerName
                        : "Customer";

        createNotification(
                staff,
                "Loan Approved",
                "Loan " +
                        loanId +
                        " for " +
                        displayCustomer +
                        " has been APPROVED by Admin/Manager.",
                "LOAN_APPROVED",
                loanId
        );
    }

    // =========================================================
    // LOAN REJECTED
    // =========================================================

    @Transactional
    public void notifyStaffLoanRejected(
            User staff,
            String loanId,
            String customerName
    ) {

        if (staff == null) {
            return;
        }

        if (!staff.isEnabled()) {
            return;
        }

        String displayCustomer =
                customerName != null &&
                        !customerName.trim().isEmpty()
                        ? customerName
                        : "Customer";

        createNotification(
                staff,
                "Loan Rejected",
                "Loan " +
                        loanId +
                        " for " +
                        displayCustomer +
                        " has been REJECTED by Admin/Manager.",
                "LOAN_REJECTED",
                loanId
        );
    }

    // =========================================================
    // GET CURRENT USER NOTIFICATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(
            String username
    ) {

        User user =
                findUser(username);

        return notificationRepository
                .findTop50ByRecipientUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(NotificationResponse::new)
                .toList();
    }

    // =========================================================
    // UNREAD COUNT
    // =========================================================

    @Transactional(readOnly = true)
    public long getUnreadCount(
            String username
    ) {

        User user =
                findUser(username);

        return notificationRepository
                .countByRecipientUserIdAndReadFalse(
                        user.getId()
                );
    }

    // =========================================================
    // MARK ONE AS READ
    // =========================================================

    @Transactional
    public NotificationResponse markAsRead(
            Long notificationId,
            String username
    ) {

        User user =
                findUser(username);

        Notification notification =
                notificationRepository
                        .findByIdAndRecipientUserId(
                                notificationId,
                                user.getId()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        Notification saved =
                notificationRepository.save(
                        notification
                );

        return new NotificationResponse(saved);
    }

    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    @Transactional
    public void markAllAsRead(
            String username
    ) {

        User user =
                findUser(username);

        List<Notification> notifications =
                notificationRepository
                        .findTop50ByRecipientUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        for (Notification notification :
                notifications) {

            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }

        notificationRepository.saveAll(
                notifications
        );
    }

    // =========================================================
    // FIND USER
    // =========================================================

    private User findUser(
            String username
    ) {

        if (username == null ||
                username.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authenticated user not found"
            );
        }

        return userRepository
                .findByUsername(username.trim())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User not found"
                        )
                );
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

        if (roleName.startsWith("ROLE_")) {
            roleName =
                    roleName.substring(5);
        }

        return roleName;
    }

    // =========================================================
    // GET DISPLAY NAME
    // =========================================================

    private String getDisplayName(
            User user
    ) {

        if (user == null) {
            return "User";
        }

        if (user.getFullName() != null &&
                !user.getFullName().trim().isEmpty()) {

            return user.getFullName();
        }

        if (user.getUsername() != null &&
                !user.getUsername().trim().isEmpty()) {

            return user.getUsername();
        }

        return "User";
    }
}