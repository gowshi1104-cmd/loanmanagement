package com.loan.repository;

import com.loan.entity.Member;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    // =========================================================
    // CUSTOMER ID
    // =========================================================

    Optional<Member> findByCustomerId(
            String customerId
    );

    boolean existsByCustomerId(
            String customerId
    );

    // =========================================================
    // DUPLICATE MEMBER CHECK
    // Name + Address + PAN + Aadhaar
    // =========================================================

    Optional<Member> findFirstByNameIgnoreCaseAndAddressIgnoreCaseAndPanNumberIgnoreCaseAndAadharNumberIgnoreCase(
            String name,
            String address,
            String panNumber,
            String aadharNumber
    );

    boolean existsByNameIgnoreCaseAndAddressIgnoreCaseAndPanNumberIgnoreCaseAndAadharNumberIgnoreCase(
            String name,
            String address,
            String panNumber,
            String aadharNumber
    );

    // =========================================================
    // MEMBERS CREATED BY USER
    // =========================================================

    List<Member> findByCreatedByUserId(
            Long createdByUserId
    );

    long countByCreatedByUserId(
            Long createdByUserId
    );

    // =========================================================
    // MEMBERS ASSIGNED TO STAFF
    //
    // IMPORTANT:
    // Staff must see customers assigned to them,
    // regardless of who created the customer.
    // =========================================================

    List<Member> findByAssignedStaffUserId(
            Long assignedStaffUserId
    );

    // =========================================================
    // GROUP NAME
    // =========================================================

    long countByGroupName(
            String groupName
    );

    // =========================================================
    // GROUP ID
    // =========================================================

    List<Member> findByGroupId(
            Long groupId
    );

    long countByGroupId(
            Long groupId
    );
}