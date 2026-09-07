package com.loan.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "features",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "feature_key")
    }
)
public class Feature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "feature_key",
        nullable = false,
        unique = true
    )
    private String featureKey;

    @Column(nullable = false)
    private String featureName;

    @Column(nullable = false)
    private String module;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Boolean enabled = true;

    public Feature() {
    }

    // ===============================
    // GETTERS
    // ===============================

    public Long getId() {
        return id;
    }

    public String getFeatureKey() {
        return featureKey;
    }

    public String getFeatureName() {
        return featureName;
    }

    public String getModule() {
        return module;
    }

    public String getType() {
        return type;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    // ===============================
    // SETTERS
    // ===============================

    public void setId(Long id) {
        this.id = id;
    }

    public void setFeatureKey(String featureKey) {
        this.featureKey = featureKey;
    }

    public void setFeatureName(String featureName) {
        this.featureName = featureName;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}