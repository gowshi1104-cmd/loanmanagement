package com.loan.repository;

import com.loan.entity.Loan;
import com.loan.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    // =========================================================
    // CUSTOMER NAME SEARCH
    // =========================================================

    List<Loan> findByCustomerName(String customerName);

    List<Loan> findByCreatedBy(User createdBy);

    // =========================================================
    // FIND ALL LOANS OF CUSTOMER
    // =========================================================

    List<Loan> findByCustomerId(String customerId);

    // =========================================================
    // FIND LOAN BY CUSTOMER + STATUS
    // =========================================================

    Optional<Loan> findByCustomerIdAndStatus(
            String customerId,
            String status
    );

    // =========================================================
    // FIND ALL LOANS BY STATUS
    // =========================================================

    List<Loan> findByStatus(String status);

    // =========================================================
    // CUSTOMER SEARCH FOR PAYMENT PAGE
    // =========================================================

    List<Loan> findByStatusAndCustomerNameContainingIgnoreCase(
            String status,
            String customerName
    );

    // =========================================================
    // FIND LOAN BY SYSTEM GENERATED LOAN ID
    // =========================================================

    Optional<Loan> findByLoanId(String loanId);

    // =========================================================
    // CHECK DUPLICATE LOAN ID
    // =========================================================

    boolean existsByLoanId(String loanId);

    // =========================================================
    // COUNT CUSTOMER LOANS BY STATUS
    // =========================================================

    long countByCustomerIdAndStatus(
            String customerId,
            String status
    );

    // =========================================================
    // FIND CUSTOMER ACTIVE/BLOCKING LOANS
    // =========================================================

    List<Loan> findByCustomerIdAndStatusIn(
            String customerId,
            List<String> statuses
    );

    // =========================================================
    // CHECK CUSTOMER LOAN WITH SPECIFIC STATUS
    // =========================================================

    boolean existsByCustomerIdAndStatus(
            String customerId,
            String status
    );

    // =========================================================
    // FIND CUSTOMER LOANS BY MULTIPLE STATUS
    // =========================================================

    List<Loan> findByCustomerIdAndStatusInOrderByLoanDateDesc(
            String customerId,
            List<String> statuses
    );

    // =========================================================
    // CUSTOMER LOAN HISTORY
    // =========================================================

    List<Loan> findByCustomerIdOrderByLoanDateDesc(
            String customerId
    );

    // =========================================================
    // ADMIN / MANAGER DASHBOARD
    // COUNT BY STATUS
    // =========================================================

    long countByStatusIgnoreCase(String status);

    // =========================================================
    // ADMIN / MANAGER DASHBOARD
    // RECENT 10 LOANS
    // =========================================================

    List<Loan> findTop10ByOrderByLoanDateDesc();

    // =========================================================
    // STAFF DASHBOARD
    // TOTAL LOANS CREATED BY STAFF
    // =========================================================

    long countByCreatedBy(User createdBy);

    // =========================================================
    // STAFF DASHBOARD
    // COUNT LOANS BY STAFF + STATUS
    // =========================================================

    long countByCreatedByAndStatusIgnoreCase(
            User createdBy,
            String status
    );

    // =========================================================
    // STAFF DASHBOARD
    // RECENT 10 LOANS CREATED BY STAFF
    // =========================================================

    List<Loan> findTop10ByCreatedByOrderByLoanDateDesc(
            User createdBy
    );
}