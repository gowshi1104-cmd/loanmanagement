package com.loan.repository;

import com.loan.entity.RefreshToken;
import com.loan.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndRevokedFalse(
            String tokenHash
    );

    void deleteByUser(User user);

    void deleteByUserAndRevokedFalse(User user);
}