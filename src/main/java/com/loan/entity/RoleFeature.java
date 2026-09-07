package com.loan.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "role_features",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"role_id", "feature_id"}
        )
    }
)
public class RoleFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "role_id",
        nullable = false
    )
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "feature_id",
        nullable = false
    )
    private Feature feature;

    @Column(nullable = false)
    private Boolean enabled = true;

    public RoleFeature() {
    }

    // ===============================
    // GETTERS
    // ===============================

    public Long getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    public Feature getFeature() {
        return feature;
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

    public void setRole(Role role) {
        this.role = role;
    }

    public void setFeature(Feature feature) {
        this.feature = feature;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }
}