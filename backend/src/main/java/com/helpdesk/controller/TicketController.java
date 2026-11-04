package com.helpdesk.controller;

import com.helpdesk.dto.*;
import com.helpdesk.entity.TicketPriority;
import com.helpdesk.entity.TicketStatus;
import com.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean assignedToMe,
            @RequestParam(required = false) Boolean myTicketsOnly) {

        List<TicketResponse> tickets = ticketService.getTickets(
                status, priority, categoryId, query, assignedToMe, myTicketsOnly
        );
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetail(@PathVariable Long id) {
        TicketDetailResponse response = ticketService.getTicketDetail(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketAssignRequest request) {
        TicketResponse response = ticketService.assignTicket(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        TicketResponse response = ticketService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", response));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<ApiResponse<TicketResponse>> updatePriority(
            @PathVariable Long id,
            @RequestParam TicketPriority priority) {
        TicketResponse response = ticketService.updatePriority(id, priority);
        return ResponseEntity.ok(ApiResponse.success("Ticket priority updated successfully", response));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        CommentDto comment = ticketService.addComment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Comment added successfully", comment));
    }
}
