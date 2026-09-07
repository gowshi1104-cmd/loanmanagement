package com.loan.repository;

import com.loan.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> findByUsernameOrderByCreatedAtDesc(String username);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}