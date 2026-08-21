package com.loan.repository;

import com.loan.entity.Group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupRepository
        extends JpaRepository<Group, Long> {

    // =========================================================
    // GROUP NAME
    // =========================================================

    Optional<Group> findByGroupNameIgnoreCase(
            String groupName
    );

    boolean existsByGroupNameIgnoreCase(
            String groupName
    );

    // =========================================================
    // MANAGER / LEADER
    // =========================================================

    List<Group> findByLeaderUserId(
            Long leaderUserId
    );

    List<Group> findByLeaderUserIdAndStatus(
            Long leaderUserId,
            String status
    );

    // =========================================================
    // STATUS
    // =========================================================

    List<Group> findByStatus(
            String status
    );

    // =========================================================
    // GROUP LOOKUP
    // =========================================================

    Optional<Group> findByIdAndLeaderUserId(
            Long id,
            Long leaderUserId
    );
}