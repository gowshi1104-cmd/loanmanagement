package com.loan.service;

import com.loan.dto.SupportTicketRequest;
import com.loan.dto.SupportTicketUpdateRequest;
import com.loan.entity.SupportTicket;

import java.util.List;

public interface SupportTicketService {

    SupportTicket createTicket(
            SupportTicketRequest request,
            String username
    );

    List<SupportTicket> getMyTickets(String username);

    List<SupportTicket> getAllTickets();

    SupportTicket updateTicket(
            Long id,
            SupportTicketUpdateRequest request
    );
}