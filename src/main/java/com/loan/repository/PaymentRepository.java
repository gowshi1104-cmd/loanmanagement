package com.loan.repository;

import com.loan.entity.Payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    // =========================================================
    // CUSTOMER ID
    // =========================================================

    List<Payment> findByMemberId(
            String memberId
    );

    // =========================================================
    // LOAN ID
    //
    // Example:
    //
    // LOAN3919
    //
    // =========================================================

    List<Payment> findByLoanId(
            String loanId
    );

    // =========================================================
    // LOAN PAYMENT HISTORY
    // LATEST FIRST
    // =========================================================

    List<Payment> findByLoanIdOrderByPaymentDateDesc(
            String loanId
    );

    // =========================================================
    // SUCCESSFUL PAYMENTS
    // =========================================================

    List<Payment> findByLoanIdAndStatus(
            String loanId,
            String status
    );

    // =========================================================
    // SUCCESSFUL PAYMENTS
    // LATEST FIRST
    // =========================================================

    List<Payment>
    findByLoanIdAndStatusOrderByPaymentDateDesc(
            String loanId,
            String status
    );
}