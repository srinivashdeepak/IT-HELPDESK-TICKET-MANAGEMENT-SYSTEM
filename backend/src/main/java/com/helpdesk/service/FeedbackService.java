package com.helpdesk.service;

import com.helpdesk.dto.TicketFeedbackDto;
import com.helpdesk.dto.TicketFeedbackRequest;
import com.helpdesk.entity.*;
import com.helpdesk.exception.BadRequestException;
import com.helpdesk.exception.ResourceNotFoundException;
import com.helpdesk.exception.UnauthorizedException;
import com.helpdesk.repository.TicketFeedbackRepository;
import com.helpdesk.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private TicketFeedbackRepository feedbackRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public TicketFeedbackDto submitFeedback(Long ticketId, TicketFeedbackRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only the ticket creator can submit satisfaction feedback");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Feedback can only be provided after ticket has been resolved or closed");
        }

        if (feedbackRepository.existsByTicket_Id(ticketId)) {
            throw new BadRequestException("Feedback has already been submitted for this ticket");
        }

        TicketFeedback feedback = new TicketFeedback(
                ticket,
                currentUser,
                request.getRating(),
                request.getComments()
        );

        TicketFeedback saved = feedbackRepository.save(feedback);

        // Notify assigned agent of feedback
        if (ticket.getAssignedTo() != null) {
            notificationService.createNotification(
                    ticket.getAssignedTo(),
                    "New Feedback Received: " + request.getRating() + " Stars",
                    String.format("Employee %s submitted a %d-star rating on ticket %s: \"%s\"",
                            currentUser.getFullName(), request.getRating(), ticket.getTicketCode(),
                            request.getComments() != null ? request.getComments() : "No written comments"),
                    NotificationType.FEEDBACK_RECEIVED,
                    ticket.getId()
            );
        }

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public TicketFeedbackDto getFeedbackForTicket(Long ticketId) {
        return feedbackRepository.findByTicket_Id(ticketId).map(this::toDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<TicketFeedbackDto> getAllRecentFeedback() {
        return feedbackRepository.findAllRecent().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public double getAgentAverageRating(Long agentId) {
        Double avg = feedbackRepository.getAverageRatingForAgent(agentId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0; // default 5.0 if new
    }

    public TicketFeedbackDto toDto(TicketFeedback f) {
        return new TicketFeedbackDto(
                f.getId(),
                f.getTicket().getId(),
                f.getTicket().getTicketCode(),
                f.getUser().getId(),
                f.getUser().getFullName(),
                f.getRating(),
                f.getComments(),
                f.getCreatedAt()
        );
    }
}
