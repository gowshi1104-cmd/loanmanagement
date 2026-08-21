package com.loan.repository;

import com.loan.entity.CustomerPayment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerPaymentRepository
        extends JpaRepository<CustomerPayment, Long> {

    List<CustomerPayment>
    findByCustomerIdOrderByCreatedAtDesc(
            String customerId
    );

    List<CustomerPayment>
    findByLoanIdOrderByCreatedAtDesc(
            String loanId
    );

    Optional<CustomerPayment>
    findByCashfreeOrderId(
            String cashfreeOrderId
    );

    boolean existsByLoanIdAndStatus(
            String loanId,
            String status
    );
}