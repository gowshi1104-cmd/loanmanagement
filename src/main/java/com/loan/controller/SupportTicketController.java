package com.loan.controller;

import com.loan.dto.SupportTicketRequest;
import com.loan.dto.SupportTicketUpdateRequest;
import com.loan.entity.SupportTicket;
import com.loan.service.SupportTicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(
            SupportTicketService supportTicketService
    ) {
        this.supportTicketService = supportTicketService;
    }

    // Create ticket
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(
            @RequestBody SupportTicketRequest request,
            Authentication authentication
    ) {

        try {

            String username =
                    authentication.getName();

            SupportTicket ticket =
                    supportTicketService.createTicket(
                            request,
                            username
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ticket);

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(ex.getMessage());
        }
    }

    // Logged-in user's tickets
    @GetMapping("/tickets/my")
    public ResponseEntity<?> getMyTickets(
            Authentication authentication
    ) {

        String username =
                authentication.getName();

        List<SupportTicket> tickets =
                supportTicketService.getMyTickets(username);

        return ResponseEntity.ok(tickets);
    }

    // Admin / Manager - all tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> getAllTickets(
            Authentication authentication
    ) {

        if (!isAdminOrManager(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You don't have permission to view all support tickets"
                    );
        }

        return ResponseEntity.ok(
                supportTicketService.getAllTickets()
        );
    }

    // Admin / Manager update ticket
    @PutMapping("/tickets/{id}")
    public ResponseEntity<?> updateTicket(
            @PathVariable Long id,
            @RequestBody SupportTicketUpdateRequest request,
            Authentication authentication
    ) {

        if (!isAdminOrManager(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You don't have permission to update support tickets"
                    );
        }

        try {

            SupportTicket ticket =
                    supportTicketService.updateTicket(
                            id,
                            request
                    );

            return ResponseEntity.ok(ticket);

        } catch (RuntimeException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(ex.getMessage());
        }
    }

    private boolean isAdminOrManager(
            Authentication authentication
    ) {

        if (authentication == null) {
            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority ->
                        authority.equals("ROLE_ADMIN") ||
                        authority.equals("ROLE_MANAGER") ||
                        authority.equals("ADMIN") ||
                        authority.equals("MANAGER")
                );
    }
}