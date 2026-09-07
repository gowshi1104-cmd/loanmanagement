package com.loan.repository;

import com.loan.entity.RoleFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoleFeatureRepository
        extends JpaRepository<RoleFeature, Long> {

    List<RoleFeature> findByRoleId(Long roleId);

    List<RoleFeature> findByFeatureId(Long featureId);

    Optional<RoleFeature> findByRoleIdAndFeatureId(
            Long roleId,
            Long featureId
    );

    boolean existsByRoleIdAndFeatureId(
            Long roleId,
            Long featureId
    );
}