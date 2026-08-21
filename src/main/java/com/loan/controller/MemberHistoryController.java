package com.loan.controller;

import com.loan.dto.MemberHistoryResponse;
import com.loan.service.MemberHistoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member-history")
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class MemberHistoryController {

    private final MemberHistoryService memberHistoryService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public MemberHistoryController(
            MemberHistoryService memberHistoryService) {

        this.memberHistoryService =
                memberHistoryService;
    }

    // =========================================================
    // GET MEMBER COMPLETE HISTORY
    //
    // IMPORTANT:
    //
    // customerId = LN001
    //
    // URL:
    //
    // GET /api/member-history/LN001
    //
    // Backend then finds:
    //
    // LN001
    //   ↓
    // LOAN3919
    //   ↓
    // payments for LOAN3919
    //
    // =========================================================

    @GetMapping("/{customerId}")
    public ResponseEntity<MemberHistoryResponse>
    getMemberHistory(
            @PathVariable String customerId) {

        MemberHistoryResponse response =
                memberHistoryService
                        .getMemberHistory(
                                customerId
                        );

        return ResponseEntity.ok(
                response
        );
    }
}