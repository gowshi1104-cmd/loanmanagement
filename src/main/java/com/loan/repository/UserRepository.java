package com.loan.repository;

import com.loan.entity.Role;
import com.loan.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // =========================================================
    // FIND USER BY USERNAME
    // =========================================================

    Optional<User> findByUsername(String username);

    // =========================================================
    // CHECK USERNAME EXISTS
    // =========================================================

    boolean existsByUsername(String username);

    // =========================================================
    // FIND LATEST USER BY USERNAME PREFIX
    // Used for automatic username generation
    // =========================================================

    Optional<User> findTopByUsernameStartingWithOrderByUsernameDesc(
            String prefix
    );

    Optional<User> findByEmailIgnoreCase(String email);

    // =========================================================
    // CHECK ROLE IS USED BY ANY USER
    // =========================================================

    boolean existsByRole(Role role);

    // =========================================================
    // GET ALL MANAGERS
    // Used by GroupForm manager dropdown
    // =========================================================

    List<User> findByRoleRoleNameIgnoreCase(String roleName);

    // =========================================================
    // ADMIN DASHBOARD - ROLE COUNTS
    // =========================================================

    @Query("""
            SELECT COUNT(u)
            FROM User u
            WHERE LOWER(u.role.roleName) = LOWER(:roleName)
            """)
    long countByRoleName(
            @Param("roleName") String roleName
    );
}