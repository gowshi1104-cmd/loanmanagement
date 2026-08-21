package com.loan.repository;

import com.loan.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findTop50ByRecipientUserIdOrderByCreatedAtDesc(
            Long recipientUserId
    );

    long countByRecipientUserIdAndReadFalse(
            Long recipientUserId
    );

    Optional<Notification>
    findByIdAndRecipientUserId(
            Long id,
            Long recipientUserId
    );
}