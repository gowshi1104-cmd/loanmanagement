package com.loan.service;

import com.loan.entity.Group;
import com.loan.entity.Member;
import com.loan.entity.Role;
import com.loan.entity.User;

import com.loan.repository.GroupRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.RoleRepository;
import com.loan.repository.UserRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MemberService {

        // =========================================================
        // REPOSITORIES / SERVICES
        // =========================================================

        private final MemberRepository memberRepository;

        private final UserRepository userRepository;

        private final RoleRepository roleRepository;

        private final NotificationService notificationService;

        private final GroupRepository groupRepository;

        private final PasswordEncoder passwordEncoder;

        // =========================================================
        // UPLOAD DIRECTORY
        // =========================================================

        private final Path uploadPath = Paths.get("uploads/members");

        // =========================================================
        // MAX FILE SIZE
        // =========================================================

        private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

        // =========================================================
        // CONSTRUCTOR
        // =========================================================

        public MemberService(

                        MemberRepository memberRepository,

                        UserRepository userRepository,

                        RoleRepository roleRepository,

                        NotificationService notificationService,

                        GroupRepository groupRepository,

                        PasswordEncoder passwordEncoder

        ) {

                this.memberRepository = memberRepository;

                this.userRepository = userRepository;

                this.roleRepository = roleRepository;

                this.notificationService = notificationService;

                this.groupRepository = groupRepository;

                this.passwordEncoder = passwordEncoder;

                try {

                        Files.createDirectories(
                                        uploadPath);

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "Could not create upload directory",
                                        e);
                }
        }

        // =========================================================
        // GET ALL MEMBERS
        //
        // ADMIN / MANAGER -> ALL MEMBERS
        // STAFF -> OWN CREATED MEMBERS ONLY
        // =========================================================

        public ResponseEntity<?> getAllMembers(

                        Authentication authentication

        ) {

                User currentUser = getAuthenticatedUser(
                                authentication);

                if (currentUser == null) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.UNAUTHORIZED)
                                        .body(
                                                        "Authentication required");
                }

                String roleName = getRoleName(
                                currentUser);

                // =====================================================
                // ADMIN / MANAGER
                //
                // Can see ALL customers.
                // =====================================================

                if (roleName.equals("ADMIN")
                                || roleName.equals("MANAGER")) {

                        return ResponseEntity.ok(
                                        memberRepository.findAll());
                }

                // =====================================================
                // STAFF
                //
                // IMPORTANT:
                //
                // Show ALL customers assigned to this staff.
                //
                // It does NOT matter who created the customer.
                //
                // Staff creates customer:
                // assignedStaffUserId = current staff ID
                //
                // Admin creates customer:
                // assignedStaffUserId = selected staff ID
                //
                // Manager creates customer:
                // assignedStaffUserId = selected staff ID
                //
                // Therefore staff must query by
                // assignedStaffUserId, NOT createdByUserId.
                // =====================================================

                if (roleName.equals("STAFF")) {

                        return ResponseEntity.ok(
                                        memberRepository
                                                        .findByAssignedStaffUserId(
                                                                        currentUser.getId()));
                }

                // =====================================================
                // OTHER ROLES
                // =====================================================

                return ResponseEntity
                                .status(
                                                HttpStatus.FORBIDDEN)
                                .body(
                                                "You are not allowed to view members");
        }

        // =========================================================
        // GET MEMBER BY CUSTOMER ID
        // =========================================================

        public ResponseEntity<?> getMemberByCustomerId(

                        String customerId

        ) {

                if (customerId == null
                                || customerId.trim().isEmpty()) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Customer ID is required");
                }

                String normalizedCustomerId = customerId.trim();

                return memberRepository
                                .findByCustomerId(
                                                normalizedCustomerId)
                                .<ResponseEntity<?>>map(
                                                member -> ResponseEntity.ok(
                                                                member))
                                .orElseGet(
                                                () -> ResponseEntity
                                                                .status(
                                                                                HttpStatus.NOT_FOUND)
                                                                .body(
                                                                                "Customer not found"));
        }

        // =========================================================
        // VIEW CUSTOMER DOCUMENT
        // =========================================================

        public ResponseEntity<?> viewCustomerDocument(

                        String customerId

        ) {

                return getDocument(
                                customerId,
                                false);
        }

        // =========================================================
        // DOWNLOAD CUSTOMER DOCUMENT
        // =========================================================

        public ResponseEntity<?> downloadCustomerDocument(

                        String customerId

        ) {

                return getDocument(
                                customerId,
                                true);
        }

        // =========================================================
        // COMMON DOCUMENT HANDLER
        // =========================================================

        private ResponseEntity<?> getDocument(

                        String customerId,

                        boolean download

        ) {

                try {

                        if (customerId == null
                                        || customerId.trim().isEmpty()) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Customer ID is required");
                        }

                        Member member = memberRepository
                                        .findByCustomerId(
                                                        customerId.trim())
                                        .orElse(null);

                        if (member == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Customer not found");
                        }

                        String documentPath = member.getDocumentFilePath();

                        if (documentPath == null
                                        || documentPath.trim().isEmpty()) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Customer document not found");
                        }

                        Path filePath = Paths.get(
                                        documentPath);

                        if (!Files.exists(filePath)) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Document file not found");
                        }

                        if (!Files.isReadable(filePath)) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.INTERNAL_SERVER_ERROR)
                                                .body(
                                                                "Document file cannot be read");
                        }

                        Resource resource = new UrlResource(
                                        filePath.toUri());

                        if (!resource.exists()
                                        || !resource.isReadable()) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Document file cannot be read");
                        }

                        String contentType = Files.probeContentType(
                                        filePath);

                        if (contentType == null
                                        || contentType.isBlank()) {

                                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                        }

                        MediaType mediaType;

                        try {

                                mediaType = MediaType.parseMediaType(
                                                contentType);

                        } catch (Exception e) {

                                mediaType = MediaType.APPLICATION_OCTET_STREAM;
                        }

                        String fileName = member.getDocumentFileName();

                        if (fileName == null
                                        || fileName.trim().isEmpty()) {

                                fileName = "member-document";
                        }

                        ContentDisposition disposition;

                        if (download) {

                                disposition = ContentDisposition
                                                .attachment()
                                                .filename(
                                                                fileName)
                                                .build();

                        } else {

                                disposition = ContentDisposition
                                                .inline()
                                                .filename(
                                                                fileName)
                                                .build();
                        }

                        return ResponseEntity
                                        .ok()
                                        .contentType(
                                                        mediaType)
                                        .header(
                                                        HttpHeaders.CONTENT_DISPOSITION,
                                                        disposition.toString())
                                        .body(
                                                        resource);

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        download
                                                                        ? "Failed to download customer document"
                                                                        : "Failed to load customer document");
                }
        }

        // =========================================================
        // CREATE MEMBER / CUSTOMER
        //
        // TASK 1
        //
        // 1. Generate Customer ID
        // 2. Create Customer
        // 3. Auto create CUSTOMER user
        //
        // TASK 2
        //
        // STAFF:
        // Automatically assigned to current staff.
        //
        // ADMIN / MANAGER:
        // Must select a staff member.
        //
        // =========================================================

        @Transactional
        public ResponseEntity<?> createMember(

                        String name,

                        String phone,

                        String address,

                        String panNumber,

                        String aadharNumber,

                        Long groupId,

                        String groupName,

                        String status,

                        Long assignedStaffUserId,

                        MultipartFile document,

                        Authentication authentication

        ) {

                try {

                        // =====================================================
                        // AUTHENTICATION
                        // =====================================================

                        User currentUser = getAuthenticatedUser(
                                        authentication);

                        if (currentUser == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.UNAUTHORIZED)
                                                .body(
                                                                "Authenticated user not found");
                        }

                        // =====================================================
                        // ROLE CHECK
                        // =====================================================

                        String roleName = getRoleName(
                                        currentUser);

                        if (!isStaffAdminManager(
                                        roleName)) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You are not allowed to create members");
                        }

                        // =====================================================
                        // VALIDATION
                        // =====================================================

                        if (isBlank(name)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Member name is required");
                        }

                        if (isBlank(address)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Address is required");
                        }

                        if (isBlank(panNumber)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "PAN number is required");
                        }

                        if (isBlank(aadharNumber)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Aadhaar number is required");
                        }

                        // =====================================================
                        // NORMALIZE
                        // =====================================================

                        String normalizedName = name.trim();

                        String normalizedAddress = address.trim();

                        String normalizedPan = panNumber
                                        .trim()
                                        .toUpperCase();

                        String normalizedAadhar = aadharNumber.trim();

                        // =====================================================
                        // VERIFY GROUP
                        // =====================================================

                        if (groupId == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Group is required");
                        }

                        Group selectedGroup = groupRepository
                                        .findById(
                                                        groupId)
                                        .orElse(null);

                        if (selectedGroup == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Selected group not found");
                        }

                        if (!"ACTIVE".equalsIgnoreCase(
                                        safeString(
                                                        selectedGroup.getStatus()))) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Selected group is inactive");
                        }

                        // =====================================================
                        // DUPLICATE CHECK
                        // =====================================================

                        Member existingMember = memberRepository
                                        .findFirstByNameIgnoreCaseAndAddressIgnoreCaseAndPanNumberIgnoreCaseAndAadharNumberIgnoreCase(
                                                        normalizedName,
                                                        normalizedAddress,
                                                        normalizedPan,
                                                        normalizedAadhar)
                                        .orElse(null);

                        if (existingMember != null) {

                                User createdBy = existingMember.getCreatedByUserId() != null
                                                ? userRepository
                                                                .findById(
                                                                                existingMember
                                                                                                .getCreatedByUserId())
                                                                .orElse(null)
                                                : null;

                                String creatorName = getDisplayName(
                                                createdBy);

                                Map<String, Object> response = new LinkedHashMap<>();

                                response.put(
                                                "duplicate",
                                                true);

                                response.put(
                                                "message",
                                                "Member already exists. This member was already created by "
                                                                + creatorName
                                                                + ".");

                                response.put(
                                                "customerId",
                                                existingMember.getCustomerId());

                                response.put(
                                                "createdByUserId",
                                                existingMember.getCreatedByUserId());

                                response.put(
                                                "createdByName",
                                                creatorName);

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.CONFLICT)
                                                .body(
                                                                response);
                        }

                        // =====================================================
                        // DOCUMENT REQUIRED
                        // =====================================================

                        if (document == null
                                        || document.isEmpty()) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Member document is required");
                        }

                        // =====================================================
                        // FILE SIZE
                        // =====================================================

                        if (document.getSize() > MAX_FILE_SIZE) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Document size must not exceed 5 MB");
                        }

                        // =====================================================
                        // FILE TYPE
                        // =====================================================

                        if (!isAllowedFileType(
                                        document.getContentType())) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Only PDF, JPG, JPEG and PNG files are allowed");
                        }

                        // =====================================================
                        // CUSTOMER ID
                        // =====================================================

                        String customerId = generateCustomerId();

                        // =====================================================
                        // CREATE MEMBER
                        // =====================================================

                        Member member = new Member();

                        member.setCustomerId(
                                        customerId);

                        member.setName(
                                        normalizedName);

                        member.setPhone(
                                        safeTrim(
                                                        phone));

                        member.setAddress(
                                        normalizedAddress);

                        member.setPanNumber(
                                        normalizedPan);

                        member.setAadharNumber(
                                        normalizedAadhar);

                        member.setGroupId(
                                        selectedGroup.getId());

                        member.setGroupName(
                                        selectedGroup.getGroupName());

                        member.setStatus(
                                        isBlank(status)
                                                        ? "ACTIVE"
                                                        : status
                                                                        .trim()
                                                                        .toUpperCase());

                        // =====================================================
                        // CREATED BY
                        //
                        // Never use assigned staff here.
                        //
                        // This is the actual logged-in user
                        // who created the customer.
                        // =====================================================

                        member.setCreatedByUserId(
                                        currentUser.getId());

                        // =====================================================
                        // TASK 2
                        // ASSIGN STAFF
                        // =====================================================

                        Long finalAssignedStaffUserId;

                        // -----------------------------------------------------
                        // STAFF
                        //
                        // Staff creates customer
                        // -> automatically assigned to same staff
                        // -----------------------------------------------------

                        if ("STAFF".equals(
                                        roleName)) {

                                finalAssignedStaffUserId = currentUser.getId();
                        }

                        // -----------------------------------------------------
                        // ADMIN / MANAGER
                        //
                        // Must select staff from dropdown
                        // -----------------------------------------------------

                        else if ("ADMIN".equals(roleName)
                                        || "MANAGER".equals(roleName)) {

                                if (assignedStaffUserId == null) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Please assign a staff member");
                                }

                                User assignedStaff = userRepository
                                                .findById(
                                                                assignedStaffUserId)
                                                .orElse(null);

                                if (assignedStaff == null) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Selected staff not found");
                                }

                                String assignedUserRole = getRoleName(
                                                assignedStaff);

                                if (!"STAFF".equals(
                                                assignedUserRole)) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Only a staff user can be assigned");
                                }

                                if (!Boolean.TRUE.equals(
                                                assignedStaff.getEnabled())) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Selected staff user is inactive");
                                }

                                finalAssignedStaffUserId = assignedStaff.getId();
                        }

                        else {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You are not allowed to assign staff");
                        }

                        // =====================================================
                        // SAVE ASSIGNED STAFF ID
                        // =====================================================

                        member.setAssignedStaffUserId(
                                        finalAssignedStaffUserId);

                        // =====================================================
                        // FILE NAME
                        // =====================================================

                        String originalFileName = document.getOriginalFilename();

                        if (isBlank(originalFileName)) {

                                originalFileName = "document";
                        }

                        originalFileName = Paths.get(
                                        originalFileName)
                                        .getFileName()
                                        .toString();

                        // =====================================================
                        // FILE EXTENSION
                        // =====================================================

                        String extension = getFileExtension(
                                        originalFileName);

                        // =====================================================
                        // STORED FILE
                        // =====================================================

                        String storedFileName = UUID.randomUUID()
                                        + extension;

                        Path filePath = uploadPath.resolve(
                                        storedFileName);

                        // =====================================================
                        // SAVE FILE
                        // =====================================================

                        Files.copy(
                                        document.getInputStream(),
                                        filePath,
                                        StandardCopyOption.REPLACE_EXISTING);

                        // =====================================================
                        // DOCUMENT DETAILS
                        // =====================================================

                        member.setDocumentFileName(
                                        originalFileName);

                        member.setDocumentFilePath(
                                        filePath
                                                        .toAbsolutePath()
                                                        .toString());

                        // =====================================================
                        // SAVE MEMBER
                        // =====================================================

                        Member savedMember = memberRepository.save(
                                        member);

                        // =====================================================
                        // TASK 1
                        // AUTO CREATE CUSTOMER USER
                        // =====================================================

                        String temporaryPassword = generateTemporaryPassword();

                        if (userRepository
                                        .findByUsername(
                                                        customerId)
                                        .isPresent()) {

                                throw new RuntimeException(
                                                "Customer user already exists for Customer ID: "
                                                                + customerId);
                        }

                        Role customerRole = roleRepository
                                        .findByRoleNameIgnoreCase(
                                                        "CUSTOMER")
                                        .orElseThrow(
                                                        () -> new RuntimeException(
                                                                        "CUSTOMER role is not configured"));

                        User customerUser = new User();

                        customerUser.setUsername(
                                        customerId);

                        customerUser.setFullName(
                                        normalizedName);

                        customerUser.setPassword(
                                        passwordEncoder.encode(
                                                        temporaryPassword));

                        customerUser.setRole(
                                        customerRole);

                        customerUser.setEnabled(
                                        true);

                        customerUser.setMustChangePassword(
                                        true);

                        User savedCustomerUser = userRepository.save(
                                        customerUser);

                        // =====================================================
                        // NOTIFICATION
                        // =====================================================

                        notificationService
                                        .notifyAllUsersForNewMember(
                                                        savedMember,
                                                        currentUser);

                        // =====================================================
                        // RESPONSE
                        // =====================================================

                        Map<String, Object> response = new LinkedHashMap<>();

                        response.put(
                                        "member",
                                        savedMember);

                        response.put(
                                        "customerId",
                                        savedMember.getCustomerId());

                        response.put(
                                        "username",
                                        savedCustomerUser.getUsername());

                        response.put(
                                        "temporaryPassword",
                                        temporaryPassword);

                        response.put(
                                        "userId",
                                        savedCustomerUser.getId());

                        response.put(
                                        "createdByUserId",
                                        savedMember.getCreatedByUserId());

                        response.put(
                                        "assignedStaffUserId",
                                        savedMember.getAssignedStaffUserId());

                        response.put(
                                        "message",
                                        "Customer created successfully and customer user account was created");

                        return ResponseEntity.ok(
                                        response);

                } catch (IOException e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to upload member document");

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to create member: "
                                                                        + e.getMessage());
                }
        }

        // =========================================================
        // GET MEMBER BY DATABASE ID
        //
        // ADMIN / MANAGER -> ALL
        // STAFF -> OWN CREATED MEMBER
        // =========================================================

        public ResponseEntity<?> getMemberById(

                        Long id,

                        Authentication authentication

        ) {

                User currentUser = getAuthenticatedUser(
                                authentication);

                if (currentUser == null) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.UNAUTHORIZED)
                                        .body(
                                                        "Authentication required");
                }

                if (id == null) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(
                                                        "Member ID is required");
                }

                Member member = memberRepository
                                .findById(id)
                                .orElse(null);

                if (member == null) {

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.NOT_FOUND)
                                        .body(
                                                        "Member not found");
                }

                String roleName = getRoleName(
                                currentUser);

                // =====================================================
                // ADMIN / MANAGER
                // =====================================================

                if (roleName.equals("ADMIN")
                                || roleName.equals("MANAGER")) {

                        return ResponseEntity.ok(
                                        createMemberViewResponse(
                                                        member));
                }

                // =====================================================
                // STAFF
                // =====================================================

                if (roleName.equals("STAFF")
                                && currentUser.getId() != null
                                && currentUser.getId().equals(
                                                member.getCreatedByUserId())) {

                        return ResponseEntity.ok(
                                        createMemberViewResponse(
                                                        member));
                }

                return ResponseEntity
                                .status(
                                                HttpStatus.FORBIDDEN)
                                .body(
                                                "You are not allowed to view this member");
        }

        // =========================================================
        // MEMBER VIEW RESPONSE
        // =========================================================

        private Map<String, Object> createMemberViewResponse(

                        Member member

        ) {

                Map<String, Object> response = new LinkedHashMap<>();

                response.put(
                                "id",
                                member.getId());

                response.put(
                                "customerId",
                                member.getCustomerId());

                response.put(
                                "name",
                                member.getName());

                response.put(
                                "phone",
                                member.getPhone());

                response.put(
                                "address",
                                member.getAddress());

                response.put(
                                "panNumber",
                                member.getPanNumber());

                response.put(
                                "aadharNumber",
                                member.getAadharNumber());

                response.put(
                                "groupId",
                                member.getGroupId());

                response.put(
                                "groupName",
                                member.getGroupName());

                response.put(
                                "status",
                                member.getStatus());

                response.put(
                                "documentFileName",
                                member.getDocumentFileName());

                response.put(
                                "documentFilePath",
                                member.getDocumentFilePath());

                // =====================================================
                // CREATED BY DETAILS
                // =====================================================

                Long createdByUserId = member.getCreatedByUserId();

                response.put(
                                "createdByUserId",
                                createdByUserId);

                User createdByUser = null;

                if (createdByUserId != null) {

                        createdByUser = userRepository
                                        .findById(
                                                        createdByUserId)
                                        .orElse(null);
                }

                response.put(
                                "createdByName",
                                getDisplayName(
                                                createdByUser));

                response.put(
                                "createdByUsername",
                                createdByUser != null
                                                ? createdByUser.getUsername()
                                                : null);

                response.put(
                                "createdByRole",
                                createdByUser != null
                                                ? getRoleName(
                                                                createdByUser)
                                                : null);

                // =====================================================
                // TASK 2
                // ASSIGNED STAFF DETAILS
                // =====================================================

                Long assignedStaffUserId = member.getAssignedStaffUserId();

                response.put(
                                "assignedStaffUserId",
                                assignedStaffUserId);

                User assignedStaffUser = null;

                if (assignedStaffUserId != null) {

                        assignedStaffUser = userRepository
                                        .findById(
                                                        assignedStaffUserId)
                                        .orElse(null);
                }

                response.put(
                                "assignedStaffName",
                                assignedStaffUser != null
                                                ? getDisplayName(
                                                                assignedStaffUser)
                                                : null);

                response.put(
                                "assignedStaffUsername",
                                assignedStaffUser != null
                                                ? assignedStaffUser.getUsername()
                                                : null);

                response.put(
                                "assignedStaffRole",
                                assignedStaffUser != null
                                                ? getRoleName(
                                                                assignedStaffUser)
                                                : null);

                return response;
        }

        // =========================================================
        // UPDATE MEMBER
        //
        // STAFF -> OWN MEMBER
        // ADMIN / MANAGER -> ANY MEMBER
        //
        // createdByUserId NEVER changes.
        // assignedStaffUserId also remains unchanged here.
        //
        // =========================================================

        public ResponseEntity<?> updateMember(

                        Long id,

                        String name,

                        String phone,

                        String address,

                        String panNumber,

                        String aadharNumber,

                        Long groupId,

                        String groupName,

                        String status,

                        MultipartFile document,

                        Authentication authentication

        ) {

                try {

                        User currentUser = getAuthenticatedUser(
                                        authentication);

                        if (currentUser == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.UNAUTHORIZED)
                                                .body(
                                                                "User not found");
                        }

                        if (id == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Member ID is required");
                        }

                        Member member = memberRepository
                                        .findById(id)
                                        .orElse(null);

                        if (member == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Member not found");
                        }

                        String roleName = getRoleName(
                                        currentUser);

                        if (!isStaffAdminManager(
                                        roleName)) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You are not allowed to update members");
                        }

                        // =====================================================
                        // STAFF OWNERSHIP
                        // =====================================================

                        if (roleName.equals("STAFF")) {

                                if (currentUser.getId() == null
                                                || !currentUser.getId().equals(
                                                                member.getCreatedByUserId())) {

                                        return ResponseEntity
                                                        .status(
                                                                        HttpStatus.FORBIDDEN)
                                                        .body(
                                                                        "You can update only members created by you");
                                }
                        }

                        // =====================================================
                        // VALIDATION
                        // =====================================================

                        if (isBlank(name)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Member name is required");
                        }

                        if (isBlank(address)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Address is required");
                        }

                        if (isBlank(panNumber)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "PAN number is required");
                        }

                        if (isBlank(aadharNumber)) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Aadhaar number is required");
                        }

                        // =====================================================
                        // NORMALIZE
                        // =====================================================

                        String normalizedName = name.trim();

                        String normalizedAddress = address.trim();

                        String normalizedPan = panNumber
                                        .trim()
                                        .toUpperCase();

                        String normalizedAadhar = aadharNumber.trim();

                        // =====================================================
                        // DUPLICATE CHECK
                        // =====================================================

                        Member duplicate = memberRepository
                                        .findFirstByNameIgnoreCaseAndAddressIgnoreCaseAndPanNumberIgnoreCaseAndAadharNumberIgnoreCase(
                                                        normalizedName,
                                                        normalizedAddress,
                                                        normalizedPan,
                                                        normalizedAadhar)
                                        .orElse(null);

                        if (duplicate != null
                                        && duplicate.getId() != null
                                        && !duplicate.getId().equals(
                                                        member.getId())) {

                                User createdBy = null;

                                if (duplicate.getCreatedByUserId() != null) {

                                        createdBy = userRepository
                                                        .findById(
                                                                        duplicate
                                                                                        .getCreatedByUserId())
                                                        .orElse(null);
                                }

                                Map<String, Object> response = new LinkedHashMap<>();

                                response.put(
                                                "duplicate",
                                                true);

                                response.put(
                                                "message",
                                                "Another member already exists with the same Name, Address, PAN and Aadhaar.");

                                response.put(
                                                "customerId",
                                                duplicate.getCustomerId());

                                response.put(
                                                "createdByUserId",
                                                duplicate.getCreatedByUserId());

                                response.put(
                                                "createdByName",
                                                getDisplayName(
                                                                createdBy));

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.CONFLICT)
                                                .body(
                                                                response);
                        }

                        // =====================================================
                        // VERIFY GROUP
                        // =====================================================

                        if (groupId == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Group is required");
                        }

                        Group selectedGroup = groupRepository
                                        .findById(
                                                        groupId)
                                        .orElse(null);

                        if (selectedGroup == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Selected group not found");
                        }

                        if (!"ACTIVE".equalsIgnoreCase(
                                        safeString(
                                                        selectedGroup.getStatus()))) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Selected group is inactive");
                        }

                        // =====================================================
                        // UPDATE BASIC DETAILS
                        // =====================================================

                        member.setName(
                                        normalizedName);

                        member.setPhone(
                                        safeTrim(
                                                        phone));

                        member.setAddress(
                                        normalizedAddress);

                        member.setPanNumber(
                                        normalizedPan);

                        member.setAadharNumber(
                                        normalizedAadhar);

                        // =====================================================
                        // GROUP
                        // =====================================================

                        member.setGroupId(
                                        selectedGroup.getId());

                        member.setGroupName(
                                        selectedGroup.getGroupName());

                        // =====================================================
                        // STATUS
                        // =====================================================

                        if (!isBlank(status)) {

                                member.setStatus(
                                                status
                                                                .trim()
                                                                .toUpperCase());
                        }

                        // =====================================================
                        // DOCUMENT UPDATE
                        // =====================================================

                        if (document != null
                                        && !document.isEmpty()) {

                                if (document.getSize() > MAX_FILE_SIZE) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Document size must not exceed 5 MB");
                                }

                                if (!isAllowedFileType(
                                                document.getContentType())) {

                                        return ResponseEntity
                                                        .badRequest()
                                                        .body(
                                                                        "Only PDF, JPG, JPEG and PNG files are allowed");
                                }

                                String originalFileName = document.getOriginalFilename();

                                if (isBlank(originalFileName)) {

                                        originalFileName = "document";
                                }

                                originalFileName = Paths.get(
                                                originalFileName)
                                                .getFileName()
                                                .toString();

                                String extension = getFileExtension(
                                                originalFileName);

                                String storedFileName = UUID.randomUUID()
                                                + extension;

                                Path newFilePath = uploadPath.resolve(
                                                storedFileName);

                                Files.copy(
                                                document.getInputStream(),
                                                newFilePath,
                                                StandardCopyOption.REPLACE_EXISTING);

                                String oldFilePath = member.getDocumentFilePath();

                                member.setDocumentFileName(
                                                originalFileName);

                                member.setDocumentFilePath(
                                                newFilePath
                                                                .toAbsolutePath()
                                                                .toString());

                                if (!isBlank(oldFilePath)) {

                                        try {

                                                Path oldPath = Paths.get(
                                                                oldFilePath);

                                                if (!oldPath.equals(
                                                                newFilePath
                                                                                .toAbsolutePath())) {

                                                        Files.deleteIfExists(
                                                                        oldPath);
                                                }

                                        } catch (Exception e) {

                                                System.out.println(
                                                                "Could not delete old document: "
                                                                                + e.getMessage());
                                        }
                                }
                        }

                        // =====================================================
                        // IMPORTANT
                        //
                        // DO NOT TOUCH:
                        //
                        // createdByUserId
                        // assignedStaffUserId
                        //
                        // =====================================================

                        Member updatedMember = memberRepository.save(
                                        member);

                        return ResponseEntity.ok(
                                        updatedMember);

                } catch (IOException e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to update member document");

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to update member: "
                                                                        + e.getMessage());
                }
        }

        // =========================================================
        // DELETE MEMBER
        //
        // STAFF -> OWN MEMBER
        // ADMIN / MANAGER -> ANY MEMBER
        // =========================================================

        public ResponseEntity<?> deleteMember(

                        Long id,

                        Authentication authentication

        ) {

                try {

                        User currentUser = getAuthenticatedUser(
                                        authentication);

                        if (currentUser == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.UNAUTHORIZED)
                                                .body(
                                                                "User not found");
                        }

                        if (id == null) {

                                return ResponseEntity
                                                .badRequest()
                                                .body(
                                                                "Member ID is required");
                        }

                        Member member = memberRepository
                                        .findById(id)
                                        .orElse(null);

                        if (member == null) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.NOT_FOUND)
                                                .body(
                                                                "Member not found");
                        }

                        String roleName = getRoleName(
                                        currentUser);

                        if (!isStaffAdminManager(
                                        roleName)) {

                                return ResponseEntity
                                                .status(
                                                                HttpStatus.FORBIDDEN)
                                                .body(
                                                                "You are not allowed to delete members");
                        }

                        // =====================================================
                        // STAFF OWNERSHIP
                        // =====================================================

                        if (roleName.equals("STAFF")) {

                                if (currentUser.getId() == null
                                                || !currentUser.getId().equals(
                                                                member.getCreatedByUserId())) {

                                        return ResponseEntity
                                                        .status(
                                                                        HttpStatus.FORBIDDEN)
                                                        .body(
                                                                        "You can delete only members created by you");
                                }
                        }

                        // =====================================================
                        // DELETE DOCUMENT
                        // =====================================================

                        if (!isBlank(
                                        member.getDocumentFilePath())) {

                                try {

                                        Files.deleteIfExists(
                                                        Paths.get(
                                                                        member.getDocumentFilePath()));

                                } catch (Exception e) {

                                        System.out.println(
                                                        "Could not delete document: "
                                                                        + e.getMessage());
                                }
                        }

                        // =====================================================
                        // NOTIFICATION
                        // =====================================================

                        notificationService
                                        .notifyAllUsersForMemberDeleted(
                                                        currentUser,
                                                        member);

                        // =====================================================
                        // DELETE MEMBER
                        // =====================================================

                        memberRepository.delete(
                                        member);

                        return ResponseEntity.ok(
                                        "Member deleted successfully");

                } catch (Exception e) {

                        e.printStackTrace();

                        return ResponseEntity
                                        .status(
                                                        HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(
                                                        "Failed to delete member: "
                                                                        + e.getMessage());
                }
        }

        // =========================================================
        // CUSTOMER ID GENERATOR
        //
        // CUS001
        // CUS002
        // ...
        // =========================================================

        private String generateCustomerId() {

                long nextNumber = memberRepository.count() + 1;

                String customerId;

                do {

                        customerId = String.format(
                                        "CUS%03d",
                                        nextNumber);

                        nextNumber++;

                } while (memberRepository
                                .existsByCustomerId(
                                                customerId));

                return customerId;
        }

        // =========================================================
        // TEMPORARY CUSTOMER PASSWORD
        // =========================================================

        private String generateTemporaryPassword() {

                return UUID.randomUUID()
                                .toString()
                                .replace(
                                                "-",
                                                "")
                                .substring(
                                                0,
                                                10);
        }

        // =========================================================
        // GET AUTHENTICATED USER
        // =========================================================

        private User getAuthenticatedUser(

                        Authentication authentication

        ) {

                if (authentication == null
                                || authentication.getName() == null
                                || authentication
                                                .getName()
                                                .trim()
                                                .isEmpty()) {

                        return null;
                }

                return userRepository
                                .findByUsername(
                                                authentication.getName())
                                .orElse(null);
        }

        // =========================================================
        // ROLE NAME
        // =========================================================

        private String getRoleName(

                        User user

        ) {

                if (user == null
                                || user.getRole() == null
                                || user.getRole()
                                                .getRoleName() == null) {

                        return "";
                }

                String roleName = user.getRole()
                                .getRoleName()
                                .trim()
                                .toUpperCase();

                if (roleName.startsWith(
                                "ROLE_")) {

                        roleName = roleName.substring(
                                        5);
                }

                return roleName;
        }

        // =========================================================
        // ALLOWED ROLES
        // =========================================================

        private boolean isStaffAdminManager(

                        String roleName

        ) {

                return roleName.equals("STAFF")
                                || roleName.equals("ADMIN")
                                || roleName.equals("MANAGER");
        }

        // =========================================================
        // DISPLAY NAME
        // =========================================================

        private String getDisplayName(

                        User user

        ) {

                if (user == null) {

                        return "another user";
                }

                if (!isBlank(
                                user.getFullName())) {

                        return user
                                        .getFullName()
                                        .trim();
                }

                if (!isBlank(
                                user.getUsername())) {

                        return user
                                        .getUsername()
                                        .trim();
                }

                return "another user";
        }

        // =========================================================
        // FILE TYPE VALIDATION
        // =========================================================

        private boolean isAllowedFileType(

                        String contentType

        ) {

                if (contentType == null) {

                        return false;
                }

                return "application/pdf"
                                .equalsIgnoreCase(
                                                contentType)

                                || "image/jpeg"
                                                .equalsIgnoreCase(
                                                                contentType)

                                || "image/jpg"
                                                .equalsIgnoreCase(
                                                                contentType)

                                || "image/png"
                                                .equalsIgnoreCase(
                                                                contentType);
        }

        // =========================================================
        // FILE EXTENSION
        // =========================================================

        private String getFileExtension(

                        String fileName

        ) {

                if (fileName == null
                                || !fileName.contains(".")) {

                        return "";
                }

                return fileName
                                .substring(
                                                fileName.lastIndexOf("."))
                                .toLowerCase();
        }

        // =========================================================
        // NULL / EMPTY HELPERS
        // =========================================================

        private boolean isBlank(

                        String value

        ) {

                return value == null
                                || value.trim().isEmpty();
        }

        private String safeTrim(

                        String value

        ) {

                return value == null
                                ? ""
                                : value.trim();
        }

        private String safeString(

                        String value

        ) {

                return value == null
                                ? ""
                                : value;
        }
}