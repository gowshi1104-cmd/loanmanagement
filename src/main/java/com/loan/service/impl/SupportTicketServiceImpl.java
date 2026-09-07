package com.loan.service.impl;

import com.loan.dto.SupportTicketRequest;
import com.loan.dto.SupportTicketUpdateRequest;
import com.loan.entity.SupportTicket;
import com.loan.repository.SupportTicketRepository;
import com.loan.service.SupportTicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    public SupportTicketServiceImpl(
            SupportTicketRepository supportTicketRepository) {
        this.supportTicketRepository = supportTicketRepository;
    }

    @Override
    public SupportTicket createTicket(
            SupportTicketRequest request,
            String username) {

        if (request == null) {
            throw new RuntimeException("Ticket request cannot be empty");
        }

        if (request.getIssueType() == null ||
                request.getIssueType().trim().isEmpty()) {
            throw new RuntimeException("Issue type is required");
        }

        if (request.getSubject() == null ||
                request.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }

        if (request.getDescription() == null ||
                request.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }

        SupportTicket ticket = new SupportTicket();

        ticket.setTicketId(generateTicketId());

        ticket.setUsername(username);

        ticket.setIssueType(
                request.getIssueType().trim());

        ticket.setSubject(
                request.getSubject().trim());

        ticket.setDescription(
                request.getDescription().trim());

        String priority = request.getPriority();

        if (priority == null ||
                priority.trim().isEmpty()) {
            priority = "MEDIUM";
        }

        ticket.setPriority(
                priority.trim().toUpperCase());

        ticket.setStatus("OPEN");

        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return supportTicketRepository.save(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> getMyTickets(String username) {

        return supportTicketRepository
                .findByUsernameOrderByCreatedAtDesc(username);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets() {

        return supportTicketRepository
                .findAllByOrderByCreatedAtDesc();
    }

    @Override
    public SupportTicket updateTicket(
            Long id,
            SupportTicketUpdateRequest request) {

        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Support ticket not found"));

        if (request.getStatus() != null &&
                !request.getStatus().trim().isEmpty()) {

            ticket.setStatus(
                    request.getStatus()
                            .trim()
                            .toUpperCase());
        }

        if (request.getAdminResponse() != null) {

            ticket.setAdminResponse(
                    request.getAdminResponse().trim());
        }

        ticket.setUpdatedAt(LocalDateTime.now());

        return supportTicketRepository.save(ticket);
    }

    private String generateTicketId() {

        long nextNumber = supportTicketRepository.count() + 1;

        while (true) {

            String ticketId = String.format(
                    "SUP-%05d",
                    nextNumber);

            boolean exists = supportTicketRepository
                    .findAll()
                    .stream()
                    .anyMatch(ticket -> ticketId.equals(ticket.getTicketId()));

            if (!exists) {
                return ticketId;
            }

            nextNumber++;
        }
    }
}