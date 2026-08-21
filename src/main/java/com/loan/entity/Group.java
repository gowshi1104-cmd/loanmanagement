package com.loan.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "loan_groups",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_group_name",
                        columnNames = "group_name"
                )
        }
)
public class Group {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // GROUP NAME
    // =========================================================

    @Column(
            name = "group_name",
            nullable = false,
            unique = true
    )
    private String groupName;

    // =========================================================
    // GROUP LEADER
    //
    // Stores USER ID of the Manager
    // =========================================================

    @Column(
            name = "leader_user_id",
            nullable = false
    )
    private Long leaderUserId;

    // =========================================================
    // STATUS
    // =========================================================

    @Column(
            nullable = false
    )
    private String status = "ACTIVE";

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Group() {
    }

    public Group(
            String groupName,
            Long leaderUserId,
            String status
    ) {
        this.groupName = groupName;
        this.leaderUserId = leaderUserId;
        this.status = status;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getGroupName() {
        return groupName;
    }

    public Long getLeaderUserId() {
        return leaderUserId;
    }

    public String getStatus() {
        return status;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public void setLeaderUserId(Long leaderUserId) {
        this.leaderUserId = leaderUserId;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}