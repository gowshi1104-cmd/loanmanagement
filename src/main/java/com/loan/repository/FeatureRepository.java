package com.loan.repository;

import com.loan.entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FeatureRepository
        extends JpaRepository<Feature, Long> {

    Optional<Feature> findByFeatureKey(String featureKey);

    boolean existsByFeatureKey(String featureKey);
}