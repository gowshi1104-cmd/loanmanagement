package com.loan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "members", uniqueConstraints = {
        @UniqueConstraint(name = "uk_member_customer_id", columnNames = "customer_id"),
        @UniqueConstraint(name = "uk_member_identity", columnNames = {
                "name",
                "address",
                "pan_number",
                "aadhar_number"
        })
})
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // CUSTOMER ID
    // =========================================================

    @Column(name = "customer_id", unique = true, nullable = false)
    private String customerId;

    // =========================================================
    // MEMBER DETAILS
    // =========================================================

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false, length = 1000)
    private String address;

    @Column(name = "pan_number", nullable = false, length = 20)
    private String panNumber;

    @Column(name = "aadhar_number", nullable = false, length = 30)
    private String aadharNumber;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "group_name")
    private String groupName;

    @Column
    private String status;

    // =========================================================
    // DOCUMENT
    // =========================================================

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "document_file_path")
    @JsonIgnore
    private String documentFilePath;

    // =========================================================
    // CREATED BY USER
    // =========================================================
    //
    // Important:
    // This stores the actual User ID who created the member.
    //
    // Example:
    // Ajay user ID = 15
    // createdByUserId = 15
    //
    // =========================================================

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Member() {
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getPanNumber() {
        return panNumber;
    }

    public String getAadharNumber() {
        return aadharNumber;
    }

    public Long getGroupId() {
        return groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public String getStatus() {
        return status;
    }

    public String getDocumentFileName() {
        return documentFileName;
    }

    public String getDocumentFilePath() {
        return documentFilePath;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public void setAadharNumber(String aadharNumber) {
        this.aadharNumber = aadharNumber;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDocumentFileName(String documentFileName) {
        this.documentFileName = documentFileName;
    }

    public void setDocumentFilePath(String documentFilePath) {
        this.documentFilePath = documentFilePath;
    }

    public void setCreatedByUserId(Long createdByUserId) {
        this.createdByUserId = createdByUserId;
    }
}