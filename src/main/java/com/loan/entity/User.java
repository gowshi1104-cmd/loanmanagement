package com.loan.entity;

import jakarta.persistence.*;

import org.springframework.security.core.GrantedAuthority;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;

import java.util.Collection;

import java.util.List;

@JsonIgnoreProperties({

        "authorities",

        "accountNonExpired",

        "accountNonLocked",

        "credentialsNonExpired"

})

@Entity

@Table(name = "users")

public class User implements UserDetails {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @Column(unique = true, nullable = false)

    private String username;

    @Column(nullable = false)

    @JsonIgnore

    private String password;

    private String fullName;

    private String email;

    @Column(nullable = false)

    private Boolean enabled = true;

    // =========================================================
    // MUST CHANGE PASSWORD
    // Customer created with temporary/default password
    // will have this value as true.
    // =========================================================

    @Column(name = "must_change_password", nullable = false)

    private Boolean mustChangePassword = false;

    @ManyToOne(fetch = FetchType.EAGER)

    @JoinColumn(name = "role_id")

    private Role role;

    // =========================================================
    // REPORTING MANAGER
    // STAFF -> assigned MANAGER
    // MANAGER / ADMIN -> null
    // =========================================================

    @ManyToOne(fetch = FetchType.EAGER)

    @JoinColumn(name = "reporting_manager_id")

    @JsonIgnoreProperties({

            "password",

            "reportingManager",

            "authorities",

            "accountNonExpired",

            "accountNonLocked",

            "credentialsNonExpired"

    })

    private User reportingManager;

    public User() {

    }

    // ===============================
    // GETTERS
    // ===============================

    public Long getId() {

        return id;

    }

    @Override

    public String getUsername() {

        return username;

    }

    @Override

    @JsonIgnore

    public String getPassword() {

        return password;

    }

    public String getFullName() {

        return fullName;

    }

    public String getEmail() {

        return email;

    }

    public Boolean getEnabled() {

        return enabled;

    }

    public Role getRole() {

        return role;

    }

    public User getReportingManager() {

        return reportingManager;

    }

    // =========================================================
    // MUST CHANGE PASSWORD GETTER
    // =========================================================

    public boolean isMustChangePassword() {

        return mustChangePassword != null && mustChangePassword;

    }

    // ===============================
    // SETTERS
    // ===============================

    public void setId(Long id) {

        this.id = id;

    }

    public void setUsername(String username) {

        this.username = username;

    }

    public void setPassword(String password) {

        this.password = password;

    }

    public void setFullName(String fullName) {

        this.fullName = fullName;

    }

    public void setEmail(String email) {

        this.email = email;

    }

    public void setEnabled(Boolean enabled) {

        this.enabled = enabled;

    }

    public void setRole(Role role) {

        this.role = role;

    }

    public void setReportingManager(User reportingManager) {

        this.reportingManager = reportingManager;

    }

    // =========================================================
    // MUST CHANGE PASSWORD SETTER
    // =========================================================

    public void setMustChangePassword(boolean mustChangePassword) {

        this.mustChangePassword = mustChangePassword;

    }

    // ===============================
    // AUTHORITIES
    // ===============================

    @Override

    public Collection<? extends GrantedAuthority> getAuthorities() {

        List<GrantedAuthority> authorities = new ArrayList<>();

        if (role == null) {

            return authorities;

        }

        // Role

        if (role.getRoleName() != null) {

            authorities.add(

                    new SimpleGrantedAuthority(

                            "ROLE_" +

                                    role.getRoleName().toUpperCase()

                    )

            );

        }

        // Permissions

        if (role.getPermissions() != null) {

            role.getPermissions().forEach(permission -> {

                if (permission != null &&

                        permission.getPermissionName() != null) {

                    authorities.add(

                            new SimpleGrantedAuthority(

                                    permission.getPermissionName()

                            )

                    );

                }

            });

        }

        return authorities;

    }

    // ===============================
    // USER DETAILS
    // ===============================

    @Override

    public boolean isAccountNonExpired() {

        return true;

    }

    @Override

    public boolean isAccountNonLocked() {

        return true;

    }

    @Override

    public boolean isCredentialsNonExpired() {

        return true;

    }

    @Override

    public boolean isEnabled() {

        return enabled != null && enabled;

    }

}