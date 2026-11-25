package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.TicketFeedbackDto;
import com.helpdesk.dto.TicketFeedbackRequest;
import com.helpdesk.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<TicketFeedbackDto>> submitFeedback(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketFeedbackRequest request) {
        TicketFeedbackDto created = feedbackService.submitFeedback(ticketId, request);
        return ResponseEntity.ok(ApiResponse.success("Thank you for your feedback!", created));
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse<TicketFeedbackDto>> getFeedback(@PathVariable Long ticketId) {
        TicketFeedbackDto feedback = feedbackService.getFeedbackForTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(feedback));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketFeedbackDto>>> getRecentFeedback() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.getAllRecentFeedback()));
    }
}
