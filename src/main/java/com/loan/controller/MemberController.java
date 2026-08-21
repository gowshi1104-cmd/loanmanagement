package com.loan.controller;

import com.loan.service.MemberService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:5173")
public class MemberController {

    private final MemberService memberService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    // =========================================================
    // TEST
    // =========================================================

    @GetMapping("/test")
    public String test() {
        return "Member Controller Working";
    }

    // =========================================================
    // GET ALL MEMBERS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllMembers(
            Authentication authentication
    ) {
        return memberService.getAllMembers(authentication);
    }

    // =========================================================
    // GET MEMBER BY CUSTOMER ID
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getMemberByCustomerId(
            @PathVariable String customerId
    ) {
        return memberService.getMemberByCustomerId(customerId);
    }

    // =========================================================
    // VIEW CUSTOMER DOCUMENT
    // =========================================================

    @GetMapping("/customer/{customerId}/document")
    public ResponseEntity<?> viewCustomerDocument(
            @PathVariable String customerId
    ) {
        return memberService.viewCustomerDocument(customerId);
    }

    // =========================================================
    // DOWNLOAD CUSTOMER DOCUMENT
    // =========================================================

    @GetMapping("/customer/{customerId}/document/download")
    public ResponseEntity<?> downloadCustomerDocument(
            @PathVariable String customerId
    ) {
        return memberService.downloadCustomerDocument(customerId);
    }

    // =========================================================
    // CREATE MEMBER
    // =========================================================

    @PostMapping(
            value = "",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> createMember(

            @RequestParam("name")
            String name,

            @RequestParam("phone")
            String phone,

            @RequestParam("address")
            String address,

            @RequestParam("panNumber")
            String panNumber,

            @RequestParam("aadharNumber")
            String aadharNumber,

            @RequestParam("groupId")
            Long groupId,

            @RequestParam("groupName")
            String groupName,

            @RequestParam("status")
            String status,

            @RequestParam("document")
            MultipartFile document,

            Authentication authentication
    ) {

        return memberService.createMember(
                name,
                phone,
                address,
                panNumber,
                aadharNumber,
                groupId,
                groupName,
                status,
                document,
                authentication
        );
    }

    // =========================================================
    // GET MEMBER BY DATABASE ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getMemberById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return memberService.getMemberById(
                id,
                authentication
        );
    }

    // =========================================================
    // UPDATE MEMBER
    // =========================================================

    @PutMapping(
            value = "/{id}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> updateMember(

            @PathVariable Long id,

            @RequestParam("name")
            String name,

            @RequestParam("phone")
            String phone,

            @RequestParam("address")
            String address,

            @RequestParam("panNumber")
            String panNumber,

            @RequestParam("aadharNumber")
            String aadharNumber,

            @RequestParam("groupId")
            Long groupId,

            @RequestParam("groupName")
            String groupName,

            @RequestParam("status")
            String status,

            @RequestParam(
                    value = "document",
                    required = false
            )
            MultipartFile document,

            Authentication authentication
    ) {

        return memberService.updateMember(
                id,
                name,
                phone,
                address,
                panNumber,
                aadharNumber,
                groupId,
                groupName,
                status,
                document,
                authentication
        );
    }

    // =========================================================
    // DELETE MEMBER
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return memberService.deleteMember(
                id,
                authentication
        );
    }

    // =========================================================
    // FILE SIZE EXCEPTION
    // =========================================================

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(
                        "Total document upload size must not exceed 20 MB"
                );
    }
}